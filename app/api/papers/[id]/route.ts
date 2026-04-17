import dbConnect from '@/lib/dbConnect';
import Paper from '@/models/Paper';
import { NextResponse } from 'next/server';

// Type definition for Next.js 15+ async params
type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
    try {
        await dbConnect();
        // 1. Params ko await karna lazmi hai
        const { id } = await params; 
        
        const paper = await Paper.findById(id);
        
        if (!paper) {
            return NextResponse.json({ message: "Paper not found" }, { status: 404 });
        }
        
        return NextResponse.json(paper);
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: Props) {
    try {
        await dbConnect();
        const { id } = await params; // 2. Await here too
        const body = await req.json();
        
        const updated = await Paper.findByIdAndUpdate(
            id, 
            { $set: body }, 
            { new: true }
        );
        
        if (!updated) {
            return NextResponse.json({ message: "Paper not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Updated", data: updated });
    } catch (error) {
        return NextResponse.json({ message: "Update failed", error }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: Props) {
    try {
        await dbConnect();
        const { id } = await params; // 3. And here
        
        const deleted = await Paper.findByIdAndDelete(id);
        
        if (!deleted) {
            return NextResponse.json({ message: "Paper not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Paper deleted" });
    } catch (error) {
        return NextResponse.json({ message: "Delete failed", error }, { status: 500 });
    }
}