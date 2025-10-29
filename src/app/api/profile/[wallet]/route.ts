import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    // Await the params in Next.js 15
    const params = await context.params;
    const wallet = params.wallet;

    // TODO: Fetch from your database
    // For now, return mock data
    const mockData = {
      stats: {
        totalGames: 15,
        wins: 9,
        losses: 6,
        totalEarnings: 0.81,
        totalSpent: 1.5,
        netProfit: -0.69,
        winRate: 60.0,
      },
      history: [
        {
          id: '1',
          challengeType: 'typing',
          score: 95,
          won: true,
          amount: 0.09,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          challengeType: 'typing',
          score: 72,
          won: false,
          amount: 0.1,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          challengeType: 'typing',
          score: 88,
          won: true,
          amount: 0.09,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
        },
      ],
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}
