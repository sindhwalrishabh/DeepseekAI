import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req){
    try {
        const {userId} = await auth();
        const {chatId} = await req.json();

        if(!userId){
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }
        await connectDB();
        await Chat.deleteOne({_id: chatId, userId});
        return NextResponse.json({success: true, message: "Chat deleted successfully"}, {status: 200});
    }
    catch (error) {
        return NextResponse.json({success: false, message: error.message}, {status: 500});
    }
}