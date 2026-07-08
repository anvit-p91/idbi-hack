import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Gift, ArrowLeft, CheckCircle, FileText, Send, Download,
  Star, Clock, Percent, Banknote, CalendarCheck, Shield
} from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtL = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`;

function calcEMI(principal: number, rateAnnual: number, tenureMonths: number) {
  const r = rateAnnual / 12 / 100;
  return Math.round(principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1));
}

export default function OfferRecommendation() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [selectedTenure, setSelectedTenure] = useState(240);
  const [accepted, setAccepted] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = parseInt(params.id || "1");
    api.getCustomer(id).then(setData).catch(() => toast.error("Failed to load offer"));
  }, [params.id]);

  if (!data) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
    </div>
  );

  const p = data.personalDetails as Record<string, unknown>;
  const ai = data.aiRecommendation as Record<string, unknown>;
  const lead = data.leadInfo as Record<string, unknown>;
  const id = parseInt(params.id || "1");

  const principal = ai.eligibleAmount as number;
  const rate = ai.interestRate as number;
  const emi = calcEMI(principal, rate, selectedTenure);
  const totalPayment = emi * selectedTenure;
  const totalInterest = totalPayment - principal;

  const tenures = lead.leadType === "Home Loan" || lead.leadType === "Mortgage Loan"
    ? [120, 180, 240, 300, 360]
    : lead.leadType === "Personal Loan" || lead.leadType === "Auto Loan"
    ? [12, 24, 36, 48, 60]
    : [12, 24, 36, 48, 60, 84];

  const handleAccept = () => {
    setAccepted(true);
    toast.success("Offer accepted! Application submitted successfully.");
  };

  const handleEmail = () => toast.success("Offer letter sent to customer email");
  const handleSMS = () => toast.success("Offer SMS sent to customer mobile");

  const docs = ai.requiredDocuments as string[];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/leads/${id}`)} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" /> Offer Recommendation — {p.name as string}
          </h2>
          <p className="text-xs text-muted-foreground">{p.customerId as string} · {ai.recommendedProduct as string}</p>
        </div>
        {accepted && <Badge className="bg-green-100 text-green-700 border-0 ml-auto">Offer Accepted</Badge>}
      </div>

      {/* Main Offer Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Pre-Approved Offer</span>
              </div>
              <h3 className="text-2xl font-bold">{ai.recommendedProduct as string}</h3>
              <p className="text-white/70 text-sm mt-1">IDBI Bank · {p.name as string}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center min-w-20">
              <p className="text-white/70 text-xs">Confidence</p>
              <p className="text-2xl font-bold">{ai.confidenceScore as number}%</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Banknote className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-white/70 text-xs mb-1">Loan Amount</p>
              <p className="text-xl font-bold">{fmtL(principal)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Percent className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-white/70 text-xs mb-1">Interest Rate</p>
              <p className="text-xl font-bold">{rate}% p.a.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <CalendarCheck className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-white/70 text-xs mb-1">Monthly EMI</p>
              <p className="text-xl font-bold">₹{fmt(emi)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* EMI Calculator */}
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-primary" />EMI Calculator</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select Tenure</p>
              <div className="flex flex-wrap gap-2">
                {tenures.map(t => (
                  <button key={t}
                    onClick={() => setSelectedTenure(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedTenure === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    data-testid={`tenure-${t}`}
                  >
                    {t >= 12 ? `${t / 12}Y` : `${t}M`}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              {[
                { label: "Loan Amount", value: fmtL(principal) },
                { label: "Interest Rate", value: `${rate}% p.a.` },
                { label: "Tenure", value: `${selectedTenure} months (${(selectedTenure / 12).toFixed(1)} years)` },
                { label: "Monthly EMI", value: `₹${fmt(emi)}`, highlight: true },
                { label: "Total Interest", value: `₹${fmt(totalInterest)}` },
                { label: "Total Payment", value: `₹${fmt(totalPayment)}` },
              ].map(item => (
                <div key={item.label} className={`flex justify-between items-center py-1.5 ${item.highlight ? "border-t border-b border-border" : ""}`}>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.highlight ? "text-primary text-base" : "text-foreground"}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-accent/10 rounded-lg p-3">
              <p className="text-xs text-accent font-medium">Interest Breakdown</p>
              <div className="flex gap-1 mt-2 h-3 rounded-full overflow-hidden">
                <div style={{ width: `${(principal / totalPayment * 100).toFixed(0)}%` }} className="bg-primary rounded-l-full" />
                <div style={{ width: `${(totalInterest / totalPayment * 100).toFixed(0)}%` }} className="bg-accent/70 rounded-r-full" />
              </div>
              <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                <span>Principal ({((principal / totalPayment) * 100).toFixed(0)}%)</span>
                <span>Interest ({((totalInterest / totalPayment) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions & Documents */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Offer Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!accepted ? (
                <>
                  <Button className="w-full" onClick={handleAccept} data-testid="accept-offer-btn">
                    <CheckCircle className="w-4 h-4 mr-2" /> Accept Offer & Submit Application
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleEmail} data-testid="email-offer-btn">
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Email Customer
                    </Button>
                    <Button variant="outline" onClick={handleSMS} data-testid="sms-offer-btn">
                      <FileText className="w-3.5 h-3.5 mr-1.5" /> Send SMS
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => toast.success("Offer letter PDF generated")} data-testid="download-offer-btn">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download Offer Letter
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Application Submitted!</p>
                  <p className="text-xs text-muted-foreground mt-1">Reference: APP-{Date.now().toString().slice(-8)}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={handleEmail}>Email Confirmation</Button>
                    <Button size="sm" className="flex-1" onClick={() => setLocation(`/ai-intelligence/${id}`)}>View AI Report</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</div>
                    <span className="text-xs text-foreground">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Processing Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { step: "Document Collection", time: "1–2 Days", done: false },
                  { step: "Credit Assessment", time: "1 Day", done: false },
                  { step: "Credit Manager Approval", time: "24–48 Hours", done: false },
                  { step: "Loan Agreement Signing", time: "1 Day", done: false },
                  { step: "Disbursal", time: "Same Day", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-[9px] text-muted-foreground">{i + 1}</div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">{item.step}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
