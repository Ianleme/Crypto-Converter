import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FavoriteButtonProps {
  cryptoId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FavoriteButton = ({
  cryptoId,
  size = "md",
  className,
}: FavoriteButtonProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useCryptoData();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const isFav = isFavorite(cryptoId);

  const toggleFavorite = async () => {
    if (isProcessing) return;

    if (!user) {
      toast.error("Você precisa estar logado para gerenciar favoritos");
      return;
    }

    setIsProcessing(true);

    try {
      if (isFav) {
        await removeFavorite(cryptoId);
      } else {
        await addFavorite(cryptoId);
      }
    } catch (error) {
      console.error("Erro ao gerenciar favoritos:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      disabled={isProcessing || !user}
      className={cn(
        sizeClasses[size],
        "rounded-full",
        isFav ? "text-nexus-red" : "text-muted-foreground hover:text-nexus-red",
        isProcessing && "opacity-50 cursor-wait",
        !user && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          isFav ? "fill-current" : "fill-none",
          isProcessing && "animate-pulse"
        )}
      />
    </Button>
  );
};

export default FavoriteButton;
