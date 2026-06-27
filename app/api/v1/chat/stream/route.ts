import { NextRequest } from "next/server";

// This is a streaming proxy route that bypasses Next.js rewrites buffering.
// next.config.ts rewrites() buffer the entire SSE response before forwarding —
// this route pipes the ReadableStream from the backend directly to the client.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward the Authorization header if present
    const authHeader = req.headers.get("Authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendRes = await fetch(`${BACKEND_BASE_URL}/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // @ts-expect-error — Node.js fetch duplex option required for streaming bodies
      duplex: "half",
    });

    if (!backendRes.ok) {
      return new Response(
        JSON.stringify({ error: "Backend returned an error" }),
        { status: backendRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!backendRes.body) {
      return new Response(
        JSON.stringify({ error: "No body in backend response" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pipe the backend ReadableStream directly to the client, no buffering.
    return new Response(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disables nginx buffering if behind a proxy
      },
    });
  } catch (err) {
    console.error("[stream proxy] error:", err);
    return new Response(
      JSON.stringify({ error: "Stream proxy failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
