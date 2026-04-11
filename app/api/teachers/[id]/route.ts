import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const body = await req.json();
    const updated = await Teacher.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    await Teacher.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Teacher deleted" });
}