import { NextRequest, NextResponse } from 'next/server';
// 
// const API_BASE_URL =  process.env.NODE_ENV === "production" ? process.env.API_URL : 'http://localhost:8080'
const API_BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;


export const dynamic = "force-dynamic";
// Add revalidate = 0 to disable caching
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const playerAddress = searchParams.get('player_address');
    const sortBy = searchParams.get('sort_by');

    
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    let apiUrl = `${API_BASE_URL}/leaderboard?page=${page}&limit=${limit}`;
    if (playerAddress) {
      apiUrl += `&player_address=${playerAddress}`;
    }
    
    if (sortBy && (sortBy === 'net_gain' || sortBy === 'total_wagered')) {
      apiUrl += `&sort_by=${sortBy}`;
    }
    
    apiUrl += `&_t=${Date.now()}`;


    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) { 
      throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const responseData = NextResponse.json(data);
    
    // no cacheing
    responseData.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseData.headers.set('Pragma', 'no-cache');
    responseData.headers.set('Expires', '0');
    
    return responseData;
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
