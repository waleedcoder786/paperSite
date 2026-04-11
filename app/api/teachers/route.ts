import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');
    const filter = adminId ? { adminId } : {};
    const teachers = await Teacher.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(teachers);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const newTeacher = new Teacher(body);
        await newTeacher.save();
        return NextResponse.json({ success: true, data: newTeacher }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}