import { useEffect, useState } from 'react';
import { CheckCircle2, Globe, Loader2, Sparkles, BarChart3, LayoutTemplate, Link as LinkIcon  } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- AUTONOMOUS ANIMATED HERO MOCKUP ---

export function AnimatedBuilder() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500); // Progress to next step every 2.5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 animate-rise-in perspective-[2000px]">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/60 p-2 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl ring-1 ring-black/5">
        
        {/* Mac-style Window Header */}
        <div className="flex h-12 items-center justify-between rounded-t-[1.75rem] border-b border-slate-100 bg-white/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-slate-200"></div>
            <div className="size-3 rounded-full bg-slate-200"></div>
            <div className="size-3 rounded-full bg-slate-200"></div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            <LockIcon className="size-3" /> formbuilder.page/editor
          </div>
          <div className="w-12"></div> {/* Spacer for balance */}
        </div>
        
        {/* Animated Editor Content */}
        <div className="relative h-[450px] bg-slate-50/50 p-6 flex flex-col items-center justify-center overflow-hidden rounded-b-[1.75rem]">
          
          {/* STEP 0: Loading Workspace */}
          <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-500", step === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
            <Loader2 className="size-8 animate-spin text-violet-600 mb-4" />
            <div className="text-sm font-semibold text-slate-500">Initializing Workspace...</div>
          </div>

          {/* STEP 1: Building Form */}
          <div className={cn("absolute inset-0 p-8 transition-all duration-700", step === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none")}>
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <div className="h-14 w-3/4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center px-4 animate-pulse">
                <div className="h-6 w-1/2 bg-slate-100 rounded-md"></div>
              </div>
              <div className="h-24 w-full rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center px-4 space-y-3 delay-100 animate-pulse">
                 <div className="h-4 w-1/4 bg-slate-100 rounded-md"></div>
                 <div className="h-10 w-full bg-slate-50 rounded-md border border-slate-100"></div>
              </div>
              <div className="h-24 w-full rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center px-4 space-y-3 delay-200 animate-pulse">
                 <div className="h-4 w-1/3 bg-slate-100 rounded-md"></div>
                 <div className="h-10 w-full bg-slate-50 rounded-md border border-slate-100"></div>
              </div>
            </div>
          </div>

          {/* STEP 2: Publishing */}
          <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-500", step === 2 ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none")}>
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
                <div className="relative flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 mb-4">
                  <div className="absolute inset-0 rounded-2xl border-4 border-violet-600 border-t-transparent animate-spin"></div>
                  <Sparkles className="size-6" />
                </div>
                <div className="text-lg font-bold text-slate-900">Publishing Form...</div>
                <div className="text-sm text-slate-500 mt-1">Generating secure public link</div>
             </div>
          </div>

          {/* STEP 3: Live & Ready */}
          <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 bg-emerald-50/30", step === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
             <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-emerald-100 border border-emerald-100 text-center max-w-md w-full">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                  <CheckCircle2 className="size-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Your form is live!</h3>
                <p className="text-slate-500 mt-2 mb-8">Share this link to start collecting responses.</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                   <Globe className="size-5 text-slate-400 shrink-0" />
                   <div className="text-sm font-semibold text-slate-700 truncate w-full text-left">formbuilder.page/f/xyz-123</div>
                   <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50">Copy</div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple Lock icon helper for the mock browser bar
export function LockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

// --- ANIMATED GRID & METEORS BACKGROUND ---
export function GridMeteors() {
  // Hardcoded random properties for server/client hydration safety
  const meteors = [
    { n: -8, delay: 0.2, dur: 4.1 },
    { n: -5, delay: 1.5, dur: 3.5 },
    { n: -3, delay: 0.8, dur: 4.8 },
    { n: 2, delay: 2.1, dur: 3.2 },
    { n: 4, delay: 0.5, dur: 4.5 },
    { n: 7, delay: 1.1, dur: 3.8 },
    { n: 10, delay: 2.5, dur: 4.2 },
    { n: -1, delay: 3.2, dur: 3.9 },
    { n: 6, delay: 2.8, dur: 4.0 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* CSS Keyframes injected safely */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes meteor-drop {
          0% { transform: translateY(-200px); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(1200px); opacity: 0; }
        }
      `}} />

      {/* Grid Pattern centered so meteors snap to lines exactly */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"
        style={{ backgroundSize: '64px 64px', backgroundPosition: 'center top' }}
      ></div>
      
      {/* Central Ambient Glow */}
      <div className="absolute left-1/2 top-0 h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_60%)] blur-3xl"></div>

      {/* Meteors dropping on the grid lines */}
      {meteors.map((m, i) => (
        <div
          key={i}
          className="absolute top-0 w-[1px] h-[150px] bg-gradient-to-b from-transparent via-violet-400/40 to-violet-600 drop-shadow-[0_0_4px_rgba(124,58,237,0.8)]"
          style={{
            // background-position: center places the tile center at 50%. 
            // So the lines (left edge of the 64px tile) are exactly offset by 32px.
            left: `calc(50% + ${(m.n * 64) - 32}px)`,
            animation: `meteor-drop ${m.dur}s linear infinite`,
            animationDelay: `${m.delay}s`,
            opacity: 0
          }}
        >
          {/* Sharp glowing head of the meteor */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-[2px] rounded-full bg-white shadow-[0_0_8px_2px_rgba(124,58,237,1)]"></div>
        </div>
      ))}
    </div>
  );
}


export function FeatureMockup({ index }) {
  if (index === 0) {
    // 🛠️ BUILDER MOCKUP
    return (
      <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-[4/5] sm:aspect-square rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 bg-white/40 p-4 sm:p-6 md:p-8 shadow-2xl shadow-violet-200/50 backdrop-blur-xl animate-float-slow transform-gpu sm:rotate-y-[-5deg] sm:rotate-x-[5deg] perspective-[1000px] transition-all">
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-tr from-white/80 to-white/20"></div>
        <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm">
          
          {/* Mock Browser/App Header */}
          <div className="flex h-8 sm:h-10 items-center gap-1.5 sm:gap-2 border-b border-slate-100 bg-slate-50/80 px-3 sm:px-4">
            <div className="size-2 sm:size-2.5 rounded-full bg-slate-300"></div>
            <div className="size-2 sm:size-2.5 rounded-full bg-slate-300"></div>
            <div className="size-2 sm:size-2.5 rounded-full bg-slate-300"></div>
            <div className="ml-auto flex items-center gap-2 rounded-md bg-white px-2 py-1 shadow-sm border border-slate-100">
               <LayoutTemplate className="size-3 text-violet-400" />
               <div className="h-1.5 w-12 rounded-full bg-slate-200"></div>
            </div>
          </div>

          {/* Mock Builder Area */}
          <div className="flex flex-1 p-3 sm:p-5 gap-3 sm:gap-4">
            {/* Sidebar Skeleton */}
            <div className="hidden w-1/4 flex-col gap-2 border-r border-slate-100 pr-3 sm:flex">
              <div className="h-4 w-full rounded bg-slate-100"></div>
              <div className="h-4 w-5/6 rounded bg-slate-100"></div>
              <div className="h-4 w-full rounded bg-slate-100"></div>
            </div>
            
            {/* Main Canvas Skeleton */}
            <div className="flex w-full sm:w-3/4 flex-col space-y-3 sm:space-y-4">
              <div className="mb-2 sm:mb-4 h-6 sm:h-8 w-2/3 rounded-lg bg-slate-100"></div>
              
              {/* Active Field */}
              <div className="flex min-h-[2.5rem] sm:min-h-[3rem] w-full items-center rounded-lg sm:rounded-xl border border-violet-200 bg-violet-50/50 px-3 sm:px-4 shadow-sm ring-1 ring-violet-500/10">
                <div className="h-3 sm:h-4 w-1/3 rounded bg-violet-200"></div>
              </div>
              
              {/* Inactive Fields */}
              <div className="flex min-h-[2.5rem] sm:min-h-[3rem] w-full items-center rounded-lg sm:rounded-xl border border-slate-100 bg-white px-3 sm:px-4">
                <div className="h-3 sm:h-4 w-1/2 rounded bg-slate-100"></div>
              </div>
              <div className="flex min-h-[2.5rem] sm:min-h-[3rem] w-full items-center rounded-lg sm:rounded-xl border border-slate-100 bg-white px-3 sm:px-4">
                <div className="h-3 sm:h-4 w-2/5 rounded bg-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (index === 1) {
    // 📊 ANALYTICS MOCKUP
    return (
      <div 
        className="relative mx-auto w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-[4/5] sm:aspect-square rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 bg-white/40 p-4 sm:p-6 md:p-8 shadow-2xl shadow-emerald-200/50 backdrop-blur-xl animate-float-slow transform-gpu sm:rotate-y-[5deg] sm:rotate-x-[5deg] perspective-[1000px] transition-all" 
        style={{ animationDelay: '1s' }}
      >
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-tr from-white/80 to-white/20"></div>
        <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/60 bg-white/90 p-4 sm:p-6 shadow-sm">
           
           {/* Header Stats */}
           <div className="mb-6 sm:mb-8 flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 sm:h-6 w-24 sm:w-32 rounded-md bg-slate-100"></div>
                <div className="h-3 w-16 rounded-md bg-slate-50"></div>
              </div>
              <div className="flex h-6 sm:h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-2 sm:px-3 border border-emerald-100">
                 <BarChart3 className="size-3 sm:size-4 text-emerald-500" />
                 <div className="h-2 w-8 sm:w-10 rounded-full bg-emerald-200"></div>
              </div>
           </div>

           {/* Chart Area */}
           <div className="relative flex flex-1 items-end gap-1.5 sm:gap-3 px-1 sm:px-2">
              {/* Subtle background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-20">
                 <div className="w-full border-t-2 border-dashed border-slate-300"></div>
                 <div className="w-full border-t-2 border-dashed border-slate-300"></div>
                 <div className="w-full border-t-2 border-dashed border-slate-300"></div>
              </div>

              {/* Bars */}
              {[40, 70, 45, 90, 60, 100, 85].map((h, i) => (
                 <div 
                   key={i} 
                   className="group relative z-10 w-full rounded-t-md sm:rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 transition-all hover:opacity-80" 
                   style={{ height: `${h}%` }}
                 >
                    {/* Hover Tooltip Mock */}
                    {i === 5 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 shadow-lg">
                        <div className="h-1.5 w-6 rounded-full bg-white/80"></div>
                      </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // 🚀 PUBLISH MOCKUP
  return (
    <div 
      className="relative mx-auto w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-[4/5] sm:aspect-square rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 bg-white/40 p-4 sm:p-6 md:p-8 shadow-2xl shadow-amber-200/50 backdrop-blur-xl animate-float-slow transform-gpu sm:rotate-y-[-5deg] sm:rotate-x-[5deg] perspective-[1000px] transition-all" 
      style={{ animationDelay: '2s' }}
    >
      <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-tr from-white/80 to-white/20"></div>
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/60 bg-white/90 p-6 sm:p-8 text-center shadow-sm">
         
         {/* Success Icon */}
         <div className="mb-4 sm:mb-6 flex size-16 sm:size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-50 shadow-inner ring-1 ring-amber-200/50">
            <CheckCircle2 className="size-8 sm:size-10 text-amber-500" />
         </div>
         
         {/* Text Skeletons */}
         <div className="mb-2 sm:mb-3 h-5 sm:h-6 w-3/4 rounded-md bg-slate-100"></div>
         <div className="mb-6 sm:mb-8 h-3 sm:h-4 w-1/2 rounded-md bg-slate-50"></div>
         
         {/* Link Copy UI */}
         <div className="flex h-10 sm:h-12 w-full items-center justify-between rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/50 px-2 sm:px-3">
            <div className="flex items-center gap-2 w-2/3">
              <LinkIcon className="size-3 sm:size-4 text-slate-400" />
              <div className="h-3 sm:h-4 w-full rounded bg-slate-200"></div>
            </div>
            <div className="h-6 sm:h-8 w-12 sm:w-16 rounded-md sm:rounded-lg border border-slate-200 bg-white shadow-sm"></div>
         </div>

         {/* Share Bubbles */}
         <div className="mt-4 flex gap-2">
            <div className="size-6 sm:size-8 rounded-full bg-slate-100 border border-slate-200"></div>
            <div className="size-6 sm:size-8 rounded-full bg-slate-100 border border-slate-200"></div>
            <div className="size-6 sm:size-8 rounded-full bg-slate-100 border border-slate-200"></div>
         </div>
      </div>
    </div>
  );
}

 