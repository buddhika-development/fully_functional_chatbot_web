"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export type ChatSession = {
  id: string;
  session_title: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id?: string;
  role: "human" | "assistant";
  content: string;
  created_at?: string;
};

export type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

type ChatContextType = {
  todaySessions: ChatSession[];
  previousSessions: ChatSession[];
  messages: Message[];
  isStreaming: boolean;
  streamingMessage: string;
  activeSessionId: string | null;
  toasts: Toast[];
  isSidebarOpen: boolean;
  activeMenuId: string | null;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  showToast: (message: string, type?: "success" | "error") => void;
  fetchSessions: () => Promise<void>;
  fetchConversationHistory: (sessionId: string, skip?: number, limit?: number, append?: boolean) => Promise<number | undefined>;
  sendMessage: (messageContent: string, sessionId: string | null) => Promise<void>;
  handleDeleteSession: (sessionId: string) => Promise<void>;
  clearMessages: () => void;
  currentMessagesSessionId: string | null;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Decode a single SSE data payload from the stream endpoint. The backend
// JSON-encodes each chunk as {"content": "..."} so that newlines inside a
// token are preserved across the transport. If a payload is not valid JSON
// (older format / control text), fall back to treating it as raw text.
function parseStreamChunk(payload: string): string {
  try {
    const parsed = JSON.parse(payload);
    if (parsed && typeof parsed.content === "string") {
      return parsed.content;
    }
    return "";
  } catch {
    return payload;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [todaySessions, setTodaySessions] = useState<ChatSession[]>([]);
  const [previousSessions, setPreviousSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentMessagesSessionId, setCurrentMessagesSessionId] = useState<string | null>(null);

  // Extract session ID from pathname if we are on a session page
  const getSessionIdFromPath = useCallback(() => {
    const parts = pathname.split("/");
    // path is usually /app/[session_id]
    if (parts.length >= 3 && parts[1] === "app" && parts[2] !== "") {
      return parts[2];
    }
    return null;
  }, [pathname]);

  const activeSessionId = getSessionIdFromPath();

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/v1/chat_session/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.status === "success") {
        const sessions: ChatSession[] = data.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayList: ChatSession[] = [];
        const previousList: ChatSession[] = [];

        sessions.forEach((session) => {
          const sessionDate = new Date(session.created_at);
          if (sessionDate >= today) {
            todayList.push(session);
          } else {
            previousList.push(session);
          }
        });

        // Sort by newest first
        todayList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        previousList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setTodaySessions(todayList);
        setPreviousSessions(previousList);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, [getToken]);

  const fetchConversationHistory = useCallback(async (sessionId: string, skip: number = 0, limit: number = 10, append: boolean = false) => {
    try {
      const token = await getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/v1/chat/${sessionId}?skip=${skip}&limit=${limit}`, { headers });
      if (!res.ok) {
        throw new Error("Failed to fetch conversation history");
      }
      const data = await res.json();
      if (data.status === "success") {
        const fetchedMessages = data.data || [];
        if (append) {
          setMessages((prev) => [...fetchedMessages, ...prev]);
        } else {
          setMessages(fetchedMessages);
          setCurrentMessagesSessionId(sessionId);
        }
        return fetchedMessages.length;
      }
    } catch (err) {
      console.error("Error fetching conversation history:", err);
      showToast("Failed to load conversation history", "error");
    }
    return 0;
  }, [getToken, showToast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentMessagesSessionId(null);
  }, []);

  const handleDeleteSession = useCallback(async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/v1/chat_session/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setTodaySessions((prev) => prev.filter((s) => s.id !== id));
        setPreviousSessions((prev) => prev.filter((s) => s.id !== id));
        showToast("Chat session deleted successfully", "success");

        if (pathname === `/app/${id}`) {
          router.push("/app");
        }
      } else {
        showToast("Failed to delete chat session", "error");
      }
    } catch (err) {
      showToast("Error deleting chat session", "error");
      console.error("Error deleting session:", err);
    }
  }, [getToken, pathname, router, showToast]);

  const sendMessage = useCallback(async (messageContent: string, currentSessionId: string | null) => {
    if (!messageContent.trim()) return;

    // 1. Add user message locally
    const newUserMessage: Message = {
      role: "human",
      content: messageContent,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      const token = await getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        user_message: messageContent,
        chat_session_id: currentSessionId || null,
      };

      const response = await fetch("/api/v1/chat/stream", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader found on response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let resolvedSessionId = currentSessionId;
      // Accumulate the full response locally so we can commit it to messages
      // state immediately after streaming ends — no DB round-trip needed.
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE protocol
        const blocks = buffer.split("\n\n");
        // Keep the last incomplete block in the buffer
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim()) continue;

          // Parse block lines
          const lines = block.split("\n");
          let eventType = "message";
          let dataContent = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
              dataContent = line.substring(5);
            }
          }

          if (eventType === "session_id") {
            resolvedSessionId = dataContent.trim();
            setCurrentMessagesSessionId(resolvedSessionId);
            // Transition to new URL and refresh sidebar sessions list
            router.replace(`/app/${resolvedSessionId}`);
            fetchSessions();
          } else {
            // dataContent was already extracted above: strip one leading space (SSE spec)
            const payload = dataContent.startsWith(" ")
              ? dataContent.substring(1)
              : dataContent;

            // [Done] sentinel signals end of stream — stop processing
            if (payload === "[Done]") {
              break;
            }

            // Each content chunk is a JSON object {"content": "..."} so that
            // newlines survive the SSE transport. Fall back to the raw string
            // for resilience if a chunk ever arrives unencoded.
            const content = parseStreamChunk(payload);
            if (content) {
              accumulatedResponse += content;
              setStreamingMessage((prev) => prev + content);
            }
          }
        }
      }

      // Flush any remaining partial buffer into streamingMessage
      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const rest = line.substring(5);
            const payload = rest.startsWith(" ") ? rest.substring(1) : rest;
            if (payload === "[Done]") continue;
            const chunk = parseStreamChunk(payload);
            if (chunk) {
              accumulatedResponse += chunk;
              setStreamingMessage((prev) => prev + chunk);
            }
          }
        }
      }

      // Stream done. Commit the fully-accumulated response directly into
      // messages state — no DB round-trip. This makes MarkdownRenderer run
      // on the complete text immediately, so MD formatting appears instantly
      // with zero network latency.
      const assistantMessage: Message = {
        role: "assistant",
        content: accumulatedResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(false);
      setStreamingMessage("");

      // Refresh sessions list in the background (title may have been set).
      // fetchConversationHistory is NOT called — local state is already correct.
      fetchSessions();

    } catch (err) {
      console.error("Error in streaming message:", err);
      setIsStreaming(false);
      setStreamingMessage("");
      showToast("Error getting response from assistant", "error");
    }
  }, [getToken, fetchSessions, fetchConversationHistory, router, showToast]);

  // Initial fetch of sessions
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <ChatContext.Provider
      value={{
        todaySessions,
        previousSessions,
        messages,
        isStreaming,
        streamingMessage,
        activeSessionId,
        toasts,
        isSidebarOpen,
        activeMenuId,
        setIsSidebarOpen,
        setActiveMenuId,
        showToast,
        fetchSessions,
        fetchConversationHistory,
        sendMessage,
        handleDeleteSession,
        clearMessages,
        currentMessagesSessionId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
