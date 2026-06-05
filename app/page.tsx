"use client";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";

const Stars = () => {
  const [stars, setStars] = useState<{ id: number, top: string, left: string, size: string, delay: string, opacity: number }[]>([]);

  useEffect(() => {
    // Generate stars only on client side to avoid hydration mismatch
    const generated = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 0.5}px`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.7 + 0.3
    }));
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-[pulse_4s_ease-in-out_infinite]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#0a0a0a] overflow-hidden selection:bg-[#333] selection:text-white">
      {/* Left Section - Auth */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 z-10 relative">
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="text-center mb-10 mt-8">
            <h1 className="text-5xl md:text-6xl font-serif text-[#e4e4e7] mb-4 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Think fast,<br />
              learn fast
            </h1>

          </div>

          <div className="w-full relative flex justify-center pb-8">
            <SignIn 
              routing="hash"
              fallbackRedirectUrl="/app"
              appearance={{
                baseTheme: dark,
                variables: {
                  colorBackground: 'transparent',
                  colorText: '#ffffff',
                  colorPrimary: '#ffffff',
                  colorInputBackground: '#18181b',
                  colorInputText: '#ffffff',
                  colorTextSecondary: '#a1a1aa',
                },
                elements: {
                  rootBox: "w-full mx-auto",
                  cardBox: "shadow-none",
                  card: "bg-transparent shadow-none border border-[#3f3f46] rounded-[24px] w-full max-w-sm mx-auto p-8 backdrop-blur-sm",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "!bg-[#121212] border border-[#3f3f46] hover:!bg-[#27272a] hover:border-[#52525b] !text-white rounded-xl py-3 px-4 transition-all shadow-sm",
                  socialButtonsBlockButtonText: "!text-white font-medium text-[15px]",
                  socialButtonsBlockButtonArrow: "!text-white",
                  dividerRow: "my-6",
                  dividerLine: "bg-[#3f3f46]",
                  dividerText: "!text-[#a1a1aa] text-[13px] uppercase tracking-wider",
                  formFieldLabel: "!text-[#e4e4e7] font-medium mb-1.5",
                  formFieldInput: "!bg-[#121212] border border-[#3f3f46] !text-white rounded-xl py-3.5 px-4 focus:ring-1 focus:ring-white focus:border-white transition-all placeholder:!text-[#71717a]",
                  formButtonPrimary: "!bg-white hover:!bg-gray-200 !text-black rounded-xl py-3.5 font-semibold text-[15px] transition-colors w-full mt-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]",
                  footerAction: "mt-4 flex justify-center",
                  footerActionText: "!text-[#a1a1aa] text-[14px]",
                  footerActionLink: "!text-white font-medium hover:underline text-[14px]",
                  form: "mt-0",
                  identityPreviewEditButtonIcon: "!text-[#a1a1aa]",
                  identityPreviewText: "!text-white",
                  identityPreview: "bg-[#121212] border border-[#3f3f46] rounded-xl",
                  formResendCodeLink: "!text-white hover:underline",
                  footer: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: false,
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Section - Animation */}
      <div className="hidden lg:flex w-1/2 relative bg-[#050505] items-center justify-center overflow-hidden border-l border-[#1f1f1f]">
        <Stars />

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-900/10 rounded-full blur-[100px]"></div>

        {/* Orbit System */}
        <div className="relative flex items-center justify-center w-[900px] h-[900px] scale-[0.85] 2xl:scale-100">
          {/* Orbits */}
          <div className="absolute inset-0 rounded-full border border-[#ffffff08] animate-[spin_120s_linear_infinite]"></div>
          <div className="absolute inset-16 rounded-full border border-[#ffffff0a] animate-[spin_90s_linear_infinite_reverse]"></div>
          <div className="absolute inset-36 rounded-full border border-dashed border-[#ffffff10] animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute inset-64 rounded-full border border-[#ffffff0a] animate-[spin_40s_linear_infinite_reverse]"></div>

          {/* Earth */}
          <div className="absolute w-56 h-56 rounded-full overflow-hidden shadow-[0_0_80px_rgba(30,144,255,0.15)] bg-[#0d1b2a]">
            <div className="w-[200%] h-full earth-texture absolute left-0 top-0"></div>
            {/* Atmosphere glow */}
            <div className="absolute inset-0 rounded-full shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.9),inset_4px_4px_20px_rgba(100,200,255,0.3)] z-10"></div>
          </div>

          {/* Orbiting Moons / Satellites */}
          <div className="absolute w-[600px] h-[600px] animate-[spin_25s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -ml-3 w-6 h-6 bg-[#e4e4e7] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
          </div>
          <div className="absolute w-[450px] h-[450px] animate-[spin_15s_linear_infinite_reverse]">
            <div className="absolute bottom-0 left-1/2 -ml-2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"></div>
          </div>
          <div className="absolute w-[800px] h-[800px] animate-[spin_40s_linear_infinite]">
            <div className="absolute top-1/4 right-0 -mr-1.5 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
