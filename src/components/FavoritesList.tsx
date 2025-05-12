
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FavoriteButton from "./FavoriteButton";
import { useCryptoData } from "@/hooks/useCryptoData";

const FavoritesList = () => {
  const { favorites, cryptos, isCryptosLoading, isFavoritesLoading } = useCryptoData();
  
  const favoriteCryptos = cryptos.filter((crypto) => favorites.includes(crypto.id));

  if (isCryptosLoading || isFavoritesLoading) {
    return (
      <Card className="border-white/10 bg-secondary/20 text-nexus-light">
        <CardHeader>
          <CardTitle>Criptomoedas Favoritas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-nexus-red"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (favoriteCryptos.length === 0) {
    return (
      <Card className="border-white/10 bg-secondary/20 text-nexus-light">
        <CardHeader>
          <CardTitle>Criptomoedas Favoritas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-nexus-gray">
            <p>Você ainda não tem favoritos.</p>
            <p className="text-sm mt-2">Adicione favoritos ao clicar no ícone de coração.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-white/10 bg-secondary/20 text-nexus-light">
      <CardHeader>
        <CardTitle>Criptomoedas Favoritas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteCryptos.map((crypto) => (
            <Card key={crypto.id} className="border-white/10 bg-secondary/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-10 h-10 mr-3"
                    />
                    <div>
                      <h3 className="font-medium">{crypto.name}</h3>
                      <p className="text-sm text-nexus-gray">{crypto.symbol}</p>
                    </div>
                  </div>
                  <FavoriteButton cryptoId={crypto.id} size="sm" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-nexus-gray">USD</p>
                    <p className="font-medium">${crypto.price_usd.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-nexus-gray">BRL</p>
                    <p className="font-medium">R${crypto.price_brl.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoritesList;
