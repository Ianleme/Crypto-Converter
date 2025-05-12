import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversion } from "@/types/crypto";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export function useConversions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchConversions = async (): Promise<Conversion[]> => {
    try {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("conversions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item) => ({
        id: item.id,
        cryptoId: item.crypto_id,
        cryptoName: item.crypto_name,
        cryptoSymbol: item.crypto_symbol,
        amount: item.amount,
        valueUSD: item.result_usd,
        valueBRL: item.result_brl,
        date: item.created_at,
      }));
    } catch (error) {
      console.error("Error fetching conversions:", error);
      return [];
    }
  };

  const {
    data: conversions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversions", user?.id],
    queryFn: fetchConversions,
    enabled: !!user,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Mutation para excluir uma única conversão
  const deleteConversionMutation = useMutation({
    mutationFn: async (conversionId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("conversions")
        .delete()
        .eq("id", conversionId)
        .eq("user_id", user.id);

      if (error) throw error;
      return conversionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversions", user?.id] });
      toast({
        title: "Sucesso",
        description: "Conversão excluída com sucesso",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir conversão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversão",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir todas as conversões
  const deleteAllConversionsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("conversions")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversions", user?.id] });
      toast({
        title: "Sucesso",
        description: "Histórico de conversões limpo com sucesso",
      });
    },
    onError: (error) => {
      console.error("Erro ao limpar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o histórico",
        variant: "destructive",
      });
    },
  });

  return {
    conversions,
    isLoading,
    error,
    refetch,
    deleteConversion: deleteConversionMutation.mutate,
    isDeleting: deleteConversionMutation.isPending,
    deleteAllConversions: () => deleteAllConversionsMutation.mutate(),
    isDeletingAll: deleteAllConversionsMutation.isPending,
  };
}
