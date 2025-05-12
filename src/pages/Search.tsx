import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCryptoData } from "@/hooks/useCryptoData";
import FavoriteButton from "@/components/FavoriteButton";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const {
    cryptos,
    isCryptosLoading,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchLoading,
  } = useCryptoData();

  // Usar debounce para a pesquisa com useCallback
  const debouncedSearch = useCallback(
    (value: string) => {
      if (value.length >= 3) {
        setSearchTerm(value);
      } else if (searchTerm) {
        // Limpar a pesquisa se o valor for menor que 3 caracteres
        setSearchTerm("");
      }
    },
    [searchTerm, setSearchTerm]
  );

  // Usar useEffect para implementar o debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(inputValue);
    }, 700); // Aumentado para 700ms para reduzir chamadas durante a digitação

    return () => clearTimeout(timer);
  }, [inputValue, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCryptoClick = (cryptoId: string) => {
    navigate(`/convert/${cryptoId}`);
  };

  // Exibir resultados da pesquisa ou lista de criptomoedas mais populares
  const displayData =
    searchTerm && searchTerm.length >= 3 ? searchResults : cryptos.slice(0, 20); // Mostrar apenas as 20 primeiras por padrão

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pesquisar Criptomoedas
      </h1>

      <div className="space-y-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-nexus-gray" />
          <Input
            type="text"
            placeholder="Digite pelo menos 3 caracteres para buscar..."
            className="pl-10 bg-secondary/20"
            value={inputValue}
            onChange={handleSearchChange}
          />
          {inputValue.length > 0 && inputValue.length < 3 && (
            <p className="text-sm text-nexus-gray mt-1">
              Digite pelo menos 3 caracteres para iniciar a busca
            </p>
          )}
        </div>

        <div className="space-y-4">
          {isCryptosLoading || isSearchLoading ? (
            // Carregando
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center p-4 bg-secondary/20 rounded-md"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            ))
          ) : displayData.length === 0 ? (
            // Sem resultados
            <Card className="border-white/10 bg-secondary/20 text-nexus-light">
              <CardContent className="pt-6">
                <p className="text-center text-nexus-gray">
                  Nenhum resultado encontrado. Tente outra pesquisa.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Resultados
            <Card className="border-white/10 bg-secondary/20 text-nexus-light">
              <CardHeader>
                <CardTitle>
                  {searchTerm && searchTerm.length >= 3
                    ? "Resultados da pesquisa"
                    : "Criptomoedas Populares"}
                </CardTitle>
                <CardDescription>
                  {searchTerm && searchTerm.length >= 3
                    ? `Mostrando resultados para "${searchTerm}"`
                    : "As criptomoedas mais populares no mercado"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 py-0">
                <div className="divide-y divide-white/10">
                  {displayData.map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer"
                      onClick={() => handleCryptoClick(crypto.id)}
                    >
                      <div className="flex items-center">
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-10 h-10 mr-3"
                        />
                        <div>
                          <h3 className="font-semibold">{crypto.name}</h3>
                          <p className="text-sm text-nexus-gray">
                            {crypto.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="font-medium">
                            {crypto.price_usd.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 8,
                            })}
                          </p>
                          <p className="text-sm text-nexus-gray">
                            {crypto.price_brl.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              maximumFractionDigits: 8,
                            })}
                          </p>
                        </div>
                        <FavoriteButton
                          cryptoId={crypto.id}
                          size="sm"
                          className="ml-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
