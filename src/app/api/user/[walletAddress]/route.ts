import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// const API_BASE_URL = process.env.NODE_ENV === "production" ? process.env.API_URL : 'http://localhost:8080';
const API_BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {

  
  try {
    const { walletAddress } = params;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      console.error('API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    const url = new URL(`${API_BASE_URL}/player`);
    url.searchParams.append('player_address', walletAddress);
    // Add timestamp to prevent caching
    url.searchParams.append('_t', Date.now().toString());
    
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      cache: 'no-store'
    };
    
    
    const response = await fetch(url.toString(), fetchOptions);

    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalProfit: 0,
          winPercentage: 0,
          totalWagered: 0
        });
      }
      
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: response.status }
      );
    }

    const data = await response.json();
        
    const transformedData = {
      totalBets: (data.player?.wins || 0) + (data.player?.losses || 0),
      wins: data.player?.wins || 0,
      losses: data.player?.losses || 0,
      totalProfit: data.player?.net_gain || 0,
      winPercentage: data.player?.win_percentage || 0,
      totalWagered: data.player?.total_wagered || 0,
      playerRankByNetGain: data.rank_by_net_gain || null,
      playerRankByTotalWagered: data.rank_by_total_wagered || null
    };

    
    const responseData = NextResponse.json(transformedData);
    
    // prevent caching
    responseData.headers.set('Cache-Control', 'no-store, max-age=0');
    responseData.headers.set('Pragma', 'no-cache');
    responseData.headers.set('Expires', '0');
    
    return responseData;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
