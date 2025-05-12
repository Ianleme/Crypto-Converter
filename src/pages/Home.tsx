import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { conversionSchema, ConversionFormValues } from "@/lib/schemas";
import CryptoDropdown from "@/components/CryptoDropdown";
import { useToast } from "@/components/ui/use-toast";
import { useCryptoData } from "@/hooks/useCryptoData";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cryptos, isCryptosLoading } = useCryptoData();

  const form = useForm<ConversionFormValues>({
    resolver: zodResolver(conversionSchema),
    defaultValues: {
      cryptoId: "",
    },
  });

  const onSubmit = (values: ConversionFormValues) => {
    try {
      const selectedCrypto = cryptos.find(
        (crypto) => crypto.id === values.cryptoId
      );

      if (selectedCrypto) {
        // Redirecionar para a página de conversão específica
        navigate(`/convert/${selectedCrypto.id}`);
      } else {
        toast({
          title: "Erro na seleção",
          description: "Por favor, selecione uma criptomoeda válida",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua seleção",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Conversor de Criptomoedas
      </h1>

      <div className="space-y-8">
        <Card className="border-white/10 bg-secondary/20 text-nexus-light">
          <CardHeader>
            <CardTitle>Nova Conversão</CardTitle>
            <CardDescription>
              Selecione uma criptomoeda para converter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="cryptoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criptomoeda</FormLabel>
                      <FormControl>
                        <CryptoDropdown
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-nexus-red hover:bg-nexus-red/90"
                  disabled={isCryptosLoading || !form.getValues().cryptoId}
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Continuar para Conversão
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-white/10 bg-secondary/20 text-nexus-light h-full flex flex-col">
            <CardHeader>
              <CardTitle>Pesquisar Criptomoedas</CardTitle>
              <CardDescription>
                Encontre qualquer criptomoeda por nome ou símbolo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button
                className="w-full bg-secondary/30 hover:bg-secondary/50 py-6"
                onClick={() => navigate("/search")}
              >
                Ir para Pesquisa
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-secondary/20 text-nexus-light h-full flex flex-col">
            <CardHeader>
              <CardTitle>Suas Conversões</CardTitle>
              <CardDescription>
                Acesse seu histórico de conversões
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button
                className="w-full bg-secondary/30 hover:bg-secondary/50 py-6"
                onClick={() => navigate("/history")}
              >
                Ver Histórico
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
