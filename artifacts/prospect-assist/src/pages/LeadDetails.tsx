import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  User, Brain, TrendingUp, Gift, Lightbulb, FileText,
  Phone, Mail, MapPin, Building, Briefcase, Calendar,
  ChevronRight, CheckCircle, Clock, AlertTriangle, XCircle,
  ArrowLeft, Edit, Plus
} from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtL = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`;

const statusColor: Record<string, string> = {
  "New": "bg-blue-100 text-blue-700",
  "Assigned": "bg-purple-100 text-purple-700",
  "Contacted": "bg-yellow-100 text-yellow-700",
  "Documents Pending": "bg-orange-100 text-orange-700",
  "Under Review": "bg-indigo-100 text-indigo-700",
  "Approved": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
};

const docStatusIcon: Record<string, typeof CheckCircle> = {
  Verified: CheckCircle, Pending: Clock
};
const docStatusColor: Record<string, string> = {
  Verified: "text-green-600", Pending: "text-amber-500"
};

const timelineIcon: Record<string, typeof CheckCircle> = {
  credit: TrendingUp, intent: Brain, banking: Building, campaign: FileText,
  lead: User, rm: Phone, document: FileText, credit_assess: Clock, offer: Gift, approval: CheckCircle
};
const timelineColor: Record<string, string> = {
  credit: "bg-green-100 text-green-700", intent: "bg-purple-100 text-purple-700",
  banking: "bg-blue-100 text-blue-700", campaign: "bg-yellow-100 text-yellow-700",
  lead: "bg-indigo-100 text-indigo-700", rm: "bg-teal-100 text-teal-700",
  document: "bg-orange-100 text-orange-700", approval: "bg-green-100 text-green-700",
  offer: "bg-accent/20 text-amber-700"
};

export default function LeadDetails() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = parseInt(params.id || "1");
    if (id < 1 || id > 15) { setLocation("/leads"); return; }
    api.getCustomer(id).then(setData).catch(() => toast.error("Failed to load lead details"));
  }, [params.id]);

  if (!data) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    </div>
  );

  const p = data.personalDetails as Record<string, unknown>;
  const lead = data.leadInfo as Record<string, unknown>;
  const ai = data.aiRecommendation as Record<string, unknown>;
  const docs = data.documents as { type: string; status: string; uploadedDate: string | null }[];
  const timeline = data.timeline as { date: string; event: string; amount: number | null; type: string }[];
  const risk = data.riskProfile as Record<string, unknown>;
  const rm = data.assignedRm as Record<string, unknown>;

  const id = parseInt(params.id || "1");

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/leads")} data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{p.name as string}</h2>
            <p className="text-xs text-muted-foreground">{p.customerId as string} · {lead.id as string} · {p.occupation as string} at {p.employer as string}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[lead.status as string] || "bg-gray-100"}`}>
            {lead.status as string}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setLocation(`/customer360/${id}`)} data-testid="view-360-btn">
            <User className="w-3.5 h-3.5 mr-1.5" /> Customer 360
          </Button>
          <Button size="sm" variant="outline" onClick={() => setLocation(`/ai-intelligence/${id}`)} data-testid="view-ai-btn">
            <Brain className="w-3.5 h-3.5 mr-1.5" /> AI Intelligence
          </Button>
          <Button size="sm" onClick={() => setLocation(`/offers/${id}`)} data-testid="view-offer-btn">
            <Gift className="w-3.5 h-3.5 mr-1.5" /> View Offer
          </Button>
        </div>
      </div>

      {/* Score Banner */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Lead Score", value: lead.leadScore as number, max: 100, color: "bg-primary", text: "text-primary" },
          { label: "Conversion Probability", value: lead.probability as number, max: 100, color: "bg-accent", text: "text-accent" },
          { label: "Credit Score", value: risk.creditScore as number, max: 900, color: "bg-green-500", text: "text-green-600" },
          { label: "AI Confidence", value: ai.confidenceScore as number, max: 100, color: "bg-purple-500", text: "text-purple-600" },
        ].map(item => (
          <Card key={item.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.text}`}>{item.value}</p>
              <Progress value={(item.value / item.max) * 100} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col */}
        <div className="space-y-4">
          {/* Personal Details */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { icon: User, label: "Age / Gender", value: `${p.age}, ${p.gender}` },
                { icon: Briefcase, label: "Occupation", value: p.occupation as string },
                { icon: Building, label: "Employer", value: p.employer as string },
                { icon: MapPin, label: "City", value: `${p.city}, ${p.state}` },
                { icon: Mail, label: "Email", value: p.email as string },
                { icon: Phone, label: "Mobile", value: p.mobile as string },
                { icon: Calendar, label: "Customer Since", value: p.relationshipSince as string },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-medium text-foreground truncate">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Assigned Team */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Assigned Team</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-xs text-muted-foreground">Relationship Manager</p>
                <p className="font-semibold text-foreground">{rm.name as string}</p>
                <p className="text-xs text-muted-foreground">{rm.branch as string} · {rm.experience as string}</p>
                <p className="text-xs text-green-600 font-medium mt-1">Success Rate: {rm.successRate as number}%</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Next Action</p>
                <p className="font-medium text-foreground text-sm">{lead.nextAction as string}</p>
                <p className="text-xs text-muted-foreground">Priority: <span className={lead.priority === "High" ? "text-red-600 font-medium" : ""}>{lead.priority as string}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle col */}
        <div className="space-y-4">
          {/* AI Recommendation Summary */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" /> AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Est. Monthly Income", value: `₹${fmt(ai.estimatedMonthlyIncome as number)}` },
                  { label: "Repayment Capacity", value: `₹${fmt(ai.repaymentCapacity as number)}` },
                  { label: "Recommended Product", value: ai.recommendedProduct as string },
                  { label: "Eligible Amount", value: fmtL(ai.eligibleAmount as number) },
                  { label: "Interest Rate", value: `${ai.interestRate as number}% p.a.` },
                  { label: "Income Stability", value: ai.incomeStability as string },
                ].map(item => (
                  <div key={item.label} className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-accent/10 rounded-lg p-3">
                <p className="text-xs font-medium text-accent mb-1">Conversation Starter</p>
                <p className="text-xs text-foreground italic leading-relaxed">"{ai.conversationStarter as string}"</p>
              </div>
              <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation(`/ai-intelligence/${id}`)} data-testid="full-ai-btn">
                View Full AI Analysis <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Documents</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {docs.filter(d => d.status === "Verified").length}/{docs.length} verified
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {docs.map(doc => {
                const Icon = docStatusIcon[doc.status] || AlertTriangle;
                return (
                  <div key={doc.type} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-foreground">{doc.type}</span>
                    <div className="flex items-center gap-1">
                      <Icon className={`w-3.5 h-3.5 ${docStatusColor[doc.status] || "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${docStatusColor[doc.status] || "text-muted-foreground"}`}>{doc.status}</span>
                    </div>
                  </div>
                );
              })}
              <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => toast.success("Document upload portal opened")} data-testid="upload-docs-btn">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Upload Documents
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right col - Timeline */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Customer Journey Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative pl-4">
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {[...timeline].reverse().map((t, i) => {
                    const Icon = timelineIcon[t.type] || Clock;
                    const color = timelineColor[t.type] || "bg-muted text-muted-foreground";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="relative flex gap-3"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 -ml-2.5 z-10 ${color}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                        <div className="min-w-0 -mt-0.5">
                          <p className="text-xs font-medium text-foreground leading-tight">{t.event}</p>
                          {t.amount && <p className="text-xs text-primary font-semibold">₹{fmt(t.amount)}</p>}
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.date}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Quick Navigation</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: "Income Analysis", icon: TrendingUp, path: `/income/${id}`, color: "bg-green-50 text-green-700 hover:bg-green-100" },
                { label: "Offer Details", icon: Gift, path: `/offers/${id}`, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                { label: "Explainability", icon: Lightbulb, path: `/explainability/${id}`, color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
                { label: "Customer 360", icon: User, path: `/customer360/${id}`, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => setLocation(item.path)}
                    className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${item.color}`}
                    data-testid={`quick-nav-${item.label.toLowerCase().replace(/\s+/g,"-")}`}>
                    <Icon className="w-3.5 h-3.5" />{item.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
