import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col selection:bg-[#333]">
      <header className="border-b border-[#27272a] h-16 flex items-center justify-between px-8 bg-[#0f0f0f]">
        <div className="font-serif text-xl font-bold tracking-tight">Think fast, learn fast</div>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 border border-[#27272a]"
            }
          }}
        />
      </header>
      
      <main className="flex-1 p-8 flex flex-col max-w-6xl w-full mx-auto">
        <div className="flex flex-col gap-2 mb-10 mt-8">
          <h1 className="text-3xl font-semibold text-[#e4e4e7]">Dashboard</h1>
          <p className="text-[#a1a1aa]">Welcome back. Ready to learn fast?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl border border-[#27272a] bg-[#121212] p-6 hover:border-[#3f3f46] transition-colors flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-[#1e1e24] flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-[#52525b]"></div>
              </div>
              <div>
                <h3 className="font-medium text-[#e4e4e7]">Recent Activity {i}</h3>
                <p className="text-sm text-[#71717a] mt-1">Chat history and files</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
