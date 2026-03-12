import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  BarChart3,
  Globe,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">RiskGuard</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
              <Link href="#solutions" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Solutions</Link>
              <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg shadow-blue-600/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-0 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Phase 2.4 Now Live
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              Intelligent Enterprise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Risk Management
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Automate financial analysis, monitor global news in real-time, and chat with your
              private knowledge base using our AI-driven sentinel system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full text-lg font-bold transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Unified Risk Shield</h2>
              <p className="text-slate-600">Three core pillars protecting your enterprise operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Financial Scoring</h3>
                <p className="text-slate-600 leading-relaxed">
                  Automated z-score, liquidity, and leverage analysis. Get instant health checks on any public or private ticker.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="text-emerald-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI News Sentinel</h3>
                <p className="text-slate-600 leading-relaxed">
                  Real-time monitoring of global news and social signals. Our AI detects threats before they hit your bottom line.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Cpu className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Private RAG Vault</h3>
                <p className="text-slate-600 leading-relaxed">
                  Upload internal documents and chat with your private knowledge base securely. No data leakage, total intelligence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                  Designed for Modern <br /> Risk Teams
                </h2>
                <div className="space-y-6">
                  {[
                    "Unified dashboard for all risk vectors",
                    "Enterprise-grade data encryption",
                    "Customizable risk thresholds and alerts",
                    "Seamless collaboration across departments"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-white w-4 h-4" />
                      </div>
                      <span className="text-lg text-slate-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="relative p-2 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200">
                  <div className="bg-slate-900 rounded-[2rem] aspect-video flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <Lock className="text-blue-500 w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-400 font-mono text-sm tracking-widest">ENCRYPTED DASHBOARD VIEW</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="text-amber-500 w-8 h-8" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">THREAT DETECTED</p>
                        <p className="text-sm font-bold text-slate-900">Liquidity Drop (12%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <ShieldCheck className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">RiskGuard</span>
            </div>

            <div className="flex gap-8 text-sm text-slate-500">
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>

            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} RiskGuard Enterprise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
