// Svix helper for verifying the authenticity of Clerk webhooks.
import { Webhook } from "svix";
// Used to connect to the database and access user records after a webhook event.
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Clerk calls this POST route when it sends a webhook event.
export async function POST(req){
    // Create a verifier for the incoming webhook.
    const wh = new Webhook(process.env.SIGNING_SECRET)

    const headerPayload = await headers()
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
        "svix-signature": headerPayload.get("svix-signature"),
    };

    //get the payload and verfiy it
    const Payload = await req.json();
    const body = JSON.stringify(payload);
    const {data,type} = wh.verify(body, svixHeaders)

    //prepare the user data to be saved in database

    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
    };

    // connect to the db
    await connectDB();

    switch(type){
        case 'user.created':
            await User.create(userData)
            break;

        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData)
            break;
        
        case 'user.deleted':
            await User.findByIdAndDelete(data.id);
            break; 
             
        default:
            break;
    }
    return NextResponse.json({message: 'Event Received'});

}