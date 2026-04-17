import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher'; // Agar users file hai to yahan User model hoga
import { NextRequest, NextResponse } from 'next/server';

// 1. Next.js 15 ke mutabiq Type definition
type Props = {
    params: Promise<{ id: string }>;
};

// 2. PUT Method
export async function PUT(req: NextRequest, { params }: Props) {
    try {
        await dbConnect();
        
        // Params ko await karna lazmi hai
        const { id } = await params;
        
        const body = await req.json();
        const updated = await Teacher.findByIdAndUpdate(id, { $set: body }, { new: true });

        if (!updated) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 3. DELETE Method
export async function DELETE(req: NextRequest, { params }: Props) {
    try {
        await dbConnect();
        
        // Params ko await karna lazmi hai
        const { id } = await params;
        
        const deleted = await Teacher.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}