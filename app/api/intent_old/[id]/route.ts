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
      const file = await fs.readFile(INTENT_FILE, "utf8");
      db = JSON.parse(file);
    } catch (err) {
      return NextResponse.json({ error: "No intents stored" }, { status: 404 });
    }

    const item = db[id];

    if (!item) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err: any) {
    console.error("Intent GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
