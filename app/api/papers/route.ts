import dbConnect from '@/lib/dbConnect';
import Paper from '@/models/Paper';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const newPaper = new Paper(body);
        await newPaper.save();
        return NextResponse.json({ message: "Paper saved!", id: newPaper._id }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        const teachers = await Teacher.find({ adminId: userId });
        const allIds = [userId, ...teachers.map(t => t._id)];

        const papers = await Paper.find({ userId: { $in: allIds } }).sort({ createdAt: -1 });
        return NextResponse.json(papers);
    } catch (err) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}