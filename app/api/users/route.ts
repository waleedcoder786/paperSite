import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json(users);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const newUser = new User(body);
        await newUser.save();
        return NextResponse.json({ success: true, data: newUser }, { status: 201 });
    } catch (err: any) {
        if (err.code === 11000) return NextResponse.json({ message: "Email already exists" }, { status: 400 });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}