"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Gavel, Zap, Search, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden selection:bg-red-900/50">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-neutral-900/50 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <span className="text-xl font-extrabold tracking-tighter">Escalate.it</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href={user ? "/dashboard" : "/login"}
            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
          >
            {user ? "Go to Dashboard" : "Join Now"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 max-w-5xl mx-auto mt-12 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-900/30 bg-red-950/20 text-red-500 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Consumer Advocate as a Service
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-600">
            Don't get mad. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Get paid.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Eradicate consumer fatigue. We weaponize AI to bypass corporate support bots, automate legal-adjacent escalation, and secure your rightful compensation.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="group flex items-center gap-2 px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-full hover:bg-red-700 transition-all shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95"
            >
              Start an Escalation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Interactive Features Section */}
      <section className="relative z-10 py-32 px-6 border-t border-neutral-900 bg-neutral-950/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">How our Arsenal works.</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Zero upfront friction. Just tell us what happened, and we handle the legal intimidation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="1. Voice or Text Intake"
              description="Simply vent your frustration into your microphone or type it out. Upload any proof (screenshots, receipts). Our multimodal AI parses exactly how you were wronged."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Search className="w-8 h-8 text-blue-500" />}
              title="2. Legal Analysis"
              description="Our GPT-4o powered engine instantly analyzes your case against the Consumer Protection Act, 2019, identifying statutory violations and quantifying your mental agony compensation."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Gavel className="w-8 h-8 text-red-500" />}
              title="3. Ruthless Escalation"
              description="We instantly generate a legally binding 'Notice of Deficiency' targeting the company's Nodal Officer and a public strike tweet to force an immediate resolution."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto opacity-50" />
          <h2 className="text-4xl font-black tracking-tighter">Ready to hold them accountable?</h2>
          <Link 
            href={user ? "/dashboard" : "/login"}
            className="inline-block px-10 py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            Join the Resistance
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 hover:bg-neutral-800/80 hover:border-neutral-700 transition-all backdrop-blur-xl group cursor-default shadow-2xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-neutral-950 flex items-center justify-center border border-neutral-800 mb-6 group-hover:border-neutral-700 transition-colors shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-neutral-400 leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}
