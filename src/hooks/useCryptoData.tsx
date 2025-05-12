import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crypto } from "@/types/crypto";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { fetchCryptoList, searchCryptos } from "@/integrations/coingecko/api";

export function useCryptoData() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { user } = useAuth();

  // Buscar lista de criptomoedas do CoinGecko
  const {
    data: cryptos = [],
    isLoading: isCryptosLoading,
    error: cryptosError,
    refetch: refetchCryptos,
  } = useQuery({
    queryKey: ["cryptos"],
    queryFn: fetchCryptoList,
    refetchInterval: 300000, // Atualiza a cada 5 minutos (antes era 1 minuto)
    staleTime: 240000, // Dados são considerados atualizados por 4 minutos
    retry: 3,
  });

  // Buscar resultados de pesquisa quando searchTerm mudar
  const { data: searchResults = [], isLoading: isSearchLoading } = useQuery({
    queryKey: ["cryptosearch", searchTerm],
    queryFn: () => searchCryptos(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 3, // Aumentado para mínimo de 3 caracteres
    staleTime: 60000, // Resultados de pesquisa são válidos por 1 minuto
  });

  const fetchFavorites = async () => {
    try {
      if (!user) {
        console.log("Não há usuário logado para buscar favoritos");
        return [];
      }

      console.log("Buscando favoritos para o usuário:", user.id);

      const { data, error } = await supabase
        .from("favorites")
        .select("crypto_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao buscar favoritos:", error);
        throw error;
      }

      console.log("Favoritos encontrados:", data);
      return data.map((item) => item.crypto_id);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  };

  const {
    data: fetchedFavorites = [],
    isLoading: isFavoritesLoading,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ["favorites", user?.id], // Adiciona o user.id como parte da chave para recarregar quando mudar
    queryFn: fetchFavorites,
    enabled: !!user,
    staleTime: 0, // Sempre recarregar quando solicitado
    refetchOnWindowFocus: true, // Recarregar quando a janela ganhar foco
  });

  useEffect(() => {
    if (user) {
      // Quando o usuário logar, recarregar os favoritos
      console.log("Usuário logado, recarregando favoritos");
    } else {
      // Quando o usuário deslogar, limpar os favoritos
      console.log("Usuário deslogado, limpando favoritos");
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    if (fetchedFavorites && fetchedFavorites.length >= 0) {
      console.log("Atualizando favoritos do estado:", fetchedFavorites);
      setFavorites(fetchedFavorites);
    }
  }, [fetchedFavorites]);

  const addFavorite = async (cryptoId: string) => {
    try {
      if (!user) {
        toast.error("Você precisa estar logado para adicionar aos favoritos");
        return;
      }

      console.log("Adicionando favorito:", cryptoId, "para usuário:", user.id);

      const { error } = await supabase.from("favorites").insert({
        crypto_id: cryptoId,
        user_id: user.id,
      });

      if (error) {
        console.error("Erro ao inserir favorito:", error);
        throw error;
      }

      // Atualiza imediatamente o estado local
      setFavorites((prev) => [...prev, cryptoId]);

      // Recarrega os favoritos do servidor
      refetchFavorites();

      toast.success("Adicionado aos favoritos");
    } catch (error: any) {
      console.error("Error adding favorite:", error);
      toast.error("Erro ao adicionar favorito");
    }
  };

  const removeFavorite = async (cryptoId: string) => {
    try {
      if (!user) {
        toast.error("Você precisa estar logado para remover dos favoritos");
        return;
      }

      console.log("Removendo favorito:", cryptoId, "para usuário:", user.id);

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("crypto_id", cryptoId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao remover favorito:", error);
        throw error;
      }

      // Atualiza imediatamente o estado local
      setFavorites((prev) => prev.filter((id) => id !== cryptoId));

      // Recarrega os favoritos do servidor
      refetchFavorites();

      toast.success("Removido dos favoritos");
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      toast.error("Erro ao remover favorito");
    }
  };

  const isFavorite = (cryptoId: string) => {
    return favorites.includes(cryptoId);
  };

  const addConversion = async (conversion: {
    cryptoId: string;
    cryptoName: string;
    cryptoSymbol: string;
    amount: number;
    valueUSD: number;
    valueBRL: number;
  }) => {
    try {
      if (!user) {
        toast.error("Você precisa estar logado para salvar conversões");
        return false;
      }

      const { error } = await supabase.from("conversions").insert({
        crypto_id: conversion.cryptoId,
        crypto_name: conversion.cryptoName,
        crypto_symbol: conversion.cryptoSymbol,
        amount: conversion.amount,
        result_usd: conversion.valueUSD,
        result_brl: conversion.valueBRL,
        user_id: user.id,
      });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error("Error adding conversion:", error);
      toast.error("Erro ao salvar conversão");
      return false;
    }
  };

  return {
    cryptos,
    isCryptosLoading,
    cryptosError,
    favorites,
    isFavoritesLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    addConversion,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchLoading,
    refetchCryptos,
    refetchFavorites,
  };
}
