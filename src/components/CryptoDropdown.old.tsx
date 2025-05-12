import { useState, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
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
import { Crypto } from "@/types/crypto";
import { useCryptoData } from "@/hooks/useCryptoData";

interface CryptoDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const CryptoDropdown = ({ value, onChange }: CryptoDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cryptos, favorites, isCryptosLoading } = useCryptoData();

  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>(cryptos);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);

  useEffect(() => {
    if (value) {
      const selected = cryptos.find((crypto) => crypto.id === value);
      setSelectedCrypto(selected || null);
    } else {
      setSelectedCrypto(null);
    }
  }, [value, cryptos]);

  useEffect(() => {
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

  // Group cryptos with favorites first
  const groupedCryptos = {
    favorites: filteredCryptos.filter((crypto) =>
      favorites.includes(crypto.id)
    ),
    others: filteredCryptos.filter((crypto) => !favorites.includes(crypto.id)),
  };

  if (isCryptosLoading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between bg-secondary/20"
        disabled
      >
        <span className="opacity-50">Carregando criptomoedas...</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-secondary/20"
        >
          {selectedCrypto ? (
            <div className="flex items-center">
              <img
                src={selectedCrypto.image}
                alt={selectedCrypto.name}
                className="w-5 h-5 mr-2"
              />
              <span>
                {selectedCrypto.name} ({selectedCrypto.symbol})
              </span>
            </div>
          ) : (
            "Selecionar Criptomoeda"
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Buscar criptomoeda..."
              className="border-0 focus:ring-0 focus:border-0 py-3"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <CommandEmpty>Nenhuma criptomoeda encontrada.</CommandEmpty>

          {groupedCryptos.favorites.length > 0 && (
            <CommandGroup heading="Favoritos">
              {groupedCryptos.favorites.map((crypto) => (
                <CommandItem
                  key={crypto.id}
                  value={crypto.id}
                  onSelect={() => {
                    onChange(crypto.id);
                    setOpen(false);
                  }}
                  className="flex items-center py-2"
                >
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    {crypto.name} ({crypto.symbol})
                  </span>
                  {value === crypto.id && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Todas as criptomoedas">
            {groupedCryptos.others.map((crypto) => (
              <CommandItem
                key={crypto.id}
                value={crypto.id}
                onSelect={() => {
                  onChange(crypto.id);
                  setOpen(false);
                }}
                className="flex items-center py-2"
              >
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="w-5 h-5 mr-2"
                />
                <span>
                  {crypto.name} ({crypto.symbol})
                </span>
                {value === crypto.id && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CryptoDropdown;
