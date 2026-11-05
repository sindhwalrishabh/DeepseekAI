import Chat from "@/models/Chat";
import connectDB from "@/config/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req){
    try {
        const {userId} = await auth();

        if(!userId){
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }

        const {chatId, newName} = await req.json();

        // connect to the database and update the chat name
        await connectDB();
        await Chat.findOneAndUpdate({_id: chatId, userId}, {$set: {name: newName}}, {new: true});

        return NextResponse.json({success: true, message: "Chat renamed successfully"}, {status: 200});
        
    }catch (error) {
        return NextResponse.json({success: false, message: error.message}, {status: 500});
    }
}