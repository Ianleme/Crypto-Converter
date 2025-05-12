
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = 'https://pfsqgwagnjpgenvkwtrs.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const cryptoIds = [
      'bitcoin',
      'ethereum',
      'binancecoin',
      'ripple',
      'cardano',
      'solana',
      'polkadot',
    ].join(',')

    // Fetch crypto data from CoinGecko
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Calculate BRL prices (assuming 1 USD = 5 BRL for simplicity)
    // In a real app, you'd fetch the actual exchange rate
    const usdToBrl = 5
    
    const cryptos = data.map((crypto: any) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol.toUpperCase(),
      price_usd: crypto.current_price,
      price_brl: crypto.current_price * usdToBrl,
      image: crypto.image,
    }))

    return new Response(JSON.stringify({ cryptos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
