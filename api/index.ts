import createApp from "../src/app";
import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { IncomingMessage, ServerResponse, type RequestListener } from "http";

// Vercel-compatible Express bridge
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    try {
        const app = await createApp();

        // ✅ Cast to RequestListener using function signature
        const listener: RequestListener = app as unknown as RequestListener;

        listener(req as IncomingMessage, res as ServerResponse);
    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        console.error("❌ Error handling Vercel request:", error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
