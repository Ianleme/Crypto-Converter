import { useState, useEffect } from "react";
import { Check, ChevronDown, Search, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Crypto } from "@/types/crypto";
import { useCryptoData } from "@/hooks/useCryptoData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CryptoDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const CryptoDropdown = ({ value, onChange }: CryptoDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    cryptos,
    favorites,
    isCryptosLoading,
    refetchCryptos,
    cryptosError,
    addFavorite,
    removeFavorite,
    isFavorite,
  } = useCryptoData();

  // Inicializar com array vazio em vez de cryptos
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);

  // Efeito para atualizar filteredCryptos quando cryptos mudar
  useEffect(() => {
    // Só atualiza se cryptos for um array e não estiver vazio
    if (cryptos && Array.isArray(cryptos) && cryptos.length > 0) {
      setFilteredCryptos(cryptos);
    }
  }, [cryptos]);

  // Efeito para atualizar selectedCrypto quando value ou cryptos mudar
  useEffect(() => {
    if (value && cryptos && Array.isArray(cryptos) && cryptos.length > 0) {
      const selected = cryptos.find((crypto) => crypto.id === value);
      setSelectedCrypto(selected || null);
    } else {
      setSelectedCrypto(null);
    }
  }, [value, cryptos]);

  // Efeito para atualizar filteredCryptos quando searchQuery mudar
  useEffect(() => {
    if (!cryptos || !Array.isArray(cryptos) || cryptos.length === 0) {
      return; // Não fazer nada se cryptos não estiver disponível
    }

    if (searchQuery) {
      const filtered = cryptos.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCryptos(filtered);
    } else {
      setFilteredCryptos(cryptos);
    }
  }, [searchQuery, cryptos]);

  const handleRefresh = async () => {
    try {
      await refetchCryptos();
      toast.success("Lista de criptomoedas atualizada");
    } catch (error) {
      toast.error("Erro ao atualizar lista de criptomoedas");
    }
  };

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    cryptoId: string
  ) => {
    e.stopPropagation(); // Evita que o clique feche o dropdown ou selecione a moeda

    if (isFavorite(cryptoId)) {
      await removeFavorite(cryptoId);
    } else {
      await addFavorite(cryptoId);
    }
  };

  if (isCryptosLoading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between bg-secondary/20 text-nexus-light border border-nexus-gray/30 h-12"
        disabled
      >
        <span className="opacity-50">Carregando criptomoedas...</span>
      </Button>
    );
  }

  if (cryptosError || (cryptos && cryptos.length === 0)) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-between bg-secondary/20 text-nexus-light border border-nexus-gray/30 h-12"
          disabled
        >
          <span className="opacity-50">Erro ao carregar criptomoedas</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Garantir que filteredCryptos seja um array antes de usar
  const safeFilteredCryptos = Array.isArray(filteredCryptos)
    ? filteredCryptos
    : [];

  // Calcular groupedCryptos aqui dentro, após as verificações e com dados seguros
  const groupedCryptos = {
    favorites: safeFilteredCryptos.filter(
      (crypto) => Array.isArray(favorites) && favorites.includes(crypto.id)
    ),
    others: safeFilteredCryptos.filter(
      (crypto) => !Array.isArray(favorites) || !favorites.includes(crypto.id)
    ),
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-secondary/20 text-nexus-light border border-nexus-gray/30 h-12 hover:bg-secondary/30 hover:border-nexus-gray/50 transition-all duration-200 shadow-sm"
        >
          {selectedCrypto ? (
            <div className="flex items-center">
              <img
                src={selectedCrypto.image}
                alt={selectedCrypto.name}
                className="w-6 h-6 mr-2 rounded-full shadow-sm"
              />
              <span className="font-medium">
                {selectedCrypto.name}
                <span className="text-nexus-gray ml-1">
                  ({selectedCrypto.symbol.toUpperCase()})
                </span>
              </span>
            </div>
          ) : (
            "Selecionar Criptomoeda"
          )}
          <div className="flex items-center">
            {selectedCrypto && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="inline-flex items-center justify-center h-7 w-7 mr-1 opacity-70 hover:opacity-100 rounded-full hover:bg-nexus-gray/10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedCrypto) {
                          handleToggleFavorite(e, selectedCrypto.id);
                        }
                      }}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          selectedCrypto && isFavorite(selectedCrypto.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-nexus-gray"
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedCrypto && isFavorite(selectedCrypto.id)
                      ? "Remover dos favoritos"
                      : "Adicionar aos favoritos"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border border-nexus-gray/30 bg-secondary/90 backdrop-blur-md shadow-xl rounded-lg overflow-hidden">
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-nexus-gray/20 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-nexus-gray" />
            <CommandInput
              placeholder="Buscar criptomoeda..."
              className="border-0 focus:ring-0 focus:border-0 py-1 text-nexus-light placeholder:text-nexus-gray/70 bg-transparent"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <CommandEmpty>
            <div className="p-4 text-center">
              <p className="text-sm text-nexus-gray mb-3">
                Nenhuma criptomoeda encontrada.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center border-nexus-gray/30 text-nexus-light hover:bg-secondary/50"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar lista
              </Button>
            </div>
          </CommandEmpty>

          <div className="max-h-[300px] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-nexus-gray/20 scrollbar-track-transparent">
            {/* Favoritos */}
            {groupedCryptos.favorites.length > 0 && (
              <CommandGroup heading="Favoritos">
                {groupedCryptos.favorites.map((crypto) => (
                  <CommandItem
                    key={`fav-${crypto.id}`}
                    onSelect={() => {
                      onChange(crypto.id);
                      setOpen(false);
                    }}
                    className="flex items-center py-2 px-3 cursor-pointer hover:bg-nexus-gray/10 text-nexus-light"
                  >
                    <div className="flex items-center flex-1">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-6 h-6 mr-2 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-xs text-nexus-gray">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-3">
                        <div className="text-sm">
                          $
                          {crypto.price_usd.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </div>
                        <div className="text-xs text-nexus-gray">
                          R$
                          {crypto.price_brl.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </div>
                      </div>
                      <div
                        className="p-1 rounded-full hover:bg-nexus-gray/10"
                        onClick={(e) => handleToggleFavorite(e, crypto.id)}
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      {value === crypto.id && (
                        <Check className="h-4 w-4 text-green-500 ml-1" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Outras Criptomoedas */}
            <CommandGroup heading="Todas as Criptomoedas">
              {groupedCryptos.others.map((crypto) => (
                <CommandItem
                  key={crypto.id}
                  onSelect={() => {
                    onChange(crypto.id);
                    setOpen(false);
                  }}
                  className="flex items-center py-2 px-3 cursor-pointer hover:bg-nexus-gray/10 text-nexus-light"
                >
                  <div className="flex items-center flex-1">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-6 h-6 mr-2 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-xs text-nexus-gray">
                        {crypto.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className="text-sm">
                        $
                        {crypto.price_usd.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </div>
                      <div className="text-xs text-nexus-gray">
                        R$
                        {crypto.price_brl.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </div>
                    </div>
                    <div
                      className="p-1 rounded-full hover:bg-nexus-gray/10"
                      onClick={(e) => handleToggleFavorite(e, crypto.id)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          isFavorite(crypto.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-nexus-gray"
                        )}
                      />
                    </div>
                    {value === crypto.id && (
                      <Check className="h-4 w-4 text-green-500 ml-1" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CryptoDropdown;
