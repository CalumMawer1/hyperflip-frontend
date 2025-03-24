import { NextRequest, NextResponse } from 'next/server';


const API_BASE_URL = process.env.API_URL || 'http://localhost:8080';
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

    // Get If-None-Match header for conditional requests
    const ifNoneMatch = request.headers.get('If-None-Match');
    
    const url = new URL(`${API_BASE_URL}/player`);
    url.searchParams.append('player_address', walletAddress);
    
    console.log("fetching:", url.toString())
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };
    
    // Add If-None-Match header for conditional requests to the backend
    if (ifNoneMatch) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'If-None-Match': ifNoneMatch
      };
    }
    
    const response = await fetch(url.toString(), fetchOptions);
    
    if (response.status === 304) {
      // for cacheing
      return new Response(null, { status: 304 });
    }
    
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
      console.error(`Error fetching profile: ${response.status} - ${errorText}`);
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
      playerRankByTotalBets: data.rank_by_total_bets || null
    };
    
    
    const responseData = NextResponse.json(transformedData);
    
    // Generate ETag based on data for conditional requests
    const etag = `W/"${Buffer.from(JSON.stringify(transformedData)).toString('base64')}"`;
    
    // cache for 5 minutes
    responseData.headers.set('Cache-Control', 'public, max-age=120, s-maxage=120');
    responseData.headers.set('ETag', etag);
    
    return responseData;
  } catch (error) {
    console.error('Error in user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 