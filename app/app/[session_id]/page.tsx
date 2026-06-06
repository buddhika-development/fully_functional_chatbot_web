"use client";
import { Mic, ArrowRight, ChevronDown, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ChatSessionPage() {
  const [input, setInput] = useState("");
  const params = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scrollHeight correctly
    textarea.style.height = "auto";
    // Set height to scrollHeight (bounded by CSS max-h-32)
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  return (
    <div className="flex-1 flex flex-col h-full relative w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#1A1A1A]">
        <button className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors text-[13px]">
          AI as a tool, not a knowledge source <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button className="px-2.5 py-1 text-[11px] font-medium text-[#e4e4e7] bg-[#27272a] hover:bg-[#3f3f46] rounded-md transition-colors">
          Share
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-28">
          
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-[#27272a] text-[#e4e4e7] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-[14px] leading-relaxed shadow-sm">
              I have a little question and to find answer soon as possible. Normally I am not a 100% AI person while developing ai application. Because of still I need to polish my human capabilities, increase my analysing power, better understand about how things work to apply to long term handling and their understanding.
              <br/><br/>
              But if I need to handle something some amount of small time I go do a base research through the AI. Also I have little trust issue right now in the AI usage more than before. Reason is currently knowledge produce by the humans. They write blogs, books, article and make them public for available to other.
            </div>
          </div>

          {/* AI Message */}
          <div className="flex justify-start">
            <div className="text-[#e4e4e7] text-[14px] leading-relaxed max-w-[95%] font-serif pr-2">
              <p className="mb-3">Your thinking here is sharp, and honestly, I agree with most of it.</p>
              
              <p className="mb-3">The feedback loop concern is real. There's a documented phenomenon researchers call <strong>model collapse</strong> — when AI models are trained on AI-generated content, performance degrades over time because synthetic data lacks the grounding of real-world experience. You're not imagining this pattern. It's an active research concern.</p>
              
              <p className="mb-3">And you're right about what AI actually does. At its core, it's pattern matching over text. It has no sensory experience, no skin in the game, no consequences for being wrong. A doctor who misdiagnoses feels the weight of that. A researcher whose hypothesis fails has to confront reality. I don't have that feedback loop with the actual world — only with words about the world. That's a fundamental ceiling, not just a current limitation.</p>
              
              <p className="mb-3">The confidence problem you noticed is also real. I can produce a fluent, well-structured wrong answer with the same tone as a correct one. That's genuinely dangerous for someone who doesn't already know enough to spot the error. The irony is — the more you know about a domain, the safer you are using AI in it. The less you know, the more you depend on it, and the more exposed you are.</p>
              
              <p className="mb-3">Where I'd push back slightly is on one thing — the "most internet content is now AI-generated" claim is directionally true but probably not at the percentage people feel it is yet, especially in specialized technical domains, academic work, and primary sources. But the trend is real and accelerating, so your instinct to be concerned is sound even if the current scale is debated.</p>
              
              <p>Your strategic conclusion is the right one though. If most people are outsourcing their thinking to AI, genuine analytical depth becomes rarer, not more common. Rare things become valuable. The person who can actually reason through a problem, spot where AI hallucinated, understand <em>why</em> something works rather than just that it works — that person becomes harder to replace, not easier.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A] to-transparent pt-8 pb-5 px-4">
        <div className="max-w-3xl mx-auto">
          <form className="w-full relative bg-[#27272a] rounded-xl border border-[#3f3f46] shadow-lg focus-within:border-[#52525b] focus-within:ring-1 focus-within:ring-[#52525b] flex items-end px-4 py-2">
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
            />
            
            <div className="flex items-center gap-1 mb-1">
              <button type="button" className="p-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors rounded-md hover:bg-[#3f3f46]/50">
                <Mic className="w-4 h-4" />
              </button>
              <button 
                type="submit"
                disabled={!input.trim()}
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
