import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req){
    try {
        const {userId} = await auth();

        if(!userId){
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }

        // connect to the database
        await connectDB();
        const data = await Chat.find({ userId }) || [];
        return NextResponse.json({success: true, data}, {status: 200});
        
    } catch (error) {
        return NextResponse.json({success: false, message: error.message}, {status: 500});
    }
}