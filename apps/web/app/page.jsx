'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, FileText, ListChecks, ShieldCheck, Sparkles, Wand2, Loader2, Globe,Palette } from 'lucide-react';
import SplitText from '@/components/ui/SplitText';

import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSessionUser } from '@/lib/auth';

const features = [
  {
    icon: Wand2,
    title: 'Fast builder',
    copy: 'Compose clean forms with field controls, choice options, drafts, and publishing in one focused workspace.',
  },
  {
    icon: BarChart3,
    title: 'Live analytics',
    copy: 'Track responses, fields, and individual submissions without leaving the dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Public sharing',
    copy: 'Publish forms to a browsable public gallery while keeping private work inside your dashboard.',
  },
];
const templatesPreview = [
  {
    title: "Customer Satisfaction Survey",
    category: "Feedback",
    description: "Measure customer happiness and gather actionable feedback with this clean, multi-step survey.",
    imageUrl: "https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20May%2024%2C%202026%2C%2001_23_49%20PM.png"
  },
  {
    title: "Job Application Form",
    category: "HR & Recruiting",
    description: "Streamline your hiring process. Collect resumes, portfolios, and contact info in one professional place.",
    imageUrl: "https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20May%2024%2C%202026%2C%2001_41_39%20PM.png"
  },
  {
    title: "Event Registration",
    category: "Marketing",
    description: "Boost attendance with a frictionless signup form. Includes custom fields for capacity and waitlisting.",
    imageUrl: "https://pub-749dd85c25e04947af34140aef9172fc.r2.dev/form-builder/ChatGPT%20Image%20May%2024%2C%202026%2C%2001_44_26%20PM.png"
  }
];
const faqs = [
  {
    question: 'Can people answer forms without an account?',
    answer: 'Yes. Published public forms can be opened from the forms gallery and submitted without signing in.',
  },
  {
    question: 'Can I keep a form as a draft?',
    answer: 'Yes. Save as draft while editing, then publish when the form is ready for responses.',
  },
  {
    question: 'Where do responses appear?',
    answer: 'Responses appear in the analytics area for each form, with totals and individual answer rows.',
  },
  {
    question: 'Can I edit fields after creating a form?',
    answer: 'Yes. You can edit labels, types, options, required state, and ordering in the editor.',
  },
];
const extendedFeatures = [
  {
    pill: 'Builder',
    title: 'Fast, intuitive form builder.',
    description: 'Compose clean forms with field controls, choice options, drafts, and publishing in one focused workspace. No messy sidebars or complex menus.',
    checklist: ['Drag-and-drop ordering', '7+ custom field types', 'Auto-save drafts'],
    color: 'from-violet-500/20 to-indigo-500/20',
    blob: 'bg-violet-500',
  },
  {
    pill: 'Insights',
    title: 'Live analytics & reporting.',
    description: 'Track responses, fields, and individual submissions without leaving the dashboard. Understand your completion rates and data at a glance.',
    checklist: ['Real-time response tracking', 'Visual charts & curves', 'Individual submission views'],
    color: 'from-emerald-500/20 to-teal-500/20',
    blob: 'bg-emerald-500',
  },
  {
    pill: 'Distribution',
    title: 'Seamless public sharing.',
    description: 'Publish forms to a browsable public gallery while keeping private work inside your dashboard. Generate secure links instantly.',
    checklist: ['One-click publishing', 'Password protection', 'Community gallery listing'],
    color: 'from-amber-500/20 to-orange-500/20',
    blob: 'bg-amber-500',
  },
];
// --- AUTONOMOUS ANIMATED HERO MOCKUP ---
function AnimatedBuilder() {
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
function LockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

// --- ANIMATED GRID & METEORS BACKGROUND ---
function GridMeteors() {
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
function FeatureMockup({ index }) {
  if (index === 0) {
    // BUILDER MOCKUP
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-2xl shadow-violet-200/50 backdrop-blur-xl animate-float-slow transform-gpu rotate-y-[-5deg] rotate-x-[5deg] perspective-[1000px]">
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/80 to-white/20"></div>
        <div className="relative z-10 h-full w-full rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm overflow-hidden flex flex-col">
          <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
             <div className="size-2.5 rounded-full bg-slate-300"></div>
             <div className="size-2.5 rounded-full bg-slate-300"></div>
             <div className="size-2.5 rounded-full bg-slate-300"></div>
          </div>
          <div className="p-5 space-y-4">
             <div className="h-8 w-2/3 rounded-lg bg-slate-100 mb-6"></div>
             <div className="h-12 w-full rounded-xl border border-violet-200 bg-violet-50/50 flex items-center px-4 shadow-sm ring-1 ring-violet-500/10">
               <div className="h-4 w-1/3 rounded bg-violet-200"></div>
             </div>
             <div className="h-12 w-full rounded-xl border border-slate-100 bg-white flex items-center px-4">
               <div className="h-4 w-1/2 rounded bg-slate-100"></div>
             </div>
             <div className="h-12 w-full rounded-xl border border-slate-100 bg-white flex items-center px-4">
               <div className="h-4 w-2/5 rounded bg-slate-100"></div>
             </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (index === 1) {
    // ANALYTICS MOCKUP
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-2xl shadow-emerald-200/50 backdrop-blur-xl animate-float-slow transform-gpu rotate-y-[5deg] rotate-x-[5deg] perspective-[1000px]" style={{ animationDelay: '1s' }}>
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/80 to-white/20"></div>
        <div className="relative z-10 h-full w-full rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm overflow-hidden flex flex-col p-6">
           <div className="flex justify-between items-center mb-8">
              <div className="h-6 w-32 rounded-md bg-slate-100"></div>
              <div className="h-8 w-20 rounded-full bg-emerald-100"></div>
           </div>
           <div className="flex-1 flex items-end gap-3 px-2">
              {[40, 70, 45, 90, 60, 100, 85].map((h, i) => (
                 <div key={i} className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // PUBLISH MOCKUP
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-2xl shadow-amber-200/50 backdrop-blur-xl animate-float-slow transform-gpu rotate-y-[-5deg] rotate-x-[5deg] perspective-[1000px]" style={{ animationDelay: '2s' }}>
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/80 to-white/20"></div>
      <div className="relative z-10 h-full w-full rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm overflow-hidden flex flex-col items-center justify-center p-8 text-center">
         <div className="size-20 rounded-full bg-amber-100 flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="size-10 text-amber-500" />
         </div>
         <div className="h-6 w-3/4 rounded-md bg-slate-100 mb-3"></div>
         <div className="h-4 w-1/2 rounded-md bg-slate-50 mb-8"></div>
         <div className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between px-3">
            <div className="h-4 w-1/2 rounded bg-slate-200"></div>
            <div className="h-8 w-16 rounded-lg bg-white border border-slate-200 shadow-sm"></div>
         </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 selection:bg-violet-200 selection:text-violet-900">
      <Navbar />

      {/* 🚀 FOCUSED CENTERED HERO SECTION WITH GRID & METEORS */}
      <section className="relative w-full flex flex-col items-center justify-start pt-32 pb-20 md:pt-40 overflow-hidden">
        
        <GridMeteors />

        {/* Hero Content Layer */}
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 text-center mt-12">
          
          <div className="animate-rise-in flex flex-col items-center">
            {/* Sleek Announcement Pill */}
            <Link 
              href="/register" 
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/50 px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm backdrop-blur-md transition-all hover:bg-violet-100/50 hover:shadow-md"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white">
                <Sparkles className="size-3" />
              </span>
              Introducing FormBuilder 2.0
              <ArrowRight className="ml-1 size-4" />
            </Link>
            
            {/* 🚀 INTEGRATED SPLIT TEXT COMPONENT */}
            <SplitText
              tag="h1"
              text="Build forms that feel like magic."
              className="max-w-4xl text-5xl font-black tracking-tight leading-[1.05] text-slate-950 md:text-7xl lg:text-[5.5rem]"
              delay={40}
              duration={0.8}
              ease="power3.out"
              splitType="words, chars"
              from={{ opacity: 0, y: 40, rotationX: -90, transformOrigin: '0% 50% -50' }}
              to={{ opacity: 1, y: 0, rotationX: 0 }}
            />
            
            <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 text-balance md:text-xl">
              A slick workspace for creating beautiful public forms, collecting answers, and analyzing data—without the mess of a cluttered admin panel.
            </p>
            
            {/* Centered Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              {/* AUTH AWARE CTA BUTTON */}
              <Link 
                href={user ? "/dashboard" : "/register"} 
                className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto h-14 rounded-full bg-slate-950 px-10 text-lg font-bold text-white shadow-xl shadow-slate-900/20 hover:scale-105 hover:bg-slate-800 transition-all duration-300')}
              >
                Get Started
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </div>
          </div>
        </div>

        <AnimatedBuilder />

      </section>

      {/* The Large, Dense Shadow Stat Cards */}
      <section className="relative z-20 mx-auto max-w-5xl px-4 -mt-8 mb-24">
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            ['7+', 'field types'],
            ['1 link', 'to share'],
            ['Live', 'analytics'],
          ].map(([value, label], index) => (
            <div 
              key={label} 
              className="group flex flex-col items-center justify-center rounded-[2.5rem] border border-slate-200/60 bg-white/90 p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-violet-200 hover:shadow-[0_30px_60px_-15px_rgba(124,58,237,0.15)]"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-5xl font-black text-transparent drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
                {value}
              </div>
              <div className="mt-4 text-xs font-bold tracking-[0.2em] uppercase text-slate-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
{/* 🚀 ZIG-ZAG FEATURES SECTION */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-24 space-y-32">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_center,#f8fafc,transparent_100%)]"></div>

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
            Everything you need. <br/> Nothing you don't.
          </h2>
        </div>

        {extendedFeatures.map((feature, index) => {
          // Determine if image should be on the left or right
          const isImageLeft = index % 2 !== 0;

          return (
            <div key={feature.title} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
              
              {/* TEXT COLUMN */}
              <div className={cn("flex flex-col", isImageLeft ? "lg:order-last" : "lg:order-first")}>
                <div className="inline-flex items-center w-fit rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-6">
                  {feature.pill}
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl lg:text-5xl">
                  {feature.title}
                </h3>
                <p className="mt-6 text-lg font-medium leading-relaxed text-slate-600">
                  {feature.description}
                </p>
                
                <ul className="mt-8 space-y-4">
                  {feature.checklist.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-base font-semibold text-slate-700">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* IMAGE / MOCKUP COLUMN */}
              <div className={cn("relative", isImageLeft ? "lg:order-first" : "lg:order-last")}>
                {/* Glowing Ambient Background Blob */}
                <div className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[120%] rounded-full blur-3xl opacity-20 bg-gradient-to-br", feature.color)}></div>
                
                {/* Render the specific Mockup */}
                <FeatureMockup index={index} />
              </div>

            </div>
          );
        })}
      </section>

      {/* Community Gallery Section */}

      <section className="relative border-t border-slate-200/60 bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 mb-6">
              <Palette className="size-4" /> Templates
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Don't start from scratch.</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Choose from dozens of beautiful, pre-built templates and themes designed for conversion.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {templatesPreview.map((tpl, i) => (
              <div key={i} className="group flex flex-col justify-between rounded-[2rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                
                {/* Visual Mockup */}
               <div className="relative h-56 w-full overflow-hidden rounded-t-[2rem] bg-slate-100 transition-colors">
                 <img 
                   src={tpl.imageUrl} 
                   alt={tpl.title} 
                   className="h-full w-full object-cover object-top" 
                 />
                </div>
                
                {/* Content & CTA */}
                <div className="flex flex-1 flex-col p-8">
                  <span className="mb-4 w-fit rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {tpl.category}
                  </span>
                  <h3 className="mb-3 text-2xl font-bold text-slate-950">{tpl.title}</h3>
                  <p className="mb-8 text-sm font-medium leading-relaxed text-slate-600">
                    {tpl.description}
                  </p>
                  
                  <div className="mt-auto">
                    <Link
                      href={user ? "/templates" : "/register"}
                      className={cn(
                        buttonVariants({ size: 'lg' }), 
                        "w-full rounded-xl transition-all duration-300",
                        user 
                          ? "bg-slate-950 text-white hover:bg-slate-800" 
                          : "bg-white text-black hover:bg-black hover:text-white shadow-md hover:shadow-lg"
                      )}
                    >
                      {user ? "Use template" : "Sign up to use"}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Link href="/templates" className="group flex items-center text-sm font-bold text-violet-600 hover:text-violet-700">
              View all templates
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-24">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">FAQ</div>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Common questions.</h2>
        </div>
        <div className="grid gap-6">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-md shadow-slate-200/30 transition-all open:bg-slate-50 open:shadow-none">
              <summary className="cursor-pointer list-none text-xl font-bold text-slate-950 outline-none">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-45 group-open:bg-slate-950 group-open:text-white">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-6 text-lg font-medium leading-relaxed text-slate-600 animate-rise-in">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 text-white shadow-2xl md:p-16">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-violet-600 blur-3xl opacity-30"></div>
          
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                <FileText className="size-4" />
                Public gallery
              </div>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl text-balance">Answer forms from the community.</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-300 text-balance">
                Published forms show up in one clean place, ready for visitors to open and submit without needing an account.
              </p>
              <Link href="/forms" className={cn(buttonVariants({ size: 'lg' }), 'mt-8 h-14 rounded-xl bg-white px-8 text-lg font-bold text-slate-950 transition hover:scale-105 hover:bg-slate-100 hover:text-white')}>
                Explore forms
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </div>
            <div className="grid gap-4 perspective-1000">
              {['Customer research', 'Workshop signup', 'Product feedback'].map((name, index) => (
                <div 
                  key={name} 
                  className="transform rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:translate-x-2 hover:bg-white/10 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold">{name}</div>
                      <div className="mt-2 text-sm font-medium text-slate-400">{index + 4} fields ready to answer</div>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/20">
                      <ArrowRight className="size-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}