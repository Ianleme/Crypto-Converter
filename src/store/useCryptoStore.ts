
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price_usd: number;
  price_brl: number;
  image: string;
}

export interface Conversion {
  id: string;
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  amount: number;
  valueUSD: number;
  valueBRL: number;
  date: string;
}

interface CryptoState {
  cryptos: Crypto[];
  favorites: string[];
  conversions: Conversion[];
  addFavorite: (cryptoId: string) => void;
  removeFavorite: (cryptoId: string) => void;
  isFavorite: (cryptoId: string) => boolean;
  addConversion: (conversion: Omit<Conversion, "id" | "date">) => void;
}

// Mock data
const mockCryptos: Crypto[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price_usd: 50000,
    price_brl: 250000,
    image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=022"
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price_usd: 3000,
    price_brl: 15000,
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=022"
  },
  {
    id: "binancecoin",
    name: "Binance Coin",
    symbol: "BNB",
    price_usd: 500,
    price_brl: 2500,
    image: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=022"
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    price_usd: 1.5,
    price_brl: 7.5,
    image: "https://cryptologos.cc/logos/xrp-xrp-logo.png?v=022"
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price_usd: 2.5,
    price_brl: 12.5,
    image: "https://cryptologos.cc/logos/cardano-ada-logo.png?v=022"
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price_usd: 150,
    price_brl: 750,
    image: "https://cryptologos.cc/logos/solana-sol-logo.png?v=022"
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    price_usd: 40,
    price_brl: 200,
    image: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png?v=022"
  },
];

export const useCryptoStore = create<CryptoState>()(
  devtools(
    persist(
      (set, get) => ({
        cryptos: mockCryptos,
        favorites: [],
        conversions: [],

        addFavorite: (cryptoId: string) => {
          set((state) => ({
            favorites: [...state.favorites, cryptoId],
          }));
        },

        removeFavorite: (cryptoId: string) => {
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== cryptoId),
          }));
        },

        isFavorite: (cryptoId: string) => {
          return get().favorites.includes(cryptoId);
        },

        addConversion: (conversion) => {
          const newConversion: Conversion = {
            ...conversion,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
          };

          set((state) => ({
            conversions: [newConversion, ...state.conversions],
          }));
        },
      }),
      {
        name: "crypto-storage",
      }
    )
  )
);
