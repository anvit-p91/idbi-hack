import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, ArrowLeft, Banknote, ArrowUpCircle, ArrowDownCircle, ShieldCheck } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const PIE_COLORS = ["#004C97", "#FFB800", "#22c55e", "#f97316"];

export default function IncomeIntelligence() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = parseInt(params.id || "1");
    api.getCustomer(id).then(setData).catch(() => toast.error("Failed to load income data"));
  }, [params.id]);

  if (!data) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
    </div>
  );

  const p = data.personalDetails as Record<string, unknown>;
  const income = data.incomeIntelligence as Record<string, unknown>;
  const ai = data.aiRecommendation as Record<string, unknown>;
  const lead = data.leadInfo as Record<string, unknown>;
  const id = parseInt(params.id || "1");

  const credits = income.monthlyCredits as number[];
  const debits = income.monthlyDebits as number[];
  const sources = income.incomeSources as { source: string; amount: number; pct: number }[];

  const trendData = MONTHS.map((m, i) => ({
    month: m,
    credits: credits[i] || 0,
    debits: debits[i] || 0,
    net: (credits[i] || 0) - (debits[i] || 0),
  }));

  const avgCredit = credits.reduce((a, b) => a + b, 0) / credits.length;
  const avgDebit = debits.reduce((a, b) => a + b, 0) / debits.length;
  const avgNet = avgCredit - avgDebit;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/leads/${id}`)} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Income Intelligence — {p.name as string}
          </h2>
          <p className="text-xs text-muted-foreground">
            {p.customerId as string} · Confidence: <span className="text-green-600 font-medium">{income.confidenceScore as number}%</span> · {income.seasonality as string}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Monthly Credits", value: `₹${fmt(Math.round(avgCredit))}`, icon: ArrowUpCircle, color: "text-green-600 bg-green-50" },
          { label: "Avg Monthly Debits", value: `₹${fmt(Math.round(avgDebit))}`, icon: ArrowDownCircle, color: "text-red-600 bg-red-50" },
          { label: "Avg Net Surplus", value: `₹${fmt(Math.round(avgNet))}`, icon: Banknote, color: "text-primary bg-primary/10" },
          { label: "AI Confidence", value: `${income.confidenceScore as number}%`, icon: ShieldCheck, color: "text-purple-600 bg-purple-50" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className={`w-8 h-8 rounded-lg ${item.color.split(" ")[1]} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${item.color.split(" ")[0]}`} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Cash Flow (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gCredit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004C97" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#004C97" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDebit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${fmt(v)}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="credits" stroke="#004C97" fill="url(#gCredit)" strokeWidth={2} name="Credits" />
                <Area type="monotone" dataKey="debits" stroke="#ef4444" fill="url(#gDebit)" strokeWidth={2} name="Debits" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Net Surplus Bar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Net Surplus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${fmt(v)}`} />
                <Bar dataKey="net" fill="#FFB800" radius={[4, 4, 0, 0]} name="Net Surplus" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={sources} dataKey="pct" nameKey="source" cx="50%" cy="50%" outerRadius={60}>
                    {sources.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {sources.map((s, i) => (
                  <div key={s.source}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium text-foreground">{s.source}</span>
                      </div>
                      <span className="text-muted-foreground">{s.pct}%</span>
                    </div>
                    <Progress value={s.pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-0.5">₹{fmt(s.amount)}/month</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMI Eligibility Analysis */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">EMI Eligibility Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Estimated Income", value: `₹${fmt(ai.estimatedMonthlyIncome as number)}`, pct: 100 },
                { label: "Fixed Obligations", value: `₹${fmt(Math.round(avgDebit * 0.4))}`, pct: 40 },
                { label: "Repayment Capacity", value: `₹${fmt(ai.repaymentCapacity as number)}`, pct: Math.round((ai.repaymentCapacity as number) / (ai.estimatedMonthlyIncome as number) * 100) },
                { label: "Disposable Income", value: `₹${fmt(ai.disposableIncome as number)}`, pct: Math.round((ai.disposableIncome as number) / (ai.estimatedMonthlyIncome as number) * 100) },
              ].map(item => (
                <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-foreground">{item.value}</p>
                  <Progress value={item.pct} className="h-1 mt-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.pct}% of income</p>
                </div>
              ))}
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700 font-medium">Recommended Max EMI</p>
              <p className="text-lg font-bold text-green-700 mt-0.5">₹{fmt(Math.round((ai.repaymentCapacity as number) * 0.8))}</p>
              <p className="text-xs text-green-600">(80% of repayment capacity — safe threshold)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
