import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Teacher from '@/models/Teacher';
import LoginHistory from '@/models/LoginHistory'; // Naya model import karein
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        // User Agent aur IP nikalne ke liye headers
        const userAgent = req.headers.get('user-agent') || "";
        const ip = req.headers.get('x-forwarded-for') || "Unknown IP";

        // Login details ko format karne ka function
        const saveHistory = async (name: string, role: string) => {
            await LoginHistory.create({
                adminName: name,
                role: role,
                date: new Date().toLocaleDateString('en-GB'),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
                device: userAgent.includes('Mobile') ? 'Mobile Phone' : 'Computer',
                ipAddress: ip,
                browser: userAgent.includes('Chrome') ? 'Chrome' : 
                         userAgent.includes('Firefox') ? 'Firefox' : 
                         userAgent.includes('Safari') && !userAgent.includes('Chrome') ? 'Safari' : 'Mobile Browser'
            });
        };

        // 1. Check for Admin/User
        const user = await User.findOne({ email });
        if (user && user.password === password) {
            await saveHistory(user.name, user.role || 'admin'); // History save karein
            return NextResponse.json({ type: 'user', data: user });
        }

        // 2. Check for Teacher
        const teacher = await Teacher.findOne({ email });
        if (teacher && teacher.password === password) {
            await saveHistory(teacher.name, 'teacher'); // History save karein
            return NextResponse.json({ type: 'teacher', data: teacher });
        }

        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    } catch (err: any) { 
        return NextResponse.json({ error: err.message }, { status: 500 }); 
    }
}