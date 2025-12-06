import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const INTENT_FILE = path.join(process.cwd(), 'intents.json');

export async function GET() {
  try {
    let db: any = {};
    try {
      const data = await fs.readFile(INTENT_FILE, 'utf8');
      db = JSON.parse(data);
    } catch (error) {
      db = {};
    }

    return NextResponse.json({
      intents: db,
      count: Object.keys(db).length,
      message: 'Intents retrieved successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
