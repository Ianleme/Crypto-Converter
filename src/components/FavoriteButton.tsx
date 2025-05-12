
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCryptoData } from "@/hooks/useCryptoData";

interface FavoriteButtonProps {
  cryptoId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FavoriteButton = ({ cryptoId, size = "md", className }: FavoriteButtonProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useCryptoData();
  
  const isFav = isFavorite(cryptoId);
  
  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(cryptoId);
    } else {
      addFavorite(cryptoId);
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
      onClick={toggleFavorite}
      className={cn(
        sizeClasses[size],
        "rounded-full",
        isFav ? "text-nexus-red" : "text-muted-foreground hover:text-nexus-red",
        className
      )}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(isFav ? "fill-current" : "fill-none")}
      />
    </Button>
  );
};

export default FavoriteButton;
