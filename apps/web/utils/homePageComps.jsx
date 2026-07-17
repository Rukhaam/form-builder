import { useEffect, useState } from 'react';
import {
  AlignLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  GripVertical,
  Hash,
  LayoutTemplate,
  Link as LinkIcon,
  ListChecks,
  Mail,
  Plus,
  Send,
  TextCursorInput,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- AUTONOMOUS ANIMATED HERO MOCKUP ---

export function AnimatedBuilder() {
  const [step, setStep] = useState(0);

  const builderFields = [
    { type: 'short_text', label: 'Full name', name: 'Short text', icon: TextCursorInput, required: true },
    { type: 'email', label: 'Work email', name: 'Email', icon: Mail, required: true },
    { type: 'long_text', label: 'What should we know?', name: 'Paragraph', icon: AlignLeft, required: false },
    { type: 'number', label: 'Team size', name: 'Number', icon: Hash, required: false },
    { type: 'single_select', label: 'Project stage', name: 'Single select', icon: ListChecks, required: true },
    { type: 'checkbox', label: 'Topics to cover', name: 'Checkboxes', icon: ListChecks, required: false },
  ];
  const activeIndex = step % builderFields.length;
  const activeField = builderFields[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto mt-14 w-full max-w-6xl animate-rise-in px-3 sm:px-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes builder-drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes builder-pop {
          0% { opacity: 0; transform: translateY(10px) scale(.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes builder-caret {
          0%, 45% { opacity: 1; }
          46%, 100% { opacity: 0; }
        }
        @keyframes builder-sweep {
          0% { transform: translateX(-115%); opacity: 0; }
          18%, 72% { opacity: .55; }
          100% { transform: translateX(115%); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-animated-builder] *, [data-animated-builder] { animation: none !important; transition-duration: 0ms !important; }
        }
      `}} />

      <div data-animated-builder className="relative mb-0 overflow-hidden rounded-2xl border border-slate-200 bg-white [animation:builder-drift_9s_ease-in-out_infinite]">
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-slate-300" />
            <span className="size-2 rounded-full bg-slate-400" />
            <span className="size-2 rounded-full bg-slate-300" />
          </div>
          <div className="hidden min-w-0 items-center gap-2 text-xs font-medium text-slate-600 sm:flex">
            <LayoutTemplate className="size-3.5 text-slate-500" />
            <span className="truncate">FormBuilder / customer-intake</span>
          </div>
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white">
            <Send className="size-3" />
            Publish
          </button>
        </div>

        <div className="relative h-[470px] overflow-hidden bg-slate-50/80 p-2 sm:h-[520px] sm:p-3 lg:h-[550px]">

          <div className="grid h-full grid-cols-1 gap-2.5 lg:grid-cols-[200px_minmax(0,1fr)_250px]">
            <aside className="hidden rounded-xl border border-slate-200 bg-white p-3.5 lg:block">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Field toolbox</span>
                <Plus className="size-3.5 text-slate-500" />
              </div>
              <div className="grid gap-2">
                {builderFields.map((field, index) => {
                  const Icon = field.icon;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={field.type}
                      type="button"
                      className={cn(
                        "flex h-10 items-center gap-2 rounded-md border px-2.5 text-left text-xs font-medium transition-all duration-700 ease-out",
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-transparent bg-slate-50 text-slate-600",
                      )}
                    >
                      <Icon className={cn("size-3.5 transition-colors duration-700", isActive ? "text-white" : "text-slate-500")} />
                      <span className="truncate">{field.name}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="grid h-full min-h-0 gap-2.5 sm:grid-cols-5 sm:grid-rows-[124px_minmax(0,1fr)]">
              <section className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Form details</span>
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600">Draft</span>
                </div>
                <div className="space-y-3">
                  <div className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                    Customer intake form
                  </div>
                  <div className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium leading-relaxed text-slate-500">
                    Tell us what you need and where your project stands.
                  </div>
                </div>
              </section>

              <section className="hidden rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2 sm:block">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Settings</span>
                  <span className="size-2 rounded-full bg-black" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Public', 'Light', 'No expiry', 'Unlimited'].map((item) => (
                    <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="relative min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:col-span-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Builder canvas</div>
                    <div className="mt-1 text-xs font-medium text-slate-400">{builderFields.length} fields arranged</div>
                  </div>
                  <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 sm:flex">
                    <GripVertical className="size-3.5" />
                    Reorder
                  </div>
                </div>

                <div className="grid h-[280px] min-h-0 grid-cols-2 gap-2.5 sm:h-[calc(100%-48px)]">
                  {builderFields.slice(0, 4).map((field, index) => {
                    const isActive = index === activeIndex || (activeIndex > 3 && index === 3);
                    const Icon = field.icon;

                    return (
                      <article
                        key={field.type}
                        className={cn(
                          "relative overflow-hidden rounded-lg border bg-white p-3 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
                          isActive ? "scale-[1.01] border-slate-900" : "border-slate-200",
                        )}
                        style={{ animation: 'builder-pop 620ms ease both', animationDelay: `${index * 80}ms` }}
                      >
                        {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-black" />}
                        {isActive && <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.055),transparent)] [animation:builder-sweep_1.4s_ease-in-out_infinite]" />}

                        <div className="relative flex items-start gap-3">
                          <div className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md border transition-all duration-700",
                            isActive ? "border-black bg-black text-white" : "border-slate-200 bg-slate-50 text-slate-500",
                          )}>
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate text-sm font-semibold text-slate-950">
                                {field.label} {field.required && <span className="text-slate-400">*</span>}
                              </div>
                              <span className="hidden rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:block">
                                {field.name}
                              </span>
                            </div>

                            {field.type === 'single_select' || field.type === 'checkbox' ? (
                              <div className="mt-3 grid gap-1.5">
                                {['Planning', 'Design', 'Launch'].map((option, optionIndex) => (
                                  <div key={option} className="flex h-7 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600">
                                    <span className={cn("size-3 border border-slate-400", field.type === 'checkbox' ? "rounded-sm" : "rounded-full", isActive && optionIndex === 0 && "bg-black")} />
                                    {option}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-3 h-9 rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
                                <div className={cn("h-3 rounded-sm bg-slate-300 transition-all duration-700", isActive ? "w-2/3" : "w-1/3")} />
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </main>

            <aside className="hidden min-h-0 grid-rows-[1fr_124px] gap-2.5 lg:grid">
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview</div>
                    <div className="mt-1 text-xs font-medium text-slate-400">Respondent view</div>
                  </div>
                  <Eye className="size-4 text-slate-500" />
                </div>
                <div className="space-y-4 rounded-lg bg-slate-50 p-3">
                  <div>
                    <div className="text-base font-semibold text-slate-950">Customer intake form</div>
                    <div className="mt-1 text-xs font-medium leading-relaxed text-slate-500">A clean public form preview.</div>
                  </div>
                  {builderFields.slice(0, 3).map((field, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div key={`${field.type}-preview`} className="space-y-2">
                        <div className={cn("text-xs font-semibold transition-colors duration-700", isActive ? "text-black" : "text-slate-600")}>{field.label}</div>
                        <div className={cn("h-9 rounded-md border bg-white transition-all duration-700", isActive ? "border-black" : "border-slate-200")} />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl bg-slate-900 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/55">Active field</div>
                    <div key={activeField.type} className="mt-2 text-lg font-semibold tracking-tight [animation:builder-pop_480ms_ease_both]">{activeField.label}</div>
                  </div>
                  <CheckCircle2 className="size-5 text-white" />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-white/20 px-3 py-2">
                  <span className="text-xs font-medium text-white/70">Saved</span>
                  <span className="h-4 w-px bg-white [animation:builder-caret_1s_steps(1)_infinite]" />
                </div>
              </section>
            </aside>
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
      <div className="absolute left-1/2 top-0 h-[800px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_60%)] blur-3xl"></div>

      {/* Meteors dropping on the grid lines */}
      {meteors.map((m, i) => (
        <div
          key={i}
          className="absolute top-0 w-[1px] h-[150px] bg-gradient-to-b from-transparent via-slate-400/40 to-black drop-shadow-[0_0_4px_rgba(0,0,0,0.45)]"
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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-[2px] rounded-full bg-white shadow-[0_0_8px_2px_rgba(0,0,0,0.75)]"></div>
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

 
