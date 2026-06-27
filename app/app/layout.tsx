"use client";
import "highlight.js/styles/github-dark.css";
import { UserButton } from "@clerk/nextjs";
import { Plus, Sparkles, PanelLeft, MoreHorizontal, Share, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChatProvider, useChat } from "./ChatContext";

function AppLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isSidebarOpen,
    todaySessions,
    previousSessions,
    activeMenuId,
    toasts,
    activeSessionId,
    setIsSidebarOpen,
    setActiveMenuId,
    showToast,
    handleDeleteSession,
  } = useChat();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".menu-trigger") || target.closest(".menu-dropdown")) {
        return;
      }
      setActiveMenuId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setActiveMenuId]);

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/app/${id}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!", "success");
  };

  const isNewChat = pathname === "/app";

  return (
    <div className="flex h-screen w-full bg-[#1A1A1A] text-[#e4e4e7] overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #27272a transparent;
        }
        @keyframes slideIn {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}} />
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
          <Link 
            href="/app" 
            className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2 rounded-lg text-[14px] transition-colors border ${
              isNewChat 
                ? 'bg-[#27272a] text-white border-[#52525b]' 
                : 'hover:bg-[#27272a] border-[#3f3f46]/50 bg-[#1e1e1e]'
            }`}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">New chat</span>}
          </Link>
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto px-3 mt-4 transition-opacity duration-300 opacity-100 sidebar-scroll">
            {todaySessions.length > 0 && (
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-[#71717a] px-3 mb-1 uppercase tracking-wider">
                  Today
                </div>
                <div className="flex flex-col gap-0.5">
                  {todaySessions.map((chat) => (
                    <div 
                      key={chat.id}
                      className={`group relative flex items-center justify-between rounded-md text-[13px] text-[#d4d4d8] transition-colors ${
                        activeSessionId === chat.id ? 'bg-[#27272a] text-white' : 'hover:bg-[#27272a]'
                      }`}
                    >
                      <Link 
                        href={`/app/${chat.id}`}
                        className="flex-1 px-3 py-1.5 truncate pr-8"
                      >
                        {chat.session_title || "New chat"}
                      </Link>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                        }}
                        className={`menu-trigger absolute right-1 z-10 p-1 hover:text-[#e4e4e7] text-[#a1a1aa] transition-opacity duration-150 rounded hover:bg-[#3f3f46]/50 ${activeMenuId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === chat.id && (
                        <div className="menu-dropdown absolute right-1 top-7 z-50 w-28 bg-[#1e1e1e] border border-[#3f3f46] rounded-md shadow-xl py-1">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare(chat.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#27272a] text-[#d4d4d8] text-[12px] flex items-center gap-2"
                          >
                            <Share className="w-3.5 h-3.5" />
                            Share
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteSession(chat.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#27272a] text-red-400 text-[12px] flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {previousSessions.length > 0 && (
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-[#71717a] px-3 mb-1 uppercase tracking-wider">
                  Previous
                </div>
                <div className="flex flex-col gap-0.5">
                  {previousSessions.map((chat) => (
                    <div 
                      key={chat.id}
                      className={`group relative flex items-center justify-between rounded-md text-[13px] text-[#d4d4d8] transition-colors ${
                        activeSessionId === chat.id ? 'bg-[#27272a] text-white' : 'hover:bg-[#27272a]'
                      }`}
                    >
                      <Link 
                        href={`/app/${chat.id}`}
                        className="flex-1 px-3 py-1.5 truncate pr-8"
                      >
                        {chat.session_title || "New chat"}
                      </Link>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === chat.id ? null : chat.id);
                        }}
                        className={`menu-trigger absolute right-1 z-10 p-1 hover:text-[#e4e4e7] text-[#a1a1aa] transition-opacity duration-150 rounded hover:bg-[#3f3f46]/50 ${activeMenuId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === chat.id && (
                        <div className="menu-dropdown absolute right-1 top-7 z-50 w-28 bg-[#1e1e1e] border border-[#3f3f46] rounded-md shadow-xl py-1">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleShare(chat.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#27272a] text-[#d4d4d8] text-[12px] flex items-center gap-2"
                          >
                            <Share className="w-3.5 h-3.5" />
                            Share
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteSession(chat.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#27272a] text-red-400 text-[12px] flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-[13px] border transition-all duration-300 animate-slide-in pointer-events-auto ${
              toast.type === "success"
                ? "bg-[#1e1e1e]/90 text-[#e4e4e7] border-[#22c55e]/30"
                : "bg-[#1e1e1e]/90 text-[#e4e4e7] border-red-500/30"
            }`}
          >
            {toast.type === "success" ? (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ChatProvider>
  );
}
