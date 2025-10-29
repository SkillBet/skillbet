import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // TODO: Save to database
    console.log('Result recorded:', data);
    
    // You would save this to your database:
    // await db.results.insert(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording result:', error);
    return NextResponse.json(
      { error: 'Failed to record result' },
      { status: 500 }
    );
  }
}
