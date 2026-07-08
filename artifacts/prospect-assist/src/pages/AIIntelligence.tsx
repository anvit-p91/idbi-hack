import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, TrendingUp, MessageSquare, AlertCircle, HelpCircle,
  FileText, CheckCircle, Star, Zap, ChevronRight, ArrowLeft
} from "lucide-react";
import { api as customerApi } from "@/services/api";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtL = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`;

export default function AIIntelligence() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = parseInt(params.id || "1");
    customerApi.getCustomer(id).then(setData).catch(() => toast.error("Failed to load AI data"));
  }, [params.id]);

  if (!data) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
    </div>
  );

  const p = data.personalDetails as Record<string, unknown>;
  const ai = data.aiRecommendation as Record<string, unknown>;
  const lead = data.leadInfo as Record<string, unknown>;
  const id = parseInt(params.id || "1");

  const reasons = ai.reasonCodes as string[];
  const questions = ai.likelyQuestions as string[];
  const objections = ai.likelyObjections as string[];
  const docs = ai.requiredDocuments as string[];
  const crossSell = ai.crossSellOpportunities as string[];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/leads/${id}`)} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" /> AI Intelligence — {p.name as string}
          </h2>
          <p className="text-xs text-muted-foreground">{p.customerId as string} · Lead {lead.id as string}</p>
        </div>
      </div>

      {/* Confidence Banner */}
      <div className="rounded-xl bg-gradient-to-r from-purple-900 to-purple-700 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">AI Analysis Complete</span>
            </div>
            <p className="text-3xl font-bold mb-1">{ai.confidenceScore as number}%</p>
            <p className="text-white/70 text-sm">Confidence Score</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-1">Recommended Product</p>
            <p className="text-lg font-bold">{ai.recommendedProduct as string}</p>
            <p className="text-white/70 text-xs mt-2">Eligible Amount</p>
            <p className="text-lg font-semibold">{fmtL(ai.eligibleAmount as number)}</p>
            <p className="text-white/70 text-xs mt-2">Rate of Interest</p>
            <p className="text-lg font-semibold">{ai.interestRate as number}% p.a.</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={ai.confidenceScore as number} className="h-2 bg-white/20 [&>div]:bg-yellow-300" />
        </div>
      </div>

      {/* Income Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Est. Monthly Income", value: `₹${fmt(ai.estimatedMonthlyIncome as number)}`, color: "text-green-600 bg-green-50" },
          { label: "Repayment Capacity", value: `₹${fmt(ai.repaymentCapacity as number)}`, color: "text-primary bg-primary/10" },
          { label: "Disposable Income", value: `₹${fmt(ai.disposableIncome as number)}`, color: "text-teal-700 bg-teal-50" },
          { label: "Income Stability", value: ai.incomeStability as string, color: "text-purple-700 bg-purple-50" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className={`text-sm font-bold rounded-lg px-2 py-1 inline-block ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="recommendation" className="space-y-4">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="recommendation" className="text-xs" data-testid="tab-recommendation">Recommendation</TabsTrigger>
          <TabsTrigger value="conversation" className="text-xs" data-testid="tab-conversation">Conversation Guide</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs" data-testid="tab-documents">Documents</TabsTrigger>
          <TabsTrigger value="cross-sell" className="text-xs" data-testid="tab-crosssell">Cross-Sell</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="w-4 h-4 text-accent" /> Why This Customer is Ideal</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {reasons.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{r}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Conversation Starter</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <p className="text-xs text-accent font-semibold mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> AI-Suggested Opening
                  </p>
                  <p className="text-sm text-foreground leading-relaxed italic">"{ai.conversationStarter as string}"</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => { toast.success("Script copied to clipboard"); navigator.clipboard?.writeText(ai.conversationStarter as string); }} data-testid="copy-script-btn">
                    Copy Script
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setLocation(`/offers/${id}`)} data-testid="view-offer-btn">
                    View Offer <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4 text-blue-600" /> Likely Customer Questions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {questions.map((q, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-1">Q: {q}</p>
                    <p className="text-xs text-blue-600 italic">Prepare a clear, confident answer for this question.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-600" /> Likely Objections & Handling Tips</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {objections.map((obj, i) => (
                  <div key={i} className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs font-medium text-orange-800 mb-1">Objection: {obj}</p>
                    <p className="text-xs text-orange-600 italic">Acknowledge the concern and redirect to value proposition.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Required Documents Checklist</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                    <span className="text-sm text-foreground">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cross-sell">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Cross-Sell & Upsell Opportunities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crossSell.map((opp, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{opp}</p>
                      <Button size="sm" variant="link" className="p-0 h-auto text-xs text-primary mt-1"
                        onClick={() => toast.info(`Exploring: ${opp}`)} data-testid={`opp-btn-${i}`}>
                        Explore Opportunity
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
