
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FavoriteButton from "./FavoriteButton";
import { useCryptoData } from "@/hooks/useCryptoData";
import { Crypto } from "@/types/crypto";

interface ConversionResultProps {
  cryptoId: string;
  amount: number;
}

const ConversionResult = ({ cryptoId, amount }: ConversionResultProps) => {
  const [crypto, setCrypto] = useState<Crypto | null>(null);
  const [valueUSD, setValueUSD] = useState<number>(0);
  const [valueBRL, setValueBRL] = useState<number>(0);
  
  const { cryptos } = useCryptoData();
  
  useEffect(() => {
    const selectedCrypto = cryptos.find((c) => c.id === cryptoId);
    
    if (selectedCrypto) {
      setCrypto(selectedCrypto);
      setValueUSD(amount * selectedCrypto.price_usd);
      setValueBRL(amount * selectedCrypto.price_brl);
    }
  }, [cryptoId, amount, cryptos]);
  
  if (!crypto) {
    return null;
  }
  
  return (
    <Card className="border-white/10 bg-secondary/20 text-nexus-light overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center">
            <img
              src={crypto.image}
              alt={crypto.name}
              className="w-6 h-6 mr-2"
            />
            {crypto.name} ({crypto.symbol})
          </CardTitle>
          <CardDescription className="text-nexus-gray">
            Conversão baseada no valor atual
          </CardDescription>
        </div>
        <FavoriteButton cryptoId={cryptoId} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-nexus-gray">Quantidade</div>
            <div className="text-xl font-bold">
              {amount} {crypto.symbol}
            </div>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium text-nexus-gray">Valor em USD</div>
                <div className="text-2xl font-bold">
                  {valueUSD.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-nexus-gray">Valor em BRL</div>
                <div className="text-2xl font-bold">
                  {valueBRL.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionResult;
