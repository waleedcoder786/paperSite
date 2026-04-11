import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();
        const user = await User.findOne({ email });
        if (user && user.password === password) return NextResponse.json({ type: 'user', data: user });

        const teacher = await Teacher.findOne({ email });
        if (teacher && teacher.password === password) return NextResponse.json({ type: 'teacher', data: teacher });

        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}