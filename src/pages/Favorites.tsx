import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoData } from "@/hooks/useCryptoData";
import FavoriteButton from "@/components/FavoriteButton";
import { useAuth } from "@/hooks/useAuth";

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cryptos, isCryptosLoading, favorites, isFavoritesLoading } =
    useCryptoData();

  // Filtrar apenas as criptomoedas favoritas
  const favoriteCryptos = cryptos.filter((crypto) =>
    favorites.includes(crypto.id)
  );

  const handleCryptoClick = (cryptoId: string) => {
    navigate(`/convert/${cryptoId}`);
  };

  const isLoading = isCryptosLoading || isFavoritesLoading;

  // Se o usuário não estiver logado, exibir mensagem pedindo login
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Meus Favoritos</h1>

        <Card className="border-white/10 bg-secondary/20 text-nexus-light">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <Heart className="h-12 w-12 mb-4 text-nexus-red" />
            <h2 className="text-xl font-semibold mb-2">
              Você precisa estar logado
            </h2>
            <p className="text-center text-nexus-gray mb-4">
              Faça login para acessar suas criptomoedas favoritas
            </p>
            <Button
              className="bg-nexus-red hover:bg-nexus-red/90"
              onClick={() => navigate("/login")}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Meus Favoritos</h1>

      <div className="space-y-4">
        {isLoading ? (
          // Carregando
          Array.from({ length: 3 }).map((_, i) => (
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
        ) : favoriteCryptos.length === 0 ? (
          // Sem favoritos
          <Card className="border-white/10 bg-secondary/20 text-nexus-light">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
              <Heart className="h-12 w-12 mb-4 text-nexus-gray" />
              <h2 className="text-xl font-semibold mb-2">
                Sem favoritos ainda
              </h2>
              <p className="text-center text-nexus-gray mb-4">
                Adicione criptomoedas aos favoritos para vê-las aqui
              </p>
              <Button
                className="bg-nexus-red hover:bg-nexus-red/90"
                onClick={() => navigate("/search")}
              >
                Buscar Criptomoedas
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Lista de favoritos
          <Card className="border-white/10 bg-secondary/20 text-nexus-light">
            <CardHeader>
              <CardTitle>Suas Criptomoedas Favoritas</CardTitle>
              <CardDescription>
                {favoriteCryptos.length}{" "}
                {favoriteCryptos.length === 1
                  ? "criptomoeda favorita"
                  : "criptomoedas favoritas"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="divide-y divide-white/10">
                {favoriteCryptos.map((crypto) => (
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
  );
};

export default Favorites;
