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
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { Lightbulb, ArrowLeft, Info, ShieldCheck, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export default function Explainability() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = parseInt(params.id || "1");
    api.getCustomer(id).then(setData).catch(() => toast.error("Failed to load data"));
  }, [params.id]);

  if (!data) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
    </div>
  );

  const p = data.personalDetails as Record<string, unknown>;
  const ai = data.aiRecommendation as Record<string, unknown>;
  const risk = data.riskProfile as Record<string, unknown>;
  const income = data.incomeIntelligence as Record<string, unknown>;
  const lead = data.leadInfo as Record<string, unknown>;
  const id = parseInt(params.id || "1");

  const reasons = ai.reasonCodes as string[];

  // Feature importance (synthetic from risk profile)
  const features = [
    { factor: "Income Stability", weight: risk.incomeStability as number, type: "positive", description: `Customer shows ${income.seasonality} income pattern` },
    { factor: "Repayment History", weight: risk.repaymentBehaviour as number, type: "positive", description: "Track record of on-time EMI payments" },
    { factor: "Credit Score", weight: Math.round(((risk.creditScore as number) - 300) / 6), type: (risk.creditScore as number) >= 700 ? "positive" : "negative", description: `CIBIL Score: ${risk.creditScore}` },
    { factor: "Debt-to-Income Ratio", weight: 100 - (risk.debtRatio as number) * 1.5, type: (risk.debtRatio as number) <= 40 ? "positive" : "negative", description: `Current D/I: ${risk.debtRatio}%` },
    { factor: "Fraud Risk Index", weight: 100 - (risk.fraudRisk as number) * 5, type: "positive", description: `Low fraud indicators (${risk.fraudRisk}/20 risk signals)` },
    { factor: "Banking Relationship", weight: 82, type: "positive", description: `Customer since ${p.relationshipSince}` },
    { factor: "Employment Type", weight: p.occupation === "Retired" ? 65 : 85, type: "positive", description: `${p.occupation} at ${p.employer}` },
    { factor: "Delinquency Risk", weight: 100 - (risk.delinquencyRisk as number) * 6, type: (risk.delinquencyRisk as number) <= 10 ? "positive" : "warning", description: `Risk score: ${risk.delinquencyRisk}/100` },
  ].sort((a, b) => b.weight - a.weight);

  const radarData = [
    { subject: "Income", A: risk.incomeStability as number },
    { subject: "Repayment", A: risk.repaymentBehaviour as number },
    { subject: "Credit Score", A: Math.round(((risk.creditScore as number) - 300) / 6) },
    { subject: "Fraud Safety", A: 100 - (risk.fraudRisk as number) * 5 },
    { subject: "Relationship", A: 82 },
    { subject: "Employment", A: 85 },
  ];

  const typeColor: Record<string, string> = {
    positive: "bg-green-100 text-green-600",
    negative: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-600"
  };
  const typeIcon: Record<string, typeof CheckCircle> = {
    positive: CheckCircle, negative: AlertTriangle, warning: AlertTriangle
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/leads/${id}`)} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" /> AI Explainability — {p.name as string}
          </h2>
          <p className="text-xs text-muted-foreground">{p.customerId as string} · Confidence: {ai.confidenceScore as number}%</p>
        </div>
      </div>

      {/* AI Decision Summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Why the AI Recommends {ai.recommendedProduct as string}</p>
            <p className="text-sm text-muted-foreground">
              Based on analysis of {p.name as string}'s banking transactions, income patterns, credit history, and relationship data,
              the AI model has determined a <span className="text-primary font-semibold">{ai.confidenceScore as number}% confidence</span> score
              for {ai.recommendedProduct as string} eligibility. The model evaluated 8 key factors
              and identified {reasons.length} strong positive signals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feature Importance */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Feature Importance (SHAP-style)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={features.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="factor" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v) => `${v}% weight`} />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}
                  fill="#004C97" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Risk-Creditworthiness Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar dataKey="A" stroke="#004C97" fill="#004C97" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Factor Breakdown */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> Detailed Decision Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => {
              const Icon = typeIcon[f.type];
              return (
                <motion.div
                  key={f.factor}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  data-testid={`factor-${i}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${typeColor[f.type]}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{f.factor}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{f.weight.toFixed(0)}%</span>
                  </div>
                  <Progress value={f.weight} className="h-1.5 mb-1.5" />
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Reasons */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" /> Core Positive Signals Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{r}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
