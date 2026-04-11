import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    const data = await Class.find({});
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        // [Aapka wahi hierarchy wala lamba logic jo pehle controllers mein tha yahan paste hoga]
        // Base logic same rahega bas res.json ki jagah NextResponse.json use karein
        return NextResponse.json({ success: true, message: "Added Successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { level, board, classId, subjectName, chapterName, topicName, mode, questionIds } = body;

        let doc = await Class.findOne({});
        if (!doc) return NextResponse.json({ message: "No data found" }, { status: 404 });

        let plainData = doc.toObject().data || {};

        if (mode === 'bulk') {
            // Bulk delete logic
        } else {
            // Hierarchy delete logic (level wise)
        }

        doc.data = plainData;
        doc.markModified('data');
        await doc.save();
        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}