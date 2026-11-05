import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req){
    try {
        const {userId} = getAuth(req);
        const {chatId} = await req.json();

        if(!userId){
            return new NextResponse({success: false, message: "User not authenticated"}, {status: 401});
        }
        await connectDB();
        await Chat.deleteOne({_id: chatId, userId});
        return new NextResponse({success: true, message: "Chat deleted successfully"}, {status: 200});
    }
    catch (error) {
        return new NextResponse({success: false, message: error.message}, {status: 500});
    }
}