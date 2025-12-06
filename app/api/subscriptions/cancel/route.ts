import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUB_FILE = path.join(process.cwd(), 'subscriptions.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      );
    }

    // Dosyayı oku
    let db: any = {};
    try {
      const data = await fs.readFile(SUB_FILE, 'utf8');
      db = JSON.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'No subscriptions found' },
        { status: 404 }
      );
    }

    // Subscription'ı sil
    if (db[id]) {
      delete db[id];
      await fs.writeFile(SUB_FILE, JSON.stringify(db, null, 2));
      
      return NextResponse.json({
        ok: true,
        id,
        message: 'Subscription cancelled successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('Subscription cancel error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
