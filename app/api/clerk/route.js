  
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req) {
    const evt = await verifyWebhook(req);
    const { data, type } = evt;

    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
    };

    await connectDB();

    switch (type){
        case 'user.created':
            await User.create(userData)
            break;

        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true })            
            break;
             
        case 'user.deleted':
            await User.findByIdAndDelete (data.id)
            break;
        
        default:
            break;
    }
    return NextResponse.json({ message: "Event received" });
}