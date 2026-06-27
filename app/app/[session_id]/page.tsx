"use client";
import { Mic, ArrowRight, ChevronDown, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useChat } from "../ChatContext";
import MarkdownRenderer from "../MarkdownRenderer";

export default function ChatSessionPage() {
  const [input, setInput] = useState("");
  const params = useParams();
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showTopPopup, setShowTopPopup] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);
  const isFetchingOlderRef = useRef(false);

  const {
    messages,
    isStreaming,
    streamingMessage,
    currentMessagesSessionId,
    sendMessage,
    fetchConversationHistory,
    showToast,
  } = useChat();

  useEffect(() => {
    // Fetch conversation history only if the URL sessionId doesn't match
    // the sessionId of the messages currently in state.
    // We skip this if streaming is active to avoid disrupting the stream redirect.
    if (sessionId && sessionId !== currentMessagesSessionId && !isStreaming) {
      setHasMore(true);
      fetchConversationHistory(sessionId).then(count => {
        if (count !== undefined && count < 10) {
          setHasMore(false);
        }
      });
    }
  }, [sessionId, currentMessagesSessionId, isStreaming, fetchConversationHistory]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scrollHeight correctly
    textarea.style.height = "auto";
    // Set height to scrollHeight (bounded by CSS max-h-32)
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  // Scroll to bottom when messages or streamingMessage changes
  // Only if we didn't just load older messages.
  useEffect(() => {
    if (!isFetchingOlderRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage]);

  // Adjust scroll position after older messages are rendered
  useEffect(() => {
    if (isLoadingMore && prevScrollHeight !== null && messagesContainerRef.current) {
      const target = messagesContainerRef.current;
      target.scrollTop = target.scrollHeight - prevScrollHeight;
      setPrevScrollHeight(null);
      setIsLoadingMore(false);
      
      // Delay resetting the ref slightly to ensure the scroll-to-bottom effect doesn't fire
      setTimeout(() => {
        isFetchingOlderRef.current = false;
      }, 50);
    }
  }, [messages, isLoadingMore, prevScrollHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input, sessionId);
    setInput("");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/app/${sessionId}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!", "success");
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && target.scrollHeight > target.clientHeight) {
      if (hasMore && !isLoadingMore && !isStreaming) {
        isFetchingOlderRef.current = true;
        setIsLoadingMore(true);
        setPrevScrollHeight(target.scrollHeight);
        
        const count = await fetchConversationHistory(sessionId, messages.length, 10, true);
        if (count !== undefined && count < 10) {
          setHasMore(false);
        }
        // isLoadingMore and prevScrollHeight are reset in the useEffect
      } else if (!hasMore && !showTopPopup) {
        setShowTopPopup(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setShowTopPopup(false);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full relative w-full font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#1A1A1A]">
        <button className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors text-[13px]">
          AI as a tool, not a knowledge source <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleShare}
          className="px-2.5 py-1 text-[11px] font-medium text-[#e4e4e7] bg-[#27272a] hover:bg-[#3f3f46] rounded-md transition-colors cursor-pointer"
        >
          Share
        </button>
      </div>

      {/* Chat History */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sidebar-scroll relative" 
        onScroll={handleScroll}
      >
        {showTopPopup && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#27272a] text-[#e4e4e7] px-4 py-2 rounded-full text-xs font-medium border border-[#3f3f46] shadow-lg animate-fade-in z-10 flex items-center gap-2">
            <span>You've reached the top of this conversation.</span>
          </div>
        )}
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-28">
          {messages.map((msg, index) => {
            const isHuman = msg.role === "human";
            return isHuman ? (
              /* User Message */
              <div key={msg.id || index} className="flex justify-end">
                <div className="bg-[#27272a] text-[#e4e4e7] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ) : (
              /* AI Message */
              <div key={msg.id || index} className="flex justify-start">
                <div className="text-[#e4e4e7] text-[14px] leading-relaxed max-w-[95%] font-serif pr-2">
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            );
          })}

          {/* Incoming Assistant Stream Message */}
          {isStreaming && streamingMessage && (
            <div className="flex justify-start">
              <div className="text-[#e4e4e7] text-[14px] leading-relaxed max-w-[95%] font-serif pr-2 break-words">
                <MarkdownRenderer content={streamingMessage} showCursor />
              </div>
            </div>
          )}

          {/* Thinking Indicator (Micro-animation) */}
          {isStreaming && !streamingMessage && (
            <div className="flex justify-start">
              <div className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[95%] font-serif pr-2 flex items-center gap-1.5 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Anchor for Auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A] to-transparent pt-8 pb-5 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="w-full relative bg-[#27272a] rounded-xl border border-[#3f3f46] shadow-lg focus-within:border-[#52525b] focus-within:ring-1 focus-within:ring-[#52525b] flex items-end px-4 py-2">
            <button type="button" className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors p-2 mb-0.5">
              <Plus className="w-4 h-4" />
            </button>
            
            <textarea 
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 bg-transparent border-none text-[#e4e4e7] placeholder:text-[#a1a1aa] text-[14px] resize-none focus:outline-none focus:ring-0 max-h-32 min-h-[24px] py-2 mx-2 sidebar-scroll"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="flex items-center gap-1 mb-1">
              <button type="button" className="p-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors rounded-md hover:bg-[#3f3f46]/50">
                <Mic className="w-4 h-4" />
              </button>
              <button 
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-1.5 bg-white text-black disabled:bg-[#3f3f46] disabled:text-[#71717a] transition-colors rounded-md ml-1"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
