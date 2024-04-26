// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchMessages } from "~/lib/ai/messages";
// import { fetchStreamingMessages } from "~/lib/ai/messages";
import { OutputMessage } from "~/lib/ai/types";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const encoder = new TextEncoder();

  let responseMessages: OutputMessage[] = [];

  const onUpdate = (updatedMessages: OutputMessage[]) => {
    responseMessages = updatedMessages;
  };

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        await fetchMessages(messages, onUpdate);
        sendEvent("message", responseMessages);
      } catch (error) {
        console.error("Error in WebSocket stream:", error);
        sendEvent("error", { message: "An error occurred during streaming." });
      } finally {
        sendEvent("done", {});
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
