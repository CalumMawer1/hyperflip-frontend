import { NextResponse } from 'next/server';
import { headers } from 'next/headers';


interface BetRequest {
  player_address: string;
  wager_amount: number;
  is_win: boolean | null;
  placed_at?: string;
}

const validBetSizes = [0.0, 0.25, 0.5, 1, 2];
// const API_BASE_URL = process.env.NODE_ENV === "production" ? process.env.API_URL : "http://localhost:8080";
const API_BASE_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  try {
    const contentLength = headers().get('content-length');
    if (contentLength && parseInt(contentLength) > 102400) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const betRequest: BetRequest = await request.json();

    if (!betRequest || typeof betRequest !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (typeof betRequest.player_address !== 'string') {
      return NextResponse.json(
        { error: 'player_address must be a string' },
        { status: 400 }
      );
    }

    if (typeof betRequest.wager_amount !== 'number' || isNaN(betRequest.wager_amount)) {
      console.log("wager amount isn't number")
      return NextResponse.json(
        { error: 'wager_amount must be a valid number' },
        { status: 400 }
      );
    }

    if (typeof betRequest.is_win !== 'boolean' && betRequest.is_win !== null) {
      console.log("is_win isn't a boolean or null", typeof betRequest.is_win, betRequest.is_win)
      return NextResponse.json(
        { error: 'is_win must be a boolean or null' },
        { status: 400 }
      );
    }

    if (!betRequest.player_address || !validBetSizes.includes(betRequest.wager_amount)) {
      console.log("the request doesn't have address || the bet size is invalid", betRequest.wager_amount)
      return NextResponse.json(
        { error: 'Invalid request fields' },
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

    const apiUrl = `${API_BASE_URL}/bet`;
    
    const golangBetRequest = {
      player_address: betRequest.player_address,
      wager_amount: betRequest.wager_amount,
      is_win: betRequest.is_win,
      placed_at: betRequest.placed_at
    };


    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(golangBetRequest)
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to record bet' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.log('Error processing bet:', error);
    
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error processing bet' },
      { status: 500 }
    );
  }
}

