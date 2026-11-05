export const maxDuration = 60;
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Chat from "@/models/Chat"; 
import { NextResponse } from "next/server";
// initialize the OpenAI client with your API key

console.log(
    "DeepSeek API Key Loaded:",
    Boolean(process.env.DEEPSEEKAI_API_KEY)
);
const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEKAI_API_KEY,
});

export async function POST(req){
    try {
        const { userId} = await auth();

        //extract chatid and prompt from the request body
        const {chatId, prompt} = await req.json();

        if(!userId){
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }
        
        await connectDB();
        // find the chat doc in the database and append the new message to the messages array
        const data = await Chat.findOne({_id: chatId, userId});
        if(!data){
            return NextResponse.json({success: false, message: "Chat not found"}, {status: 404});
        }

        // create a user message object and append it to the messages array
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
        };
        data.messages.push(userPrompt);

        // call the deepseekai API to get chat completion
        const completion = await openai.chat.completions.create({
            messages: [{role: "user",content: prompt}],
            model: "deepseekai-chat",
            store: true,
        });

        const message = completion.choices[0].message;
        message.timestamp = Date.now();

        data.messages.push(message);
        await data.save();

        return NextResponse.json({success: true, message: "Message sent successfully", data}, {status: 200});

    }catch (error) {
        return NextResponse.json({success: false, message: error.message}, {status: 500});
    }
    console.log(
    "DeepSeek API Key Loaded:",
    Boolean(process.env.DEEPSEEKAI_API_KEY)
);
}