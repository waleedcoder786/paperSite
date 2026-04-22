import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const users = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (err) {
        return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }
}

export async function POST( req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Server-side validation
        if (!body.expiryDate) {
            return NextResponse.json({ message: "Expiry Date is missing in request" }, { status: 400 });
        }

        const newUser = new User(body);
        await newUser.save();
        
        return NextResponse.json({ success: true, data: newUser }, { status: 201 });
    } catch (err:any) {
        console.error("DB Save Error:", err);
        if (err.code === 11000) return NextResponse.json({ message: "Email already exists" }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}