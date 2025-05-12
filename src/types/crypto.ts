
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
