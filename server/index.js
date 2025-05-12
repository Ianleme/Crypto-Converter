import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import NodeCache from "node-cache";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import path from "path";

// Configurar dotenv para encontrar o arquivo .env no diretório correto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Configurações do servidor
const app = express();
const PORT = process.env.PORT || 3001;
const COINGECKO_API_URL =
  process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Configuração de cache
const cache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 600, // Aumentado para 10 minutos (600 segundos)
  checkperiod: 120, // Verifica chaves expiradas a cada 2 minutos
});

// Limitador de taxa de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas requisições deste IP, tente novamente após 15 minutos",
});

// Middlewares
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json()); // Parse de requisições JSON
app.use(limiter); // Aplica o limitador de taxa

// Função auxiliar para adicionar a chave API às URLs do CoinGecko
const addApiKey = (url) => {
  if (!COINGECKO_API_KEY || COINGECKO_API_KEY === "SUA_API_KEY_AQUI") {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}x_cg_pro_api_key=${COINGECKO_API_KEY}`;
};

// Middleware de cache
const cacheMiddleware = (req, res, next) => {
  const cacheKey = req.originalUrl || req.url;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log(`Servindo dados do cache para: ${cacheKey}`);
    return res.json(cachedData);
  }

  next();
};

// Rota para listar criptomoedas (com cache)
app.get("/api/coins/markets", cacheMiddleware, async (req, res) => {
  try {
    const cacheKey = req.originalUrl || req.url;

    // Verificar se está sendo solicitado vs_currencies (múltiplas moedas)
    // ou vs_currency (uma moeda)
    let url = `${COINGECKO_API_URL}/coins/markets?`;

    // Processar os parâmetros da requisição
    if (req.query.vs_currencies) {
      // Múltiplas moedas: precisamos realizar múltiplas chamadas e combinar resultados
      const currencies = req.query.vs_currencies.split(",");
      const otherParams = Object.entries(req.query)
        .filter(([key]) => key !== "vs_currencies")
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const results = {};

      // Para cada moeda, fazemos uma chamada separada
      for (const currency of currencies) {
        const currencyUrl = addApiKey(
          `${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&${otherParams}`
        );
        console.log(`Buscando dados para moeda ${currency}: ${currencyUrl}`);

        const response = await axios.get(currencyUrl);
        const currencyData = response.data;

        // Armazenar os resultados por moeda
        if (!results.data) {
          // Na primeira moeda, inicializamos a estrutura base
          results.data = currencyData.map((coin) => ({
            ...coin,
            current_price: { [currency]: coin.current_price },
          }));
        } else {
          // Para as próximas moedas, adicionamos apenas o preço à estrutura existente
          currencyData.forEach((coinData) => {
            const existingCoin = results.data.find((c) => c.id === coinData.id);
            if (existingCoin) {
              existingCoin.current_price[currency] = coinData.current_price;
            }
          });
        }
      }

      // Armazenar no cache e retornar
      cache.set(cacheKey, results.data);
      return res.json(results.data);
    } else {
      // Comportamento original para uma única moeda
      Object.entries(req.query).forEach(([key, value]) => {
        url += `${key}=${value}&`;
      });

      // Adiciona a chave API
      url = addApiKey(url);

      console.log(`Buscando dados de: ${url}`);
      const response = await axios.get(url);

      // Armazena no cache
      cache.set(cacheKey, response.data);
      return res.json(response.data);
    }
  } catch (error) {
    console.error("Erro ao buscar lista de criptomoedas:", error.message);
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.response?.data?.error || "Erro ao buscar dados da API",
    });
  }
});

// Rota para busca de criptomoedas
app.get("/api/search", cacheMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const cacheKey = req.originalUrl || req.url;

    // Constrói a URL
    const url = addApiKey(
      `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`
    );

    const response = await axios.get(url);

    // Armazena no cache
    cache.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error) {
    console.error("Erro na busca de criptomoedas:", error.message);
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.response?.data?.error || "Erro ao realizar busca",
    });
  }
});

// Rota padrão para qualquer endpoint do CoinGecko não explicitamente definido
// Tentando a sintaxe alternativa para wildcard "/*path"
app.get("/api/*path", cacheMiddleware, async (req, res) => {
  try {
    const cacheKey = req.originalUrl || req.url;
    const pathParam = req.params.path; // O nome do parâmetro continua 'path'
    const queryString = Object.entries(req.query)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const url = addApiKey(
      `${COINGECKO_API_URL}/${pathParam}${queryString ? `?${queryString}` : ""}`
    );

    const response = await axios.get(url);

    // Armazena no cache
    cache.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error) {
    console.error(`Erro ao acessar ${req.params.path}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.response?.data?.error || "Erro ao buscar dados da API",
    });
  }
});

// Rota de verificação de status do servidor
app.get("/health", (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy rodando em http://localhost:${PORT}`);
  console.log(`API do CoinGecko: ${COINGECKO_API_URL}`);
  console.log(`Tempo de cache: ${process.env.CACHE_TTL || 600} segundos`);
});
