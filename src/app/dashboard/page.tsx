"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  Search, 
  Activity, 
  PieChart as PieChartIcon, 
  TrendingUp 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TicketDetailView } from "@/components/dashboard/TicketDetailView";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { PriorityBarChart } from "@/components/dashboard/PriorityBarChart";
import { ActivityPulse } from "@/components/dashboard/ActivityPulse";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, chartRes, distRes] = await Promise.all([
          fetch("/api/dashboard/stats", { headers }),
          fetch("/api/dashboard/chart", { headers }),
          fetch("/api/dashboard/distribution", { headers }),
        ]);

        if (statsRes.ok && chartRes.ok && distRes.ok) {
          setStats(await statsRes.json());
          setChartData(await chartRes.json());
          setDistribution(await distRes.json());
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const kpis = [
    {
      title: "Total Tickets",
      value: stats?.totalTickets || 0,
      description: stats?.deltas.tickets || "+0%",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      accent: "bg-purple-600"
    },
    {
      title: "Active Users",
      value: stats?.totalUsers || 0,
      description: stats?.deltas.users || "+0%",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      accent: "bg-blue-600"
    },
    {
      title: "Avg. Response Time",
      value: "4h 12m",
      description: "-15% from yesterday",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
      accent: "bg-orange-600"
    },
    {
      title: "Resolution Rate",
      value: `${stats?.resolutionRate || 0}%`,
      description: stats?.deltas.resolution || "+0%",
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      accent: "bg-emerald-600"
    },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Analytics Overview</h1>
          <p className="text-slate-500 mt-1">Real-time performance at your company</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white ring-2 ring-primary/10" />
            ))}
          </div>
          <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">+12 Active Now</span>
        </div>
      </motion.div>

      {/* KPI Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.title} variants={item}>
            <Card className="group relative overflow-hidden border-none bg-white/40 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1">
              <div className={`absolute top-0 left-0 h-1 w-full ${kpi.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">{kpi.title}</CardTitle>
                <div className={`p-2.5 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">{loading ? "..." : kpi.value}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.bg} ${kpi.color}`}>
                    {kpi.description}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium italic">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <motion.div variants={item} className="md:col-span-4 lg:col-span-5">
          <Card className="h-full border-none bg-white/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-primary" />
                   Ticket Velocity
                </CardTitle>
                <CardDescription>Request volume trend over the last 7 days</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="bg-white/50">Export PDF</Button>
            </CardHeader>
            <CardContent className="pt-4 h-[350px]">
              {loading ? (
                <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Activity Pulse */}
        <motion.div variants={item} className="md:col-span-3 lg:col-span-2">
          <Card className="h-full border-none bg-white/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Activity className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Activity Pulse</CardTitle>
              <CardDescription>Live system events</CardDescription>
            </CardHeader>
            <CardContent>
               <ActivityPulse />
            </CardContent>
          </Card>
        </motion.div>

        {/* New Advanced Charts Row */}
        <motion.div variants={item} className="md:col-span-3">
          <Card className="h-[380px] border-none bg-white/40 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-0">
               <CardTitle className="text-md font-bold flex items-center gap-2">
                 <PieChartIcon className="h-4 w-4 text-primary" />
                 Category Distribution
               </CardTitle>
               <CardDescription>Overview by request type</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <CategoryPieChart data={distribution?.categories || []} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-4">
          <Card className="h-[380px] border-none bg-white/40 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-0">
               <CardTitle className="text-md font-bold flex items-center gap-2">
                 <BarChart3 className="h-4 w-4 text-primary" />
                 Priority Heatmap
               </CardTitle>
               <CardDescription>Tickets by urgency level</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
               <PriorityBarChart data={distribution?.priorities || []} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Records Footer */}
      <motion.div variants={item}>
        <Card className="border-none bg-white/30 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Master Ticket Registry</CardTitle>
            <Button variant="ghost" className="text-xs font-bold text-primary">View All Records <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-20 bg-slate-200/50 animate-pulse rounded-2xl" />)
              ) : stats?.recentTickets.length === 0 ? (
                <div className="col-span-full text-center py-6 text-slate-400 italic">No historical data found</div>
              ) : (
                stats?.recentTickets.map((ticket: any) => (
                  <div 
                    key={ticket.id} 
                    className="group bg-white/50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-primary uppercase tracking-tighter">{ticket.category || 'Support'}</p>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{ticket.title}</h4>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500">
                        {ticket.priority.charAt(0)}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                       <div className="h-5 w-5 rounded-full bg-slate-200 border border-white" />
                       <span className="text-[10px] font-bold text-slate-500 italic opacity-60">Submitted {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <TicketDetailView 
        ticket={selectedTicket} 
        open={!!selectedTicket} 
        onOpenChange={(open) => !open && setSelectedTicket(null)} 
      />
    </motion.div>
  );
}
