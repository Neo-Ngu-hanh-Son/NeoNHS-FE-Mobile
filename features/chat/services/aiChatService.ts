import { API_CONFIG } from "@/utils/constants";
import { storage } from "@/utils/storage";
import { logger } from "@/utils/logger";
import EventSource from "react-native-sse";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface AiStreamChunk {
    type: "message" | "done" | "transfer" | "error";
    text?: string;
    fullText?: string;
    message?: string;
    error?: string;
}

/**
 * Connect to the AI chat SSE endpoint and stream the response.
 *
 * @param roomId  - The chat room ID
 * @param message - The user's question
 * @param onChunk - Called for each streaming chunk
 * @param onDone  - Called when streaming is complete
 * @param onError - Called on error
 * @returns An abort function to cancel the stream
 */
export function streamAiReply(
    roomId: string,
    message: string,
    onChunk: (chunk: AiStreamChunk) => void,
    onDone: (fullText: string) => void,
    onError: (error: string) => void
): () => void {
    let es: EventSource | null = null;
    let accumulatedText = "";
    let isDone = false;

    (async () => {
        try {
            const token = await storage.getAuthToken();
            if (!token) {
                onError("Not authenticated");
                return;
            }

            const url = `${API_BASE_URL}/chat/rooms/${roomId}/ai-reply?message=${encodeURIComponent(message)}`;

            es = new EventSource(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            es.addEventListener("open", () => {
                logger.debug("[AiChat] SSE connection opened");
            });

            es.addEventListener("message", (event: any) => {
                if (!event.data) return;
                try {
                    const data = JSON.parse(event.data);
                    if (data.text) {
                        accumulatedText += data.text;
                        onChunk({ type: "message", text: data.text });
                    }
                } catch (e) {
                    logger.debug("[AiChat] Failed to parse message:", event.data);
                }
            });

            (es as any).addEventListener("done", (event: any) => {
                isDone = true;
                if (event.data) {
                    try {
                        const data = JSON.parse(event.data);
                        accumulatedText = data.fullText || accumulatedText;
                        onChunk({ type: "done", fullText: accumulatedText });
                        onDone(accumulatedText);
                    } catch (e) {
                        onDone(accumulatedText);
                    }
                } else {
                    onDone(accumulatedText);
                }
                es?.close();
            });

            (es as any).addEventListener("transfer", (event: any) => {
                isDone = true;
                if (event.data) {
                    try {
                        const data = JSON.parse(event.data);
                        onChunk({ type: "transfer", message: data.message });
                        onDone(data.message || "");
                    } catch (e) {
                        onDone("");
                    }
                }
                es?.close();
            });

            es.addEventListener("error", (event: any) => {
                if (!isDone) {
                    if (event.data) {
                        try {
                            const data = JSON.parse(event.data);
                            onError(data.error || "Server error");
                        } catch (e) {
                            onError(event.message || "Connection error");
                        }
                    } else {
                        onError(event.message || "Connection error");
                    }
                }
                es?.close();
            });

            es.addEventListener("close", () => {
                if (!isDone && accumulatedText) {
                    onDone(accumulatedText);
                }
            });

        } catch (err: any) {
            logger.error("[AiChat] Stream error:", err);
            onError(err.message || "Connection error");
        }
    })();

    // Return abort function
    return () => {
        if (es) {
            es.close();
        }
    };
}
