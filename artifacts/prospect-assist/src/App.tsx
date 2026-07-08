import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Layout/Sidebar";
import { TopNav } from "@/components/Layout/TopNav";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import LeadManagement from "@/pages/LeadManagement";
import LeadDetails from "@/pages/LeadDetails";
import Customer360 from "@/pages/Customer360";
import AIIntelligence from "@/pages/AIIntelligence";
import IncomeIntelligence from "@/pages/IncomeIntelligence";
import OfferRecommendation from "@/pages/OfferRecommendation";
import Analytics from "@/pages/Analytics";
import Explainability from "@/pages/Explainability";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const pageTitles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/leads": "Lead Management",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

function AppLayout() {
  const [location] = useLocation();
  const title = pageTitles[location] ||
    (location.startsWith("/leads/") ? "Lead Details" :
    location.startsWith("/customer360/") ? "Customer 360" :
    location.startsWith("/ai-intelligence") ? "AI Intelligence" :
    location.startsWith("/income/") ? "Income Intelligence" :
    location.startsWith("/offers/") ? "Offer Recommendation" :
    location.startsWith("/explainability/") ? "Explainability" :
    "Prospect Assist AI");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/leads" component={LeadManagement} />
            <Route path="/leads/:id" component={LeadDetails} />
            <Route path="/customer360/:id" component={Customer360} />
            <Route path="/ai-intelligence" component={AIIntelligence} />
            <Route path="/ai-intelligence/:id" component={AIIntelligence} />
            <Route path="/income/:id" component={IncomeIntelligence} />
            <Route path="/offers/:id" component={OfferRecommendation} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/explainability/:id" component={Explainability} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div data-theme={theme}>
      {children}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout />
          </WouterRouter>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
