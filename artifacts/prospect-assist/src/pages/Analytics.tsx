import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Trophy, TrendingUp, Users, BarChart3 } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtCr = (n: number) => `₹${(n / 10000000).toFixed(1)} Cr`;
const PIE_COLORS = ["#004C97", "#FFB800", "#0ea5e9", "#f97316", "#22c55e", "#8b5cf6"];

export default function Analytics() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setData).catch(() => toast.error("Failed to load analytics"));
  }, []);

  if (!data) return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
    </div>
  );

  const rmBoard = data.rmLeaderboard as { rank: number; name: string; branch: string; leads: number; converted: number; successRate: number; portfolio: number }[];
  const campaigns = data.campaignPerformance as { campaign: string; leads: number; converted: number; roi: number }[];
  const segments = data.customerSegments as { segment: string; count: number; avgTicket: number }[];
  const growth = data.businessGrowth as { quarter: string; portfolio: number; disbursements: number }[];
  const loanMix = data.loanMix as { type: string; value: number; amount: number }[];

  const rankBadge = (r: number) => r === 1 ? "bg-yellow-100 text-yellow-700" : r === 2 ? "bg-gray-100 text-gray-600" : r === 3 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground";

  return (
    <div className="p-6 space-y-5">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="overview" className="text-xs" data-testid="tab-overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="rm" className="text-xs" data-testid="tab-rm">RM Leaderboard</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs" data-testid="tab-campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments" className="text-xs" data-testid="tab-segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Portfolio Growth (Quarterly)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 10000000).toFixed(0)}Cr`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v, name) => name === "portfolio" ? fmtCr(v as number) : v} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="left" type="monotone" dataKey="portfolio" stroke="#004C97" strokeWidth={2} name="Portfolio" dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="disbursements" stroke="#FFB800" strokeWidth={2} name="Disbursements" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Loan Portfolio Mix</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={loanMix} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={75} label={false}>
                        {loanMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {loanMix.map((l, i) => (
                      <div key={l.type} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-muted-foreground">{l.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-foreground">{l.value}%</span>
                          <p className="text-[10px] text-muted-foreground">{fmtCr(l.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rm">
          <div className="space-y-3">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" />RM Performance Leaderboard</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-border">
                        <th className="text-left pb-2 font-medium">Rank</th>
                        <th className="text-left pb-2 font-medium">Name</th>
                        <th className="text-left pb-2 font-medium">Branch</th>
                        <th className="text-left pb-2 font-medium">Leads</th>
                        <th className="text-left pb-2 font-medium">Converted</th>
                        <th className="text-left pb-2 font-medium">Success Rate</th>
                        <th className="text-left pb-2 font-medium">Portfolio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rmBoard.map(rm => (
                        <tr key={rm.rank} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors" data-testid={`rm-row-${rm.rank}`}>
                          <td className="py-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rankBadge(rm.rank)}`}>{rm.rank}</span>
                          </td>
                          <td className="py-3 font-medium text-foreground">{rm.name}</td>
                          <td className="py-3 text-muted-foreground text-xs">{rm.branch}</td>
                          <td className="py-3 font-medium">{rm.leads}</td>
                          <td className="py-3 font-medium text-green-600">{rm.converted}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-muted rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${rm.successRate}%` }} />
                              </div>
                              <span className="text-xs font-medium">{rm.successRate}%</span>
                            </div>
                          </td>
                          <td className="py-3 font-medium text-primary">{fmtCr(rm.portfolio)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Leads vs Converted by RM</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rmBoard}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="leads" fill="#004C97" name="Total Leads" />
                    <Bar dataKey="converted" fill="#FFB800" name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Campaign Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={campaigns} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="campaign" type="category" tick={{ fontSize: 9 }} width={130} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="leads" fill="#004C97" name="Leads" />
                    <Bar dataKey="converted" fill="#FFB800" name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Campaign ROI</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {campaigns.map(c => (
                  <div key={c.campaign} className="space-y-1" data-testid={`campaign-${c.campaign.slice(0,10)}`}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground truncate">{c.campaign}</span>
                      <span className="text-green-600 font-bold ml-2">{c.roi}% ROI</span>
                    </div>
                    <div className="flex gap-2 h-1.5 rounded-full overflow-hidden bg-muted">
                      <div style={{ width: `${(c.converted / c.leads * 100).toFixed(0)}%` }} className="bg-primary rounded-l-full" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{c.converted}/{c.leads} leads converted ({((c.converted / c.leads) * 100).toFixed(0)}%)</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Customer Segments</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={segments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="segment" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#004C97" name="Customers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Avg Ticket Size by Segment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {segments.map((s, i) => (
                  <div key={s.segment}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium text-foreground">{s.segment}</span>
                      </div>
                      <span className="text-primary font-bold">{s.avgTicket >= 100000 ? `₹${(s.avgTicket / 100000).toFixed(0)}L` : `₹${fmt(s.avgTicket)}`}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.avgTicket / 4500000 * 100).toFixed(0)}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.count} customers</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
