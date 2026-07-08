import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface Lead {
  id: string; numId: number; customerId: string; name: string; age: number;
  city: string; state: string; occupation: string; employer: string;
  annualIncome: number; leadType: string; recommendedProduct: string;
  leadScore: number; conversionProbability: number; priority: string;
  status: string; assignedRm: string; assignedCm: string; branch: string;
  gender: string; estimatedIncome: number;
}

const statusColor: Record<string, string> = {
  "New": "bg-blue-100 text-blue-700 border-blue-200",
  "Assigned": "bg-purple-100 text-purple-700 border-purple-200",
  "Contacted": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Documents Pending": "bg-orange-100 text-orange-700 border-orange-200",
  "Under Review": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Approved": "bg-green-100 text-green-700 border-green-200",
  "Rejected": "bg-red-100 text-red-700 border-red-200",
  "Converted": "bg-teal-100 text-teal-700 border-teal-200",
};

const priorityColor: Record<string, string> = {
  "High": "bg-red-100 text-red-700",
  "Medium": "bg-amber-100 text-amber-700",
  "Low": "bg-gray-100 text-gray-600",
};

const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 65 ? "text-amber-600" : "text-red-600";

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Lead>("leadScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();
  const PAGE_SIZE = 10;

  useEffect(() => {
    api.getCustomers().then(d => { setLeads(d as Lead[]); setLoading(false); })
      .catch(() => { toast.error("Failed to load leads"); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return leads
      .filter(l =>
        (search === "" || l.name.toLowerCase().includes(search.toLowerCase()) ||
         l.id.toLowerCase().includes(search.toLowerCase()) || l.customerId.toLowerCase().includes(search.toLowerCase())) &&
        (filterType === "all" || l.leadType === filterType) &&
        (filterStatus === "all" || l.status === filterStatus) &&
        (filterPriority === "all" || l.priority === filterPriority) &&
        (filterBranch === "all" || l.branch === filterBranch)
      )
      .sort((a, b) => {
        const av = a[sortKey] as number | string;
        const bv = b[sortKey] as number | string;
        if (typeof av === "number" && typeof bv === "number")
          return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
  }, [leads, search, filterType, filterStatus, filterPriority, filterBranch, sortKey, sortDir]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: keyof Lead) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const rows = [
      ["Lead ID","Name","Lead Type","Product","Score","Income","Probability","Priority","Status","RM","Branch"],
      ...filtered.map(l => [l.id, l.name, l.leadType, l.recommendedProduct, l.leadScore,
        l.estimatedIncome, l.conversionProbability, l.priority, l.status, l.assignedRm, l.branch])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "leads_export.csv"; a.click();
    toast.success("CSV exported successfully");
  };

  const SortIcon = ({ col }: { col: keyof Lead }) =>
    sortKey === col ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  const uniqueTypes = [...new Set(leads.map(l => l.leadType))];
  const uniqueStatuses = [...new Set(leads.map(l => l.status))];
  const uniqueBranches = [...new Set(leads.map(l => l.branch))];

  if (loading) return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search by name, lead ID, CIF..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 text-sm h-9" data-testid="lead-search" />
        </div>
        <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-type"><SelectValue placeholder="Loan Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={v => { setFilterPriority(v); setPage(1); }}>
          <SelectTrigger className="w-32 h-9 text-sm" data-testid="filter-priority"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBranch} onValueChange={v => { setFilterBranch(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="filter-branch"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {uniqueBranches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCSV} className="h-9" data-testid="export-csv-btn">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Count */}
      <div className="text-xs text-muted-foreground">
        Showing {paged.length} of {filtered.length} leads
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs">
                {[
                  ["id", "Lead ID"], ["name", "Customer Name"], ["leadType", "Lead Type"],
                  ["recommendedProduct", "Product"], ["leadScore", "Score"],
                  ["estimatedIncome", "Est. Income"], ["conversionProbability", "Probability"],
                  ["priority", "Priority"], ["status", "Status"], ["assignedRm", "RM"], ["branch", "Branch"]
                ].map(([key, label]) => (
                  <th key={key} className="px-3 py-2.5 text-left font-medium cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                    onClick={() => toggleSort(key as keyof Lead)}>
                    <span className="flex items-center gap-1">{label}<SortIcon col={key as keyof Lead} /></span>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((l, i) => (
                <tr key={l.id}
                  className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setLocation(`/leads/${l.numId}`)}
                  data-testid={`lead-row-${l.id}`}
                >
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{l.id}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{l.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground text-xs">{l.leadType}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{l.recommendedProduct}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`font-bold text-sm ${scoreColor(l.leadScore)}`}>{l.leadScore}</span>
                    <span className="text-muted-foreground text-xs">/100</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs">₹{fmt(l.estimatedIncome)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap min-w-24">
                    <div className="flex items-center gap-1.5">
                      <Progress value={l.conversionProbability} className="h-1.5 w-14" />
                      <span className="text-xs font-medium">{l.conversionProbability}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[l.priority]}`}>{l.priority}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[l.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>{l.status}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{l.assignedRm}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground">{l.branch}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-primary hover:text-primary"
                      onClick={e => { e.stopPropagation(); setLocation(`/leads/${l.numId}`); }}
                      data-testid={`view-lead-${l.id}`}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Page {page} of {Math.max(1, pages)}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            data-testid="prev-page"><ChevronLeft className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
            data-testid="next-page"><ChevronRight className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
