"use client";
import { Sparkles, Mic, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Generate a random ID for demonstration and redirect
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/app/${sessionId}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
      <div className="w-full max-w-3xl px-4 flex flex-col items-center mt-[-10vh]">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-orange-400" />
          <h1 className="text-3xl md:text-4xl font-serif text-[#e4e4e7] tracking-tight">
            What shall we think through?
          </h1>
        </div>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="w-full relative bg-[#27272a] rounded-2xl border border-[#3f3f46] shadow-lg transition-all focus-within:border-[#52525b] focus-within:ring-1 focus-within:ring-[#52525b] flex items-center px-4 py-2 mt-4">
          <button type="button" className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors p-1">
            <Plus className="w-5 h-5" />
          </button>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you today?"
            className="flex-1 bg-transparent border-none text-[#e4e4e7] placeholder:text-[#a1a1aa] resize-none focus:outline-none focus:ring-0 text-base py-3 mx-2 max-h-[160px] min-h-[24px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="flex items-center gap-1">
            <button type="button" className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors p-1">
              <Mic className="w-4 h-4" />
            </button>
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-1 bg-white text-black disabled:bg-[#3f3f46] disabled:text-[#71717a] transition-colors rounded-md ml-1"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
