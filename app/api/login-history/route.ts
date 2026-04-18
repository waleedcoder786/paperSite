import dbConnect from '@/lib/dbConnect';
import LoginHistory from '@/models/LoginHistory';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // URL se userId nikalna (e.g., /api/login-history?userId=123)
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        // Database mein sirf us userId ka data dhoondna
        // Note: Aap ko login save karte waqt userId bhi save karni hogi
        const history = await LoginHistory.find({ 
            $or: [
                { adminName: { $exists: true } }, // Agar purana data name se hai
                { userId: userId }               // Agar naya data ID se hai
            ]
        }).sort({ createdAt: -1 });

        return NextResponse.json(history);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}