import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  User, CreditCard, PiggyBank, Shield, TrendingUp, Building2,
  CheckCircle, XCircle, Clock, ArrowLeft, Phone, Mail, FileText
} from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtL = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`;

export default function Customer360() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const id = parseInt(params.id || "1");
    api.getCustomer(id).then(setData).catch(() => toast.error("Failed to load customer"));
  }, [params.id]);

  if (!data) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
    </div>
  );

  const p = data.personalDetails as Record<string, unknown>;
  const banking = data.bankingRelationship as Record<string, unknown>;
  const products = data.existingProducts as { product: string; status: string; amount: number | null; outstanding: number | null; emi: number | null; eligibility: number | null }[];
  const ai = data.aiRecommendation as Record<string, unknown>;
  const risk = data.riskProfile as Record<string, unknown>;
  const lead = data.leadInfo as Record<string, unknown>;
  const id = parseInt(params.id || "1");

  const savings = banking.savingsAccount as Record<string, unknown> | null;
  const salary = banking.salaryAccount as Record<string, unknown> | null;
  const current = banking.currentAccount as Record<string, unknown> | null;
  const fds = banking.fd as { amount: number; maturityDate: string; rate: number }[] | null;
  const loans = banking.existingLoans as { type: string; amount: number; outstanding: number; emi: number }[] | null;
  const cards = banking.creditCards as { name: string; limit: number; outstanding: number }[] | null;
  const insurance = banking.insurance as { type: string; premium: number; sumAssured: number }[] | null;
  const investments = banking.investments as { type: string; amount: number; frequency: string }[] | null;
  const crossSell = ai.crossSellOpportunities as string[] | [];

  const riskItems = [
    { label: "Income Stability", value: risk.incomeStability as number },
    { label: "Repayment Behaviour", value: risk.repaymentBehaviour as number },
    { label: "Fraud Risk (Lower is Better)", value: 100 - (risk.fraudRisk as number) },
    { label: "Delinquency Risk (Lower is Better)", value: 100 - (risk.delinquencyRisk as number) },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/leads/${id}`)} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{p.name as string}</h2>
          <p className="text-xs text-muted-foreground">{p.customerId as string} · {p.customerType as string}</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-0 text-xs">{lead.leadType as string}</Badge>
      </div>

      {/* Profile banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">{p.name as string}</h3>
            <p className="text-white/80 text-sm">{p.occupation as string} · {p.employer as string}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email as string}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.mobile as string}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Customer Since</p>
            <p className="text-lg font-semibold">{p.relationshipSince as string}</p>
            <p className="text-white/70 text-xs mt-2">Annual Income</p>
            <p className="text-lg font-semibold">₹{fmt(p.annualIncome as number)}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="banking" className="space-y-4">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="banking" className="text-xs" data-testid="tab-banking">Banking Relationship</TabsTrigger>
          <TabsTrigger value="products" className="text-xs" data-testid="tab-products">Products</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs" data-testid="tab-risk">Risk Profile</TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs" data-testid="tab-opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="banking">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Accounts */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PiggyBank className="w-4 h-4 text-primary" />Accounts</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {savings && <div className="flex justify-between p-2 bg-green-50 rounded-lg">
                  <div><p className="text-xs text-muted-foreground">Savings ({savings.number as string})</p><p className="font-medium text-green-700">₹{fmt(savings.balance as number)}</p></div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>}
                {salary && <div className="flex justify-between p-2 bg-blue-50 rounded-lg">
                  <div><p className="text-xs text-muted-foreground">Salary ({salary.number as string})</p><p className="font-medium text-blue-700">₹{fmt(salary.balance as number)}</p></div>
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>}
                {current && <div className="flex justify-between p-2 bg-purple-50 rounded-lg">
                  <div><p className="text-xs text-muted-foreground">Current ({current.number as string})</p><p className="font-medium text-purple-700">₹{fmt(current.balance as number)}</p></div>
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                </div>}
                {!savings && !salary && !current && <p className="text-xs text-muted-foreground">No account data</p>}
              </CardContent>
            </Card>

            {/* Deposits & Investments */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" />Deposits & Investments</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {fds?.map((fd, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fixed Deposit @ {fd.rate}%</p>
                    <p className="font-medium text-foreground">₹{fmt(fd.amount)}</p>
                    <p className="text-xs text-muted-foreground">Matures: {fd.maturityDate}</p>
                  </div>
                ))}
                {investments?.map((inv, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{inv.type}</p>
                    <p className="font-medium text-foreground">₹{fmt(inv.amount)} / {inv.frequency}</p>
                  </div>
                ))}
                {(!fds?.length && !investments?.length) && <p className="text-xs text-muted-foreground">No FD/investment data</p>}
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" />Insurance</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {insurance?.map((ins, i) => (
                  <div key={i} className="p-2 bg-teal-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">{ins.type}</p>
                    <p className="font-medium text-teal-700">Sum Assured: {fmtL(ins.sumAssured)}</p>
                    <p className="text-xs text-muted-foreground">Premium: ₹{fmt(ins.premium)}/yr</p>
                  </div>
                ))}
                {!insurance?.length && <p className="text-xs text-muted-foreground">No insurance products</p>}
              </CardContent>
            </Card>

            {/* Existing Loans */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-600" />Existing Loans</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {loans?.map((ln, i) => (
                  <div key={i} className="p-2 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-700">{ln.type}</p>
                    <p className="text-xs text-muted-foreground">Amount: ₹{fmt(ln.amount)}</p>
                    <div className="mt-1">
                      <Progress value={((ln.amount - ln.outstanding) / ln.amount) * 100} className="h-1.5" />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Outstanding: ₹{fmt(ln.outstanding)}</span>
                        <span className="text-muted-foreground">EMI: ₹{fmt(ln.emi)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!loans?.length && <p className="text-xs text-muted-foreground text-center py-4">No existing loans</p>}
              </CardContent>
            </Card>

            {/* Credit Cards */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-600" />Credit Cards</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {cards?.map((c, i) => (
                  <div key={i} className="p-2 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-700">{c.name}</p>
                    <Progress value={(c.outstanding / c.limit) * 100} className="h-1.5 mt-1.5" />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Used: ₹{fmt(c.outstanding)}</span>
                      <span className="text-muted-foreground">Limit: ₹{fmt(c.limit)}</span>
                    </div>
                  </div>
                ))}
                {!cards?.length && <p className="text-xs text-muted-foreground text-center py-4">No credit cards</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-3">
            {products.map((prod, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{prod.product}</p>
                    {prod.amount && <p className="text-xs text-muted-foreground">Amount: ₹{fmt(prod.amount)}</p>}
                    {prod.outstanding && <p className="text-xs text-muted-foreground">Outstanding: ₹{fmt(prod.outstanding)}</p>}
                    {prod.emi && <p className="text-xs text-muted-foreground">EMI: ₹{fmt(prod.emi)}/month</p>}
                    {prod.eligibility && <p className="text-xs text-green-600 font-medium">Eligible: {fmtL(prod.eligibility)}</p>}
                  </div>
                  <Badge className={
                    prod.status === "Active" ? "bg-green-100 text-green-700 border-0" :
                    prod.status === "Pre-Approved" ? "bg-accent/20 text-amber-700 border-0" :
                    prod.status === "Approved" ? "bg-blue-100 text-blue-700 border-0" :
                    "bg-muted text-muted-foreground border-0"
                  }>{prod.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Scores</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Credit Score (CIBIL)</p>
                  <p className="text-4xl font-bold text-primary">{risk.creditScore as number}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {(risk.creditScore as number) >= 750 ? "Excellent" : (risk.creditScore as number) >= 700 ? "Good" : "Fair"}
                  </p>
                </div>
                {riskItems.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}/100</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Risk Assessment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-center p-4 rounded-xl ${
                  risk.overallRisk === "Very Low" ? "bg-green-50" :
                  risk.overallRisk === "Low" ? "bg-teal-50" :
                  risk.overallRisk === "Moderate" ? "bg-amber-50" : "bg-red-50"
                }`}>
                  <p className="text-xs text-muted-foreground mb-1">Overall Risk Level</p>
                  <p className={`text-2xl font-bold ${
                    risk.overallRisk === "Very Low" || risk.overallRisk === "Low" ? "text-green-700" :
                    risk.overallRisk === "Moderate" ? "text-amber-700" : "text-red-700"
                  }`}>{risk.overallRisk as string}</p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Debt-to-Income Ratio</span>
                    <span className="font-medium">{risk.debtRatio as number}%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Fraud Risk Index</span>
                    <span className="font-medium">{risk.fraudRisk as number}/100 (Lower is better)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Delinquency Risk</span>
                    <span className="font-medium">{risk.delinquencyRisk as number}/100 (Lower is better)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Cross-Sell Opportunities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(crossSell || []).map((opp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{opp}</p>
                      <Button size="sm" variant="link" className="p-0 h-auto text-xs text-primary"
                        onClick={() => toast.info(`Cross-sell opportunity: ${opp}`)}
                        data-testid={`cross-sell-${i}`}>Explore Opportunity</Button>
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
