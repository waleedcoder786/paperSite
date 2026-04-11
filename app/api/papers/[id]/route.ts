import dbConnect from '@/lib/dbConnect';
import Paper from '@/models/Paper';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const paper = await Paper.findById(params.id);
    if (!paper) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(paper);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const body = await req.json();
    const updated = await Paper.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    return NextResponse.json({ message: "Updated", data: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    await Paper.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Paper deleted" });
}