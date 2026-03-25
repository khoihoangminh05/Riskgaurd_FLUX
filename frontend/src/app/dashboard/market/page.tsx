'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Activity, 
  Box, 
  Newspaper, 
  Minus,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { financeApi } from '@/lib/api';
import { Loader2, AlertOctagon } from 'lucide-react';

type Sentiment = 'Bullish' | 'Bearish' | 'Neutral';

interface NewsItem {
  id: string;
  source: string;
  headline: string;
  summary: string;
  sentiment: Sentiment;
  timeAgo: string;
}

const MOCK_MACRO_DATA = [
  {
    title: "Interest Rate",
    value: "4.50%",
    trend: "down",
    change: "-0.25% vs last quarter",
    icon: <Percent className="w-5 h-5 text-indigo-500" />,
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
    glow: "group-hover:shadow-indigo-500/20"
  },
  {
    title: "Inflation Rate (YoY)",
    value: "3.28%",
    trend: "up",
    change: "+0.12% vs last month",
    icon: <Activity className="w-5 h-5 text-rose-500" />,
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
    glow: "group-hover:shadow-rose-500/20"
  },
  {
    title: "USD/VND Exchange",
    value: "25,400",
    trend: "up",
    change: "+0.45% vs last week",
    icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    glow: "group-hover:shadow-emerald-500/20"
  },
  {
    title: "Supply Chain Risk",
    value: "HIGH",
    trend: "up",
    change: "Red Sea logistics disruptions",
    icon: <Box className="w-5 h-5 text-amber-500" />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    glow: "group-hover:shadow-amber-500/20"
  }
];

const MOCK_MARKET_NEWS: NewsItem[] = [
  {
    id: "1",
    source: "Bloomberg",
    headline: "Central Bank Considers Further Rate Cuts to Spur Credit Growth",
    summary: "The SBV is exploring a targeted 0.25% rate cut for priority sectors, directly impacting real estate and export manufacturing borrowing costs. Analysts expect this to stimulate Q3 investments.",
    sentiment: "Bullish",
    timeAgo: "1 hour ago"
  },
  {
    id: "2",
    source: "Reuters",
    headline: "Global Shipping Rates Surge 15% Amid Red Sea Re-routing",
    summary: "Logistics bottlenecks intensify as major carriers avoid the Suez Canal. Expect delayed inventories and increased freight costs for APAC regional manufacturers over the next two quarters.",
    sentiment: "Bearish",
    timeAgo: "3 hours ago"
  },
  {
    id: "3",
    source: "Financial Times",
    headline: "Commodity Prices Stabilize as China Output Remains Flat",
    summary: "Raw material costs for industrial manufacturing are expected to plateau through Q3, providing breathing room for tight corporate margins amidst mixed global demand signals.",
    sentiment: "Neutral",
    timeAgo: "12 hours ago"
  },
  {
    id: "4",
    source: "VNExpress",
    headline: "FDI Pledges to Vietnam Reach $8 Billion in Q1",
    summary: "Strong influx of semiconductor and consumer electronics investments solidifies Vietnam's role in the regional manufacturing hub strategy, driving local infrastructure development.",
    sentiment: "Bullish",
    timeAgo: "1 day ago"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function MarketIntelligencePage() {
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.company?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [marketNews, setMarketNews] = useState<NewsItem[]>(MOCK_MARKET_NEWS);

  useEffect(() => {
    if (companyId) {
      fetchMarketData();
    }
  }, [companyId]);

  const fetchMarketData = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const data = await financeApi.getMarketIntelligence(companyId);
      if (data && data.length > 0) {
        // Map backend RiskEvent to NewsItem format
        const mappedNews: NewsItem[] = data.map(event => ({
          id: event.id,
          source: 'Flux Intelligence',
          headline: event.title,
          summary: event.summary,
          sentiment: event.sentiment,
          timeAgo: 'Just now'
        }));
        setMarketNews(mappedNews);
      }
    } catch (error) {
      console.error('Error fetching market info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && companyId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">Please complete your company setup to view Market Intelligence.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 p-4 lg:p-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                Macro-Economic Intelligence
                <span className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                  <Sparkles className="w-3 h-3" /> Live
                </span>
              </h1>
              <p className="text-slate-500 text-base font-medium mt-1">
                Real-time AI analysis of global markets.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Macro Indicators Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_MACRO_DATA.map((data, index) => {
            let trendColor = 'text-slate-600';
            if (data.title === 'Supply Chain Risk') {
              trendColor = 'text-rose-600';
            } else if (data.trend === 'up') {
              trendColor = 'text-rose-600'; 
              if (data.title === 'USD/VND Exchange') trendColor = 'text-emerald-600'; 
            } else {
              trendColor = 'text-emerald-600'; 
            }

            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn(
                  "bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden",
                  data.glow
                )}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-50 pointer-events-none" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest w-2/3 leading-tight">
                    {data.title}
                  </span>
                  <div className={cn("p-2.5 rounded-2xl border group-hover:scale-110 transition-transform duration-300 shadow-sm bg-gradient-to-b from-white", data.bgColor, data.borderColor)}>
                    {data.icon}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-3xl font-black mb-2 tracking-tight text-slate-900 drop-shadow-sm">
                    {data.value}
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold bg-slate-50/50 w-fit px-2.5 py-1 rounded-lg border border-slate-100", trendColor)}>
                    {data.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{data.change}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* News Feed section */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Newspaper className="w-4 h-4" />
              </div>
              AI Curated Market News
            </h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors group">
              View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketNews.map((news) => (
              <motion.div 
                key={news.id}
                whileHover={{ scale: 1.01 }}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm group-hover:text-indigo-600 transition-colors">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest block">{news.source}</span>
                      <time className="text-[11px] text-slate-500 font-semibold">{news.timeAgo}</time>
                    </div>
                  </div>
                  <div className={cn(
                    "inline-flex items-center px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-full border shadow-sm backdrop-blur-sm",
                    news.sentiment === 'Bullish' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                    news.sentiment === 'Bearish' && "bg-rose-50 text-rose-700 border-rose-200",
                    news.sentiment === 'Neutral' && "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    {news.sentiment === 'Bullish' && <TrendingUp className="w-3.5 h-3.5 mr-1.5" />}
                    {news.sentiment === 'Bearish' && <TrendingDown className="w-3.5 h-3.5 mr-1.5" />}
                    {news.sentiment === 'Neutral' && <Minus className="w-3.5 h-3.5 mr-1.5" />}
                    {news.sentiment}
                  </div>
                </div>
                
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors relative z-10 line-clamp-2">
                  {news.headline}
                </h3>
                
                <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3 relative z-10">
                  {news.summary}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
