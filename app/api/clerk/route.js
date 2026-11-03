
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
export async function POST(req) {
    try {
        const evt = await verifyWebhook(req);
        const { data, type } = evt;

        console.log("[WEBHOOK] Event received:", type);
        console.log("[WEBHOOK] User ID:", data.id);

        const primaryEmail =
            data.email_addresses?.find(
                email => email.id === data.primary_email_address_id
            ) || data.email_addresses?.[0];

        const email = primaryEmail?.email_address?.trim() || "";

        const userData = {
            _id: data.id,
            email,
            name:
                `${data.first_name || ""} ${data.last_name || ""}`.trim()
                || email.split("@")[0]
                || "User",
            image: data.image_url || "",
        };

        await connectDB();

        console.log("[WEBHOOK] MongoDB connected");

        switch (type) {
            case "user.created": {
                if (!userData.email) {
                    throw new Error("User email is missing");
                }

                const savedUser = await User.findOneAndUpdate(
                    { _id: data.id },
                    { $set: userData },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                    }
                );

                console.log("[WEBHOOK] User saved:", savedUser._id);
                break;
            }

            case "user.updated": {
                const updateData = {
                    name: userData.name,
                    image: userData.image,
                };

                if (userData.email) {
                    updateData.email = userData.email;
                }

                await User.findByIdAndUpdate(data.id, updateData, {
                    new: true,
                });

                console.log("[WEBHOOK] User updated:", data.id);
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                console.log("[WEBHOOK] User deleted:", data.id);
                break;
            }

            default:
                console.log("[WEBHOOK] Unhandled event:", type);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[WEBHOOK] Error:", error);

        return NextResponse.json(
            { success: false, error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
