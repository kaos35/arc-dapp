import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const INTENT_FILE = path.join(process.cwd(), "intents.json");

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    let db: any = {};

    try {
      const data = await fs.readFile(INTENT_FILE, "utf8");
      db = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { error: "No intents found" },
        { status: 404 }
      );
    }

    const intent = db[id];
    if (!intent) {
      return NextResponse.json(
        { error: "Intent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(intent);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
