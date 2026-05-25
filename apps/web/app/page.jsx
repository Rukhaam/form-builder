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
import {faqs, extendedFeatures, templatesPreview} from '@/utils/homePageUtils';
import {AnimatedBuilder, GridMeteors, FeatureMockup} from '@/utils/homePageComps';



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
            <div key={feature.title} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24 bg-amber-300 p-10 rounded-3xl shadow-lg">
              
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