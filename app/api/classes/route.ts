import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';
import { NextResponse } from 'next/server';

// 1. GET: Get all classes and hierarchy structure
export async function GET() {
    try {
        await dbConnect();
        const data = await Class.find({});
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// 2. POST: Add Single or Bulk Question with Hierarchy Building
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { board, classId, subjectName, chapterName, topic, type, category, newQuestion } = body;
        
        const typeKey = type === 'mcq' ? 'mcqs' : type === 'short' ? 'shorts' : 'longs';
        const topicName = topic || "General";

        let doc = await Class.findOne({});
        if (!doc) {
            doc = new Class({ data: {} });
        }

        let fullData = doc.toObject().data || {};

        // 1. BOARD LEVEL
        if (!fullData[board]) {
            fullData[board] = { id: board, name: board.toUpperCase() + " Board", classes: [] };
        }
        let classes = fullData[board].classes || [];
        fullData[board].classes = classes;

        // 2. CLASS LEVEL
        let classIdx = classes.findIndex((c: any) => c && String(c.id) === String(classId));
        if (classIdx === -1) {
            classes.push({ id: classId, title: classId + "th", subjects: [] });
            classIdx = classes.length - 1;
        }

        // 3. SUBJECT LEVEL
        if (!Array.isArray(classes[classIdx].subjects)) classes[classIdx].subjects = [];
        let subjects = classes[classIdx].subjects;
        let subIdx = subjects.findIndex((s: any) => s?.name?.toLowerCase() === subjectName?.toLowerCase());
        if (subIdx === -1) {
            subjects.push({ name: subjectName, chapters: [] });
            subIdx = subjects.length - 1;
        }

        // 4. CHAPTER LEVEL
        if (!Array.isArray(subjects[subIdx].chapters)) subjects[subIdx].chapters = [];
        let chapters = subjects[subIdx].chapters;
        let chapIdx = chapters.findIndex((ch: any) => {
            const cName = typeof ch === 'string' ? ch : ch?.name;
            return cName?.toLowerCase() === chapterName?.toLowerCase();
        });
        if (chapIdx === -1) {
            chapters.push({ name: chapterName, topics: [] });
            chapIdx = chapters.length - 1;
        }

        // 5. TOPIC LEVEL
        if (typeof chapters[chapIdx] === 'string') {
            chapters[chapIdx] = { name: chapters[chapIdx], topics: [] };
        }
        if (!Array.isArray(chapters[chapIdx].topics)) chapters[chapIdx].topics = [];
        let topics = chapters[chapIdx].topics;
        let topIdx = topics.findIndex((t: any) => t?.name?.toLowerCase() === topicName.toLowerCase());
        if (topIdx === -1) {
            topics.push({
                name: topicName,
                questionTypes: { 
                    mcqs: { categories: [] }, 
                    shorts: { categories: [] }, 
                    longs: { categories: [] } 
                }
            });
            topIdx = topics.length - 1;
        }

        // 6. QUESTION TYPE & CATEGORY LEVEL
        let targetTopic = topics[topIdx];
        if (!targetTopic.questionTypes) targetTopic.questionTypes = {};
        if (!targetTopic.questionTypes[typeKey]) targetTopic.questionTypes[typeKey] = { categories: [] };

        let categories = targetTopic.questionTypes[typeKey].categories || [];
        let catIdx = categories.findIndex((c: any) => c && c.name === category);
        if (catIdx === -1) {
            categories.push({ name: category, questions: [] });
            catIdx = categories.length - 1;
        }

        // 7. FINAL QUESTION PUSH
        if (!Array.isArray(categories[catIdx].questions)) categories[catIdx].questions = [];
        categories[catIdx].questions.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            question: newQuestion?.question || "",
            options: newQuestion?.options || null,
            answer: newQuestion?.answer || ""
        });

        doc.data = fullData;
        doc.markModified('data');
        await doc.save();
        
        return NextResponse.json({ success: true, message: "Question Added Successfully!" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// 3. DELETE: Handle Bulk Question Deletion or Hierarchy Cleanup
export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { level, board, classId, subjectName, chapterName, topicName, mode, type, category, questionIds } = body;

        const doc = await Class.findOne({});
        if (!doc) return NextResponse.json({ message: "ڈیٹا بیس نہیں ملی" }, { status: 404 });

        let plainData = doc.data || {};

        if (level === 'board') {
            if (plainData[board]) {
                delete plainData[board];
            }
        } 
        else if (mode === 'bulk' || mode === 'Questions') {
            const typeKey = type === 'mcq' ? 'mcqs' : type === 'short' ? 'shorts' : 'longs';
            const catObj = plainData[board]?.classes
                ?.find((c: any) => String(c.id) === String(classId))
                ?.subjects?.find((s: any) => s.name === subjectName)
                ?.chapters?.find((ch: any) => (typeof ch === 'string' ? ch : ch.name) === chapterName)
                ?.topics?.find((t: any) => t.name === topicName)
                ?.questionTypes?.[typeKey]?.categories?.find((c: any) => c.name === category);

            if (catObj) {
                catObj.questions = catObj.questions.filter((q: any) => 
                    !questionIds.includes(String(q.id)) && !questionIds.includes(String(q._id))
                );
            }
        } 
        else {
            const boardObj = plainData[board];
            if (!boardObj) return NextResponse.json({ message: "Board not found" }, { status: 404 });

            if (level === 'class') {
                // یہاں filter کا استعمال کریں
                boardObj.classes = boardObj.classes.filter((c: any) => String(c.id) !== String(classId));
            } 
            else if (level === 'subject') {
                const cls = boardObj.classes.find((c: any) => String(c.id) === String(classId));
                if (cls) cls.subjects = cls.subjects.filter((s: any) => s.name !== subjectName);
            } 
            else if (level === 'chapter') {
                const cls = boardObj.classes.find((c: any) => String(c.id) === String(classId));
                const sub = cls?.subjects?.find((s: any) => s.name === subjectName);
                if (sub) sub.chapters = sub.chapters.filter((ch: any) => (typeof ch === 'string' ? ch : ch.name) !== chapterName);
            } 
            else if (level === 'topic') {
                const cls = boardObj.classes.find((c: any) => String(c.id) === String(classId));
                const sub = cls?.subjects?.find((s: any) => s.name === subjectName);
                const chap = sub?.chapters?.find((ch: any) => (typeof ch === 'string' ? ch : ch.name) === chapterName);
                if (chap) chap.topics = chap.topics.filter((t: any) => t.name !== topicName);
            }
        }

        doc.data = plainData;
        doc.markModified('data');
        await doc.save();

        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}