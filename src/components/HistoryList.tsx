import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  TrashIcon,
  AlertCircle,
} from "lucide-react";
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
import { useConversions } from "@/hooks/useConversions";

const HistoryList = () => {
  const {
    conversions,
    isLoading,
    deleteConversion,
    isDeleting,
    deleteAllConversions,
    isDeletingAll,
  } = useConversions();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const sortedConversions = [...conversions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-secondary/20 text-nexus-light">
        <CardHeader>
          <CardTitle>Histórico de Conversões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-nexus-red"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversions.length === 0) {
    return (
      <Card className="border-white/10 bg-secondary/20 text-nexus-light">
        <CardHeader>
          <CardTitle>Histórico de Conversões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-nexus-gray">
            <p>Nenhuma conversão realizada ainda.</p>
            <p className="text-sm mt-2">
              Faça sua primeira conversão na página inicial.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-secondary/20 text-nexus-light">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Conversões</CardTitle>
        <div className="flex items-center gap-2">
          {/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-nexus-red hover:text-white hover:bg-nexus-red/20 hover:border-nexus-red"
              >
                <TrashIcon size={16} className="mr-1" />
                Limpar Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-secondary/90 border-white/10 text-nexus-light">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-nexus-light">
                  Limpar todo o histórico?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-nexus-gray">
                  Esta ação não pode ser desfeita. Todos os registros de
                  conversões serão permanentemente removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary/50 text-nexus-light border-white/10 hover:bg-secondary/30 hover:text-nexus-light">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-nexus-red hover:bg-nexus-red/90"
                  onClick={() => deleteAllConversions()}
                  disabled={isDeletingAll}
                >
                  {isDeletingAll ? "Limpando..." : "Limpar Tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSortDirection}
            className="flex items-center gap-1 text-sm"
          >
            Data
            {sortDirection === "asc" ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Criptomoeda</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Valor USD</TableHead>
              <TableHead>Valor BRL</TableHead>
              <TableHead className="text-right">Data</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConversions.map((conversion) => (
              <TableRow key={conversion.id} className="border-white/10">
                <TableCell className="font-medium">
                  {conversion.cryptoName} ({conversion.cryptoSymbol})
                </TableCell>
                <TableCell>
                  {conversion.amount} {conversion.cryptoSymbol}
                </TableCell>
                <TableCell>
                  {conversion.valueUSD.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </TableCell>
                <TableCell>
                  {conversion.valueBRL.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell className="text-right text-sm text-nexus-gray">
                  {formatDistanceToNow(new Date(conversion.date), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-nexus-gray hover:text-nexus-red"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-secondary/90 border-white/10 text-nexus-light">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-nexus-light">
                          Excluir conversão?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-nexus-gray">
                          Esta ação não pode ser desfeita. Este registro será
                          permanentemente removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary/50 text-nexus-light border-white/10 hover:bg-secondary/30 hover:text-nexus-light">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-nexus-red hover:bg-nexus-red/90"
                          onClick={() => deleteConversion(conversion.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistoryList;
