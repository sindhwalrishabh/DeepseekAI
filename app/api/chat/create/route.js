import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    try {
        const {userId } = await auth();
        
        if(!userId){
            return NextResponse.json({success: false,message:"User not authenticated"}, {status: 401});
        }

        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
        };

        await connectDB();
        await Chat.create(chatData);

        return NextResponse.json({success: true, message: "Chat created successfully"}, {status: 201});

    } catch (error) {
        return NextResponse.json({success: false, message: error.message}, {status: 500});
    }

}