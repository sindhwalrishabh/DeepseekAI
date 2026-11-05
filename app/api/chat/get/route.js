import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { verifyToken } from "@clerk/backend";

export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, message: "Missing Bearer token" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        const { sub: userId } = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Invalid token" },
                { status: 401 }
            );
        }

        await connectDB();

        const data = await Chat.find({ userId });

        return NextResponse.json(
            { success: true, data },
            { status: 200 }
        );

    } catch (error) {
        console.log("GET API Error:", error.message);

        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}