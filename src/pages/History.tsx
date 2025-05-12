import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, ArrowRightLeft, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversions } from "@/hooks/useConversions";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversions, isLoading, deleteAllConversions, isDeletingAll } =
    useConversions();
  const [currency, setCurrency] = useState<"USD" | "BRL">("USD");

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "USD" ? "BRL" : "USD"));
  };

  // Se o usuário não estiver logado, exibir mensagem pedindo login
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Histórico de Conversões
        </h1>

        <Card className="border-white/10 bg-secondary/20 text-nexus-light">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
            <HistoryIcon className="h-12 w-12 mb-4 text-nexus-red" />
            <h2 className="text-xl font-semibold mb-2">
              Você precisa estar logado
            </h2>
            <p className="text-center text-nexus-gray mb-4">
              Faça login para acessar seu histórico de conversões
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">
          Histórico de Conversões
        </h1>
      </div>

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
        ) : conversions.length === 0 ? (
          // Sem histórico
          <Card className="border-white/10 bg-secondary/20 text-nexus-light">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
              <HistoryIcon className="h-12 w-12 mb-4 text-nexus-gray" />
              <h2 className="text-xl font-semibold mb-2">
                Sem histórico de conversões
              </h2>
              <p className="text-center text-nexus-gray mb-4">
                Você ainda não realizou nenhuma conversão
              </p>
              <Button
                className="bg-nexus-red hover:bg-nexus-red/90"
                onClick={() => navigate("/")}
              >
                Realizar uma Conversão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-end items-center mb-4">
              <Button
                variant="outline"
                onClick={toggleCurrency}
                className="text-sm"
              >
                Mostrar em {currency === "USD" ? "BRL" : "USD"}
              </Button>
            </div>

            <Card className="border-white/10 bg-secondary/20 text-nexus-light">
              <CardContent className="px-0 py-0">
                <div className="divide-y divide-white/10">
                  {conversions.map((conversion) => (
                    <div
                      key={conversion.id}
                      className="p-4 hover:bg-white/5 cursor-pointer"
                      onClick={() =>
                        navigate(`/convert/${conversion.cryptoId}`)
                      }
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <ArrowRightLeft className="h-4 w-4 mr-2 text-nexus-gray" />
                          <span className="font-medium">
                            {conversion.amount} {conversion.cryptoSymbol}
                          </span>
                        </div>
                        <span className="text-sm text-nexus-gray">
                          {format(
                            new Date(conversion.date),
                            "dd 'de' MMMM, HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-nexus-gray">
                          {conversion.cryptoName}
                        </span>
                        <span className="font-semibold">
                          {currency === "USD"
                            ? conversion.valueUSD.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })
                            : conversion.valueBRL.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
