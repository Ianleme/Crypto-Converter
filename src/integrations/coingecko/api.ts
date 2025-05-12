import { Crypto } from "@/types/crypto";

// URL do servidor proxy em vez da API do CoinGecko
// Detecta automaticamente se estamos em produção ou desenvolvimento
const PROXY_API_URL = import.meta.env.PROD
  ? "https://api.coingecko.com/api/v3" // Em produção, usa a API do CoinGecko diretamente
  : "http://localhost:3001/api"; // Em desenvolvimento, usa localhost

// Chave API do CoinGecko (se disponível)
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || "";

// Função auxiliar para adicionar a chave API às URLs do CoinGecko (apenas em produção)
const addApiKey = (url: string): string => {
  if (import.meta.env.PROD && API_KEY) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}x_cg_pro_api_key=${API_KEY}`;
  }
  return url;
};

export interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

export const fetchCryptoList = async (): Promise<Crypto[]> => {
  try {
    if (import.meta.env.PROD) {
      // Em produção, precisamos fazer duas chamadas separadas (USD e BRL)
      const [usdResponse, brlResponse] = await Promise.all([
        fetch(
          addApiKey(
            `${PROXY_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
          )
        ),
        fetch(
          addApiKey(
            `${PROXY_API_URL}/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
          )
        ),
      ]);

      if (!usdResponse.ok || !brlResponse.ok) {
        throw new Error("Falha ao buscar dados de criptomoedas");
      }

      const usdData = await usdResponse.json();
      const brlData = await brlResponse.json();

      // Combinar dados USD e BRL
      return usdData.map((usdCoin: any) => {
        const brlCoin = brlData.find((coin: any) => coin.id === usdCoin.id);
        return {
          id: usdCoin.id,
          name: usdCoin.name,
          symbol: usdCoin.symbol.toUpperCase(),
          price_usd: usdCoin.current_price || 0,
          price_brl: brlCoin?.current_price || 0,
          image: usdCoin.image,
        };
      });
    } else {
      // Em desenvolvimento, usar o servidor proxy que já combina USD e BRL
      const response = await fetch(
        `${PROXY_API_URL}/coins/markets?vs_currencies=usd,brl&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar dados de criptomoedas");
      }

      const data = await response.json();

      // Mapeamento dos dados combinados
      return data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price_usd: coin.current_price?.usd || 0,
        price_brl: coin.current_price?.brl || 0,
        image: coin.image,
      }));
    }
  } catch (error) {
    console.error("Erro ao buscar dados de criptomoedas:", error);
    throw error;
  }
};

export const searchCryptos = async (query: string): Promise<Crypto[]> => {
  try {
    // Usando o servidor proxy para buscar resultados de pesquisa
    const response = await fetch(
      import.meta.env.PROD
        ? addApiKey(
            `${PROXY_API_URL}/search?query=${encodeURIComponent(query)}`
          )
        : `${PROXY_API_URL}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar resultados de pesquisa");
    }

    const data = await response.json();
    const coinIds = data.coins.slice(0, 20).map((coin: any) => coin.id);

    if (coinIds.length === 0) {
      return [];
    }

    if (import.meta.env.PROD) {
      // Em produção, precisamos fazer duas chamadas separadas (USD e BRL)
      const [usdResponse, brlResponse] = await Promise.all([
        fetch(
          addApiKey(
            `${PROXY_API_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(
              ","
            )}&order=market_cap_desc&sparkline=false`
          )
        ),
        fetch(
          addApiKey(
            `${PROXY_API_URL}/coins/markets?vs_currency=brl&ids=${coinIds.join(
              ","
            )}&order=market_cap_desc&sparkline=false`
          )
        ),
      ]);

      if (!usdResponse.ok || !brlResponse.ok) {
        throw new Error("Falha ao buscar detalhes das criptomoedas");
      }

      const usdData = await usdResponse.json();
      const brlData = await brlResponse.json();

      // Combinar dados USD e BRL
      return usdData.map((usdCoin: any) => {
        const brlCoin = brlData.find((coin: any) => coin.id === usdCoin.id);
        return {
          id: usdCoin.id,
          name: usdCoin.name,
          symbol: usdCoin.symbol.toUpperCase(),
          price_usd: usdCoin.current_price || 0,
          price_brl: brlCoin?.current_price || 0,
          image: usdCoin.image,
        };
      });
    } else {
      // Em desenvolvimento, usar o servidor proxy que já combina USD e BRL
      const marketsResponse = await fetch(
        `${PROXY_API_URL}/coins/markets?vs_currencies=usd,brl&ids=${coinIds.join(
          ","
        )}&order=market_cap_desc&sparkline=false`
      );

      if (!marketsResponse.ok) {
        throw new Error("Falha ao buscar detalhes das criptomoedas");
      }

      const coinsData = await marketsResponse.json();

      // Mapeamento para extrair os dados necessários
      return coinsData.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price_usd: coin.current_price?.usd || 0,
        price_brl: coin.current_price?.brl || 0,
        image: coin.image,
      }));
    }
  } catch (error) {
    console.error("Erro ao buscar resultados de pesquisa:", error);
    return [];
  }
};

export const getCryptoDetails = async (id: string): Promise<Crypto | null> => {
  if (!id) {
    console.error("ID da criptomoeda não fornecido");
    return null;
  }

  try {
    // Adiciona um timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    if (import.meta.env.PROD) {
      // Em produção, precisamos fazer duas chamadas separadas (USD e BRL)
      const [usdResponse, brlResponse] = await Promise.all([
        fetch(
          addApiKey(
            `${PROXY_API_URL}/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&sparkline=false`
          ),
          { signal: controller.signal }
        ),
        fetch(
          addApiKey(
            `${PROXY_API_URL}/coins/markets?vs_currency=brl&ids=${id}&order=market_cap_desc&sparkline=false`
          ),
          { signal: controller.signal }
        ),
      ]);

      clearTimeout(timeoutId);

      if (!usdResponse.ok || !brlResponse.ok) {
        throw new Error(
          `Falha ao buscar detalhes da criptomoeda: ${usdResponse.status}`
        );
      }

      const usdData = await usdResponse.json();
      const brlData = await brlResponse.json();

      if (!usdData || usdData.length === 0) {
        console.error("Nenhum dado encontrado para o ID da criptomoeda:", id);
        return null;
      }

      const usdCoin = usdData[0];
      const brlCoin = brlData[0];

      return {
        id: usdCoin.id,
        name: usdCoin.name,
        symbol: usdCoin.symbol.toUpperCase(),
        price_usd: usdCoin.current_price || 0,
        price_brl: brlCoin?.current_price || 0,
        image: usdCoin.image || "",
      };
    } else {
      // Em desenvolvimento, usar o servidor proxy que já combina USD e BRL
      const response = await fetch(
        `${PROXY_API_URL}/coins/markets?vs_currencies=usd,brl&ids=${id}&order=market_cap_desc&sparkline=false`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Falha ao buscar detalhes da criptomoeda: ${response.status}`
        );
      }

      const coinsData = await response.json();

      if (!coinsData || coinsData.length === 0) {
        console.error("Nenhum dado encontrado para o ID da criptomoeda:", id);
        return null;
      }

      const coin = coinsData[0];

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price_usd: coin.current_price?.usd || 0,
        price_brl: coin.current_price?.brl || 0,
        image: coin.image || "",
      };
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes da criptomoeda:", error);
    return null;
  }
};
