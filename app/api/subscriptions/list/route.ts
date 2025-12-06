import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUB_FILE = path.join(process.cwd(), 'subscriptions.json');

export async function GET(request: NextRequest) {
  try {
    // Dosyayı oku
    let db: any = {};
    try {
      const data = await fs.readFile(SUB_FILE, 'utf8');
      db = JSON.parse(data);
    } catch (error) {
      // Dosya yoksa boş döndür
      return NextResponse.json({ subscriptions: [], count: 0 });
    }

    return NextResponse.json({
      subscriptions: db,
      count: Object.keys(db).length
    });

  } catch (error: any) {
    console.error('Subscriptions list error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
