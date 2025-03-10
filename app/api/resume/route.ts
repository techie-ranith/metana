import { Document } from "mongoose";
import resume from "@/models/formModel";
import BaseController from "@/app/api/baseController/route";
import { NextRequest, NextResponse } from "next/server";

class BotController extends BaseController<Document> {
  constructor() {
    super(resume);
  }
}

const botController = new BotController();

// Define the index signature for HTTP methods
type RouteHandlers = {
  [key: string]: (req: NextRequest) => Promise<NextResponse>;
};

// Map the HTTP methods to their respective controller methods
const handlers: RouteHandlers = {
  GET: async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("bot_ID");
    console.log(id);
    if (id) {
      return botController.getSingleItem(req);
    } else {
      return botController.getAllItems();
    }
  },
  
  POST: async (req: NextRequest) => {
    return botController.createNewItem(req);
  },

  PUT: async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    return botController.updateExistingItem(req);
  },
  DELETE: async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      return botController.deleteSingleItem(req);
    } else {
      return botController.deleteAllItems();
    }
  },
};

// HTTP method handlers (GET, POST, PUT, DELETE) are now mapped
export async function GET(req: NextRequest) {
  return handlers["GET"](req);
}

export async function POST(req: NextRequest) {
  return handlers["POST"](req);
}

export async function PUT(req: NextRequest) {
  return handlers["PUT"](req);
}

export async function DELETE(req: NextRequest) {
  return handlers["DELETE"](req);
}