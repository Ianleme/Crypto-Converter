import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoData } from "@/hooks/useCryptoData";
import { getCryptoDetails } from "@/integrations/coingecko/api";
import { useToast } from "@/components/ui/use-toast";
import { useConversions } from "@/hooks/useConversions";
import FavoriteButton from "@/components/FavoriteButton";
import { Crypto } from "@/types/crypto";

const conversionSchema = z.object({
  amount: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: "A quantidade é obrigatória",
        invalid_type_error: "A quantidade deve ser um número válido",
      })
      .positive({ message: "A quantidade deve ser maior que zero" })
  ),
  targetCurrency: z.string().min(1, {
    message: "Selecione uma moeda para conversão",
  }),
});

type ConversionFormValues = z.infer<typeof conversionSchema>;

const Convert = () => {
  const { cryptoId } = useParams<{ cryptoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addConversion } = useCryptoData();
  const { refetch } = useConversions();

  const [crypto, setCrypto] = useState<Crypto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversionResult, setConversionResult] = useState<{
    amount: number;
    value: number;
    currency: string;
  } | null>(null);

  const form = useForm<ConversionFormValues>({
    resolver: zodResolver(conversionSchema),
    defaultValues: {
      amount: undefined,
      targetCurrency: "USD",
    },
  });

  useEffect(() => {
    const fetchCryptoDetails = async () => {
      if (!cryptoId) return;

      setIsLoading(true);
      try {
        const cryptoData = await getCryptoDetails(cryptoId);
        setCrypto(cryptoData);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da criptomoeda",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoDetails();
  }, [cryptoId, toast]);

  const onSubmit = async (values: ConversionFormValues) => {
    if (!crypto) return;

    try {
      const { amount, targetCurrency } = values;
      let convertedValue = 0;

      if (targetCurrency === "USD") {
        convertedValue = amount * crypto.price_usd;
      } else if (targetCurrency === "BRL") {
        convertedValue = amount * crypto.price_brl;
      }

      setConversionResult({
        amount,
        value: convertedValue,
        currency: targetCurrency,
      });

      // Adicionar à conversão histórica
      await addConversion({
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoSymbol: crypto.symbol,
        amount,
        valueUSD:
          targetCurrency === "USD" ? convertedValue : amount * crypto.price_usd,
        valueBRL:
          targetCurrency === "BRL" ? convertedValue : amount * crypto.price_brl,
      });

      // Atualizar histórico
      refetch();

      toast({
        title: "Conversão realizada",
        description: `${amount} ${crypto.symbol} convertido com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro na conversão",
        description: "Ocorreu um erro ao processar sua conversão",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-2/3" />
        </div>
        <Card className="border-white/10 bg-secondary/20 text-nexus-light">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-1/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Criptomoeda não encontrada
        </h1>
        <Card className="border-white/10 bg-secondary/20 text-nexus-light">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">
              A criptomoeda que você está procurando não foi encontrada.
            </p>
            <Button
              className="bg-nexus-red hover:bg-nexus-red/90"
              onClick={() => navigate("/")}
            >
              Voltar para a página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold flex-1">Converter {crypto.symbol}</h1>
        <FavoriteButton cryptoId={crypto.id} size="md" />
      </div>

      <div className="space-y-8">
        <Card className="border-white/10 bg-secondary/20 text-nexus-light">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-10 h-10 mr-3"
              />
              <div>
                <CardTitle className="text-xl">{crypto.name}</CardTitle>
                <CardDescription className="text-nexus-gray">
                  {crypto.symbol} • USD $
                  {crypto.price_usd.toLocaleString("en-US", {
                    maximumFractionDigits: 8,
                  })}
                  • BRL R$
                  {crypto.price_brl.toLocaleString("pt-BR", {
                    maximumFractionDigits: 8,
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de {crypto.symbol}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          min="0.000001"
                          placeholder="Ex: 0.5"
                          className="bg-secondary/20"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              field.onChange("");
                            } else {
                              const numericValue = parseFloat(value);
                              field.onChange(
                                isNaN(numericValue) ? value : numericValue
                              );
                            }
                          }}
                          value={
                            field.value === undefined ||
                            field.value === null ||
                            isNaN(field.value as number)
                              ? ""
                              : field.value
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Converter para</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary/20">
                            <SelectValue placeholder="Selecione uma moeda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="BRL">Real (BRL)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-nexus-red hover:bg-nexus-red/90"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Converter
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {conversionResult && (
          <Card className="border-white/10 bg-secondary/20 text-nexus-light">
            <CardHeader>
              <CardTitle>Resultado da Conversão</CardTitle>
              <CardDescription>
                Baseado no valor atual de mercado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-nexus-gray mb-1">Você tem</p>
                  <div className="flex items-center">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-2xl font-bold">
                      {conversionResult.amount} {crypto.symbol}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-nexus-gray mb-1">Equivale a</p>
                  <p className="text-2xl font-bold">
                    {conversionResult.currency === "USD"
                      ? conversionResult.value.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })
                      : conversionResult.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Convert;
