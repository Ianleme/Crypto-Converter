import { Crypto } from "@/types/crypto";

// URL do servidor proxy local em vez da API do CoinGecko
const PROXY_API_URL = "http://localhost:3001/api";

export interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

export const fetchCryptoList = async (): Promise<Crypto[]> => {
  try {
    // Usando o servidor proxy para buscar dados em USD e BRL de uma vez
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
  } catch (error) {
    console.error("Erro ao buscar dados de criptomoedas:", error);
    throw error;
  }
};

export const searchCryptos = async (query: string): Promise<Crypto[]> => {
  try {
    // Usando o servidor proxy para buscar resultados de pesquisa
    const response = await fetch(
      `${PROXY_API_URL}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar resultados de pesquisa");
    }

    const data = await response.json();
    const coinIds = data.coins.slice(0, 20).map((coin: any) => coin.id);

    if (coinIds.length === 0) {
      return [];
    }

    // Buscar detalhes das moedas encontradas com USD e BRL em uma única requisição
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

    // Buscar detalhes da criptomoeda com USD e BRL em uma única requisição
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
  } catch (error) {
    console.error("Erro ao buscar detalhes da criptomoeda:", error);
    return null;
  }
};
