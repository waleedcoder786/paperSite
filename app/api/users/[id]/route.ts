import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// Update User
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const body = await req.json();
        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        );
        return NextResponse.json({ success: true, data: updatedUser });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Delete User
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        await User.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: "User account deleted" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}