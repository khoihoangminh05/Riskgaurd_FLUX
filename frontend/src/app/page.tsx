import Link from 'next/link';
import {
  Shield,
  Zap,
  Building,
  CheckCircle,
  ArrowRight,
  Server,
  Database,
  Globe2,
  Lock,
  Cpu,
  BarChart3,
  Activity,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020817] font-sans text-slate-50 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50rem] h-[50rem] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-indigo-900/10 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Navbar Minimal & Luxurious */}
      <nav className="fixed top-0 w-full z-50 bg-[#020817]/80 backdrop-blur-xl border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] border border-blue-400/20 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Flux</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Architecture</Link>
              <Link href="#customers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Customers</Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="#company" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Company</Link>
            </div>

            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all backdrop-blur-md shadow-sm"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* 1. Premium Hero Section */}
        <section className="pt-40 pb-20 md:pt-52 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/40 border border-blue-800/50 backdrop-blur-md text-blue-300 text-xs font-semibold uppercase tracking-widest mb-10 shadow-[0_0_20px_rgba(30,58,138,0.3)]">
            <Sparkles className="w-3.5 h-3.5" />
            V2.0 Core Architecture Live
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white mb-8 leading-[1.05] max-w-5xl">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">Enterprise Future</span> <br className="hidden md:block" />
            with Agentic AI.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-light">
            Flux predicts market volatility and cross-references internal data to neutralize risks before they happen. Powered by <strong className="text-slate-200 font-medium">Hybrid RAG</strong> and <strong className="text-slate-200 font-medium">Multi-Agent Architecture</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.8)] flex items-center justify-center gap-2 group border border-blue-400/30"
            >
              Request Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto bg-slate-900/50 border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/80 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all backdrop-blur-md flex items-center justify-center gap-2 group"
            >
              View Architecture
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* 2. Social Proof & Fake Partners */}
        <section className="py-14 border-y border-slate-800/30 bg-slate-900/10 backdrop-blur-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-slate-500 mb-10 uppercase tracking-[0.2em]">
              Trusted by industry leaders to protect over $10B in assets.
            </p>
            {/* Scrolling track container */}
            <div className="flex justify-center flex-wrap gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 items-center">
              <div className="flex items-center gap-3 font-bold text-xl md:text-2xl text-slate-300 transform hover:scale-105 transition-transform cursor-default">
                <Building className="w-8 h-8 text-blue-400" />
                GlobalBank
              </div>
              <div className="flex items-center gap-3 font-bold text-xl md:text-2xl text-slate-300 transform hover:scale-105 transition-transform cursor-default">
                <Globe2 className="w-8 h-8 text-emerald-400" />
                TechCorp Supply
              </div>
              <div className="flex items-center gap-3 font-bold text-xl md:text-2xl text-slate-300 transform hover:scale-105 transition-transform cursor-default">
                <Activity className="w-8 h-8 text-purple-400" />
                Asia FinGroup
              </div>
              <div className="flex items-center gap-3 font-bold text-xl md:text-2xl text-slate-300 transform hover:scale-105 transition-transform cursor-default">
                <Zap className="w-8 h-8 text-amber-400" />
                VinLogistics
              </div>
            </div>
          </div>
        </section>

        {/* 3. Deep-Dive Features */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Risk Infrastructure</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                A definitive architecture designed to eradicate blind spots and provide absolute certainty in volatile, complex markets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {/* Feature 1 */}
              <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700/50 to-slate-800/10 hover:from-blue-500/50 hover:to-slate-800/10 transition-colors duration-500">
                <div className="absolute inset-0 bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
                <div className="h-full bg-[#030b1c] backdrop-blur-2xl p-10 rounded-3xl shadow-2xl">
                  <div className="w-16 h-16 bg-slate-900/80 border border-slate-700/50 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:border-blue-400/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                    <Shield className="text-blue-400 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Multi-Agent Supervisor</h3>
                  <p className="text-slate-400 leading-relaxed font-light">
                    Eradicates AI hallucination. Our autonomous agents cross-verify facts against authoritative sources before generating critical risk assessments.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700/50 to-slate-800/10 hover:from-purple-500/50 hover:to-slate-800/10 transition-colors duration-500">
                <div className="absolute inset-0 bg-purple-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
                <div className="h-full bg-[#030b1c] backdrop-blur-2xl p-10 rounded-3xl shadow-2xl">
                  <div className="w-16 h-16 bg-slate-900/80 border border-slate-700/50 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:border-purple-400/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
                    <Database className="text-purple-400 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Hybrid Enterprise Memory</h3>
                  <p className="text-slate-400 leading-relaxed font-light">
                    Powered by pgvector RAG for secure internal docs. Contextualize global threats with your proprietary, confidential data instantly.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700/50 to-slate-800/10 hover:from-emerald-500/50 hover:to-slate-800/10 transition-colors duration-500">
                <div className="absolute inset-0 bg-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
                <div className="h-full bg-[#030b1c] backdrop-blur-2xl p-10 rounded-3xl shadow-2xl">
                  <div className="w-16 h-16 bg-slate-900/80 border border-slate-700/50 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:border-emerald-400/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                    <Server className="text-emerald-400 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Real-Time WebSocket</h3>
                  <p className="text-slate-400 leading-relaxed font-light">
                    Millisecond reaction to market news. Push-based alerts ensure you respond to crises before they are priced in by the street.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. B2B Testimonials */}
        <section id="customers" className="py-32 relative">
          <div className="absolute inset-0 bg-blue-900/5 border-y border-slate-800/30"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
                Trusted by Executive Leadership
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                See how industry titans are leveraging Flux to preemptively neutralize multi-million dollar threats.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Testimonial 1 */}
              <div className="p-10 bg-[#061023] rounded-[2rem] border border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative hover:border-blue-500/30 transition-colors group">
                <Zap className="absolute top-10 right-10 w-16 h-16 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                <p className="text-xl text-slate-300 leading-relaxed mb-10 font-light italic relative z-10">
                  "Flux's Agentic workflow identified a critical supply chain disruption 3 days before it hit the mainstream news. It saved us millions in delayed shipping penalties and secured alternative routing instantly."
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-[#061023] rounded-full flex items-center justify-center border border-blue-500/30 shadow-inner">
                    <span className="text-blue-400 font-bold text-lg">CTO</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Jonathan Davis</h4>
                    <p className="text-sm text-slate-400">CTO, Global FinTech</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-10 bg-[#061023] rounded-[2rem] border border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative hover:border-indigo-500/30 transition-colors group">
                <Lock className="absolute top-10 right-10 w-16 h-16 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" />
                <p className="text-xl text-slate-300 leading-relaxed mb-10 font-light italic relative z-10">
                  "The strict data isolation and on-premise readiness passed our rigorous banking compliance instantly. It's the only AI platform we trust with our Tier-1 confidential corporate data streams."
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-900 to-[#061023] rounded-full flex items-center justify-center border border-indigo-500/30 shadow-inner">
                    <span className="text-indigo-400 font-bold text-lg">CRO</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">Sarah Lin</h4>
                    <p className="text-sm text-slate-400">Chief Risk Officer, Top 10 Asian Bank</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Pricing & ROI Table */}
        <section id="pricing" className="py-32 relative">
          {/* Subtle glow behind pricing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full bg-blue-900/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Investment & ROI</span></h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                Enterprise-grade pricing designed to guarantee an immediate, measurable return on investment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Tier 1 */}
              <div className="bg-[#030b1c] border border-slate-800 p-10 rounded-3xl hover:border-slate-700 transition-colors shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-slate-400 text-sm mb-8 h-10">For aggressive mid-size firms. Up to 500 documents, daily scans.</p>
                <div className="mb-8 border-b border-slate-800/80 pb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-white">$999</span>
                    <span className="text-slate-500 font-medium">/mo</span>
                  </div>
                </div>
                <div className="p-5 bg-emerald-950/20 rounded-2xl border border-emerald-900/30 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ROI Metric</p>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">"Saves approx. $50k/year in manual risk analysis."</p>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" /> <span className="font-light">Up to 500 documents</span>
                  </li>
                  <li className="flex items-center gap-4 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" /> <span className="font-light">Daily automated scans</span>
                  </li>
                  <li className="flex items-center gap-4 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" /> <span className="font-light">Email & SMS Alerts</span>
                  </li>
                </ul>
                <button className="w-full py-4 rounded-full border border-slate-700 hover:bg-slate-800 text-white font-semibold transition-all">
                  Start Professional
                </button>
              </div>

              {/* Tier 2: Enterprise (Most Popular) */}
              <div className="relative bg-slate-900 rounded-3xl p-[2px] bg-gradient-to-b from-blue-400 to-indigo-600 shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)] transform md:-translate-y-8 z-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg border border-blue-400/50">
                  Most Popular
                </div>
                <div className="bg-[#040e25] rounded-[22px] p-10 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                  <p className="text-slate-400 text-sm mb-8 h-10">For large scale operations with agentic deep scans and live data.</p>
                  <div className="mb-8 border-b border-slate-800/80 pb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-white">$4,999</span>
                      <span className="text-slate-500 font-medium">/mo</span>
                    </div>
                  </div>
                  <div className="p-5 bg-blue-950/30 rounded-2xl border border-blue-500/20 mb-8 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">ROI Metric</p>
                    </div>
                    <p className="text-sm text-white font-medium leading-relaxed">"Prevents up to $500k in supply chain or compliance penalties."</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    <li className="flex items-center gap-4 text-slate-100">
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Multi-Agent deep scans
                    </li>
                    <li className="flex items-center gap-4 text-slate-100">
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Real-time WebSocket alerts
                    </li>
                    <li className="flex items-center gap-4 text-slate-100">
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Dedicated pgvector instance
                    </li>
                  </ul>
                  <button className="w-full mt-auto py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                    Upgrade to Enterprise
                  </button>
                </div>
              </div>

              {/* Tier 3: Custom */}
              <div className="bg-[#030b1c] border border-slate-800 p-10 rounded-3xl hover:border-slate-700 transition-colors shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2">Custom</h3>
                <p className="text-slate-400 text-sm mb-8 h-10">For unparalleled security, fine-tuning, and absolute infinite scale.</p>
                <div className="mb-8 border-b border-slate-800/80 pb-8 h-[90px] flex items-end">
                  <span className="text-4xl font-extrabold text-white leading-none">Contact Sales</span>
                </div>
                <div className="p-5 bg-purple-950/20 rounded-2xl border border-purple-900/30 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">ROI Metric</p>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">"Total asset protection with maximum data privacy."</p>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" /> <span className="font-light">On-premise deployment</span>
                  </li>
                  <li className="flex items-center gap-4 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" /> <span className="font-light">Llama-3 fine-tuning</span>
                  </li>
                  <li className="flex items-center gap-4 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0" /> <span className="font-light">Infinite scale</span>
                  </li>
                </ul>
                <button className="w-full py-4 rounded-full border border-slate-700 hover:bg-slate-800 text-white font-semibold transition-all">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern High-End Footer */}
      <footer className="bg-[#01040f] border-t border-slate-800/50 pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
                  <Shield className="text-slate-300 w-4 h-4" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">Flux</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-light">
                Enterprise AI Risk Management for global leaders. Neutralize threats before they manifest.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">Multi-Agent Engine</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">pgvector Memory</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">WebSocket API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">C-Suite Trust</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">Security & Privacy</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">Contact Sales</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              &copy; {new Date().getFullYear()} Flux Enterprise AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-slate-600 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-slate-600 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
