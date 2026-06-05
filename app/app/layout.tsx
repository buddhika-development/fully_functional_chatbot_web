"use client";
import { UserButton } from "@clerk/nextjs";
import { Plus, Sparkles, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-[#1A1A1A] text-[#e4e4e7] overflow-hidden font-sans">
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-[260px]' : 'w-[60px]'} flex-shrink-0 flex flex-col bg-[#111111] border-r border-[#27272a] h-full transition-all duration-300 ease-in-out`}
      >
        <div className="p-3 flex items-center h-14">
          {isSidebarOpen ? (
            <>
              <div className="font-serif text-xl tracking-tight flex items-center gap-2 flex-1 overflow-hidden whitespace-nowrap">
                <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0" />
                Think fast
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-[#a1a1aa] hover:text-[#e4e4e7] p-1.5 rounded-md hover:bg-[#27272a] flex-shrink-0 transition-colors">
                 <PanelLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => setIsSidebarOpen(true)} className="mx-auto text-[#a1a1aa] hover:text-[#e4e4e7] p-1.5 rounded-md hover:bg-[#27272a] transition-colors">
               <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-3 py-1">
          <Link href="/app" className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2 rounded-lg hover:bg-[#27272a] text-[14px] transition-colors border border-[#3f3f46]/50 bg-[#1e1e1e]`}>
            <Plus className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">New chat</span>}
          </Link>
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto px-3 mt-4 transition-opacity duration-300 opacity-100">
            <div className="text-[11px] font-semibold text-[#71717a] px-3 mb-1 uppercase tracking-wider">
              Recents
            </div>
            <div className="flex flex-col gap-0">
              {[
                { id: "1", title: "Database null constraint violation" },
                { id: "2", title: "Industrial FastAPI project structure" },
                { id: "3", title: "Understanding machine learning" },
                { id: "4", title: "Chatbot personalization explained" },
                { id: "5", title: "Evaluating expense tracking data" },
                { id: "6", title: "React Router syntax error" },
              ].map((chat) => (
                <Link 
                  key={chat.id} 
                  href={`/app/${chat.id}`}
                  className="block px-3 py-1.5 rounded-md hover:bg-[#27272a] text-[13px] text-[#d4d4d8] truncate transition-colors"
                >
                  {chat.title}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {!isSidebarOpen && <div className="flex-1"></div>}

        <div className={`p-3 border-t border-[#27272a] flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} mt-auto min-h-[60px]`}>
          <UserButton 
            showName={isSidebarOpen}
            appearance={{
              elements: {
                rootBox: "w-full",
                userButtonTrigger: `w-full flex items-center justify-start ${isSidebarOpen ? 'px-2 py-1.5 hover:bg-[#27272a] rounded-lg' : 'justify-center'} transition-colors`,
                userButtonBox: `${isSidebarOpen ? 'flex-row justify-start w-full items-center' : ''}`,
                userButtonOuterIdentifier: "text-[14px] font-semibold !text-white truncate ml-2",
                avatarBox: "w-8 h-8 rounded-full border border-[#3f3f46] flex-shrink-0"
              }
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
