import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

// 1. Next.js 15 Type Definition
type Props = {
    params: Promise<{ id: string }>;
};

// Update User
export async function PUT(req: NextRequest, { params }: Props) {
    try {
        await dbConnect();
        
        // 2. Params ko await karna lazmi hai
        const { id } = await params;
        
        const body = await req.json();
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Delete User
export async function DELETE(req: NextRequest, { params }: Props) {
    try {
        await dbConnect();
        
        // 3. Params ko yahan bhi await karein
        const { id } = await params;
        
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "User account deleted" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}