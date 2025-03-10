import mongoose, { Model, Document } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import ConnectMongoDB from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await ConnectMongoDB();
    }
}

await connectDB();

// type ControllerMethod = (req: NextRequest) => Promise<NextResponse>;

export default class BaseController<T extends Document> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    private handleErrors(error: unknown): NextResponse {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    private validateId(id: string): NextResponse | null {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
        }
        return null;
    }

    public async getAllItems(): Promise<NextResponse> {
        try {
            const items = await this.model.find();
            return NextResponse.json({ items }, { status: 200 });
        } catch (error) {
            return this.handleErrors(error);
        }
    }

    public async getSingleItem(req: NextRequest): Promise<NextResponse> {
        const { searchParams } = new URL(req.url);  
        const id = searchParams.get("bot_ID"); // Keep it as a string
        console.log(id);
    
        if (!id) {
            return NextResponse.json({ error: "bot_ID is required" }, { status: 400 });
        }
    
        try {
            const item = await this.model.findOne({ bot_ID: id }); // Find by bot_ID field
            
            if (!item) {
                return NextResponse.json({ error: "Item not found" }, { status: 404 });
            }
            return NextResponse.json({ item }, { status: 200 });
        } catch (error) {
            return this.handleErrors(error);
        }
    }
    


    public async createNewItem(req: NextRequest): Promise<NextResponse> {
        try {
            const body = await req.json();
            const item = await this.model.create(body);
            return NextResponse.json({ item }, { status: 201 });
        } catch (error) {
            return this.handleErrors(error);
        }
    }

    public async updateExistingItem(req: NextRequest): Promise<NextResponse> {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const validationError = this.validateId(id);
        if (validationError) return validationError;

        try {
            const body = await req.json();
            const updatedItem = await this.model.findByIdAndUpdate(id, body, { new: true });
            if (!updatedItem) {
                return NextResponse.json({ error: "Item not found" }, { status: 404 });
            }
            return NextResponse.json({ item: updatedItem }, { status: 200 });
        } catch (error) {
            return this.handleErrors(error);
        }
    }

    public async deleteSingleItem(req: NextRequest): Promise<NextResponse> {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const validationError = this.validateId(id);
        if (validationError) return validationError;

        try {
            const deletedItem = await this.model.findByIdAndDelete(id);
            if (!deletedItem) {
                return NextResponse.json({ error: "Item not found" }, { status: 404 });
            }
            return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
        } catch (error) {
            return this.handleErrors(error);
        }
    }

    public async deleteAllItems(): Promise<NextResponse> {
        try {
            await this.model.deleteMany({});
            return NextResponse.json({ message: "All items deleted successfully" }, { status: 200 });
        } catch (error) {
            return this.handleErrors(error);
        }
    }
}