import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const {userId } = getAuth(req)
        
        if(!userId){
            return new NextResponse({success: false,message:"User not authenticated"}, {status: 401});
        }

        const chatData = {
            userId,
            meessages: [],
            name: "New Chat",
        };

        await connectDB();
        await Chat.create(chatData);

        return new NextResponse(({success: true, message: "Chat created successfully"}), {status: 201});

    } catch (error) {
        return new NextResponse({success: false, message: error.message}, {status: 500});
    }

}