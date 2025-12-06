import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const INTENT_FILE = path.join(process.cwd(), 'intents.json');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Dosyayı oku
    let db: any = {};
    try {
      const data = await fs.readFile(INTENT_FILE, 'utf8');
      db = JSON.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'No intents found' },
        { status: 404 }
      );
    }

    const intent = db[id] || null;
    
    if (intent) {
      return NextResponse.json(intent);
    } else {
      return NextResponse.json(
        { error: 'Intent not found' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('Intent get error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
