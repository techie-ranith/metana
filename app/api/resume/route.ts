import { Document } from "mongoose";
import resume from "@/models/testModel";
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
    try {
      // Parse the form data
      const formData = await req.formData();

      // Extract form fields
      const username = formData.get("username");
      const email = formData.get("email");
      const phoneNumber = formData.get("phoneNumber");

      // Get all file URLs (could be multiple)
      const fileUrls = formData.getAll("fileUpload");

      // You can save this data to your database here
      // Example: await saveToDatabase({ username, email, phoneNumber, fileUrls });

      // Log the received data (for debugging)
      console.log("Form data received:", {
        username,
        email,
        phoneNumber,
        files: fileUrls,
      });

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Resume submitted successfully",
      });
    } catch (error) {
      console.error("Error processing form submission:", error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
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