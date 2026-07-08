import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, TrendingUp, CheckCircle, Target, Banknote, CreditCard,
  Shield, ArrowUpRight, PlayCircle, FileText, Plus, BarChart3,
  Clock, UserCheck, FileCheck, Zap
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtCr = (n: number) => `₹${(n / 10000000).toFixed(1)} Cr`;
const fmtL = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`;

const PIE_COLORS = ["#004C97", "#FFB800", "#0ea5e9", "#f97316", "#22c55e", "#8b5cf6"];

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{fmt(display)}{suffix}</span>;
}

export default function Dashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [, setLocation] = useLocation();
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => toast.error("Failed to load dashboard"));
  }, []);

  const startDemo = async () => {
    setDemoRunning(true);
    toast.info("Starting Live Demo — guiding you through the application...");
    const steps = ["/leads", "/leads/1", "/customer360/1", "/ai-intelligence/1", "/offers/1", "/analytics"];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 3000));
      setLocation(step);
    }
    setDemoRunning(false);
  };

  if (!data) return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 col-span-2 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );

  const kpis = data.kpis as Record<string, unknown>;
  const leadFunnel = data.leadFunnel as { stage: string; count: number }[];
  const branchPerf = data.branchPerformance as { branch: string; leads: number; converted: number }[];
  const trend = data.monthlyTrend as { month: string; leads: number; converted: number }[];
  const loanDist = data.loanDistribution as { type: string; value: number }[];
  const activity = data.recentActivity as { id: number; action: string; customer: string; rm: string; time: string; type: string }[];

  const kpiCards = [
    { label: "Today's New Leads", value: kpis.todayNewLeads as number, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Assigned Leads", value: kpis.assignedLeads as number, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "High Intent Leads", value: kpis.highIntentLeads as number, icon: Target, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Converted Leads", value: kpis.convertedLeads as number, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Conversion Rate", value: kpis.conversionRate as number, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10", suffix: "%" },
    { label: "Credit Cards Issued", value: kpis.creditCardsIssued as number, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Insurance Sold", value: kpis.insurancePoliciesSold as number, icon: Shield, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Balance Transfer", value: kpis.balanceTransferLeads as number, icon: ArrowUpRight, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const activityIcon: Record<string, typeof Clock> = {
    lead: Users, document: FileCheck, approval: CheckCircle, ai: Zap, offer: FileText
  };

  const activityColor: Record<string, string> = {
    lead: "bg-blue-100 text-blue-700", document: "bg-amber-100 text-amber-700",
    approval: "bg-green-100 text-green-700", ai: "bg-purple-100 text-purple-700", offer: "bg-teal-100 text-teal-700"
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Monday, 7 July 2026 — Bandra West Branch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")} data-testid="export-btn">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Export Report
          </Button>
          <Button size="sm" onClick={() => setLocation("/leads")} data-testid="new-lead-btn">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Lead
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            onClick={startDemo}
            disabled={demoRunning}
            data-testid="live-demo-btn"
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
            {demoRunning ? "Demo Running..." : "Start Live Demo"}
          </Button>
        </div>
      </div>

      {/* Potential portfolio banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 text-white flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium mb-1">POTENTIAL LOAN PORTFOLIO</p>
          <p className="text-2xl font-bold">{fmtCr(kpis.potentialPortfolio as number)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-xs mb-1">AVG TICKET SIZE</p>
          <p className="text-lg font-semibold">{fmtL(kpis.avgTicketSize as number)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-xs mb-1">TOP RM</p>
          <p className="text-sm font-semibold">{kpis.topRm as string}</p>
          <p className="text-white/70 text-xs">{kpis.topBranch as string}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border hover:shadow-md transition-shadow cursor-pointer" data-testid={`kpi-card-${i}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${k.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedNumber value={k.value} suffix={k.suffix || ""} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trend */}
        <Card className="col-span-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Monthly Conversion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="leads" stroke="#004C97" strokeWidth={2} dot={{ r: 3 }} name="Total Leads" />
                <Line type="monotone" dataKey="converted" stroke="#FFB800" strokeWidth={2} dot={{ r: 3 }} name="Converted" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Loan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={loanDist} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={65} label={false}>
                  {loanDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {loanDist.map((d, i) => (
                <div key={d.type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground">{d.type}</span>
                  </div>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Funnel */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Lead Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leadFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#004C97" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Performance */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Branch Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={branchPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="branch" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="leads" fill="#004C97" name="Leads" />
                <Bar dataKey="converted" fill="#FFB800" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-52 overflow-y-auto">
            {activity.map((a) => {
              const Icon = activityIcon[a.type] || Clock;
              return (
                <div key={a.id} className="flex items-start gap-2.5" data-testid={`activity-item-${a.id}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activityColor[a.type] || "bg-muted text-muted-foreground"}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.customer} · {a.rm}</p>
                    <p className="text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
