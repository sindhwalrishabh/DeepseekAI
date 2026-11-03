const evt = await verifyWebhook(req);
const { data, type } = evt;

console.log("[WEBHOOK] Event received:", type);
console.log("[WEBHOOK] User ID:", data.id);
console.log(
    "[WEBHOOK] Email available:",
    Boolean(data.email_addresses?.length)
);

const primaryEmail =
    data.email_addresses?.find(
        email => email.id === data.primary_email_address_id
    ) || data.email_addresses?.[0];

const email = primaryEmail?.email_address?.trim() || "";

const userData = {
    _id: data.id,
    email: email,
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim()
        || email.split("@")[0]
        || "User",
    image: data.image_url || "",
};

console.log("[WEBHOOK] Email extracted:", Boolean(userData.email));
console.log("[WEBHOOK] User data prepared:", data.id);

await connectDB();

console.log("[WEBHOOK] MongoDB connection completed");

switch (type) {
    case "user.created":
        console.log("[WEBHOOK] Creating user...");

        if (!userData.email) {
            console.log("[WEBHOOK] Email missing, skipping user:", data.id);
            break;
        }

        const savedUser = await User.create(userData);

        console.log("[WEBHOOK] User saved:", savedUser._id);
        break;

    case "user.updated":
        await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true });
        console.log("[WEBHOOK] User updated:", data.id);
        break;

    case "user.deleted":
        await User.findByIdAndDelete(data.id);
        console.log("[WEBHOOK] User deleted:", data.id);
        break;

    default:
        console.log("[WEBHOOK] Unhandled event:", type);
}