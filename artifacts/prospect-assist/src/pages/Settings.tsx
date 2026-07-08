import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon, User, Bell, Brain, Moon, Sun,
  Save, Building2, Shield, Info
} from "lucide-react";

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notif, setNotif] = useState({ email: true, sms: true, push: true, leadAlert: true, approvalAlert: true });
  const [aiThresholds, setAiThresholds] = useState({ minLeadScore: 60, minConversionProb: 50, confidenceLevel: 75 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(d => {
      setData(d);
      const n = d.notifications as typeof notif;
      const ai = d.aiThresholds as typeof aiThresholds;
      const t = d.theme as "light" | "dark";
      setNotif(n);
      setAiThresholds(ai);
      setTheme(t);
    }).catch(() => toast.error("Failed to load settings"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  if (!data) return (
    <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
  );

  const rm = data.currentRm as Record<string, unknown>;

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="profile" className="text-xs" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs" data-testid="tab-ai">AI Thresholds</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs" data-testid="tab-appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" />Relationship Manager Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{rm.name as string}</p>
                  <p className="text-sm text-muted-foreground">{rm.role as string}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{rm.employeeId as string}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">{rm.branch as string}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Employee ID", value: rm.employeeId as string },
                  { label: "Branch", value: rm.branch as string },
                  { label: "Role", value: rm.role as string },
                  { label: "Experience", value: rm.experience as string },
                ].map(item => (
                  <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => toast.info("Profile edit functionality — contact your system admin")} variant="outline" className="w-full" data-testid="edit-profile-btn">
                <SettingsIcon className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "email", label: "Email Notifications", description: "Receive lead updates via email" },
                { key: "sms", label: "SMS Notifications", description: "Get instant alerts via SMS" },
                { key: "push", label: "Push Notifications", description: "Browser push notifications" },
                { key: "leadAlert", label: "New Lead Alerts", description: "Notify when a new lead is assigned" },
                { key: "approvalAlert", label: "Approval Alerts", description: "Notify on loan approval/rejection" },
              ].map(item => (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="text-sm font-medium text-foreground">{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notif[item.key as keyof typeof notif]}
                      onCheckedChange={v => setNotif(n => ({ ...n, [item.key]: v }))}
                      data-testid={`switch-${item.key}`}
                    />
                  </div>
                  <Separator />
                </div>
              ))}
              <Button onClick={handleSave} className="w-full" data-testid="save-notifications-btn">
                <Save className="w-3.5 h-3.5 mr-1.5" />{saved ? "Saved!" : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="w-4 h-4 text-purple-600" />AI Model Thresholds</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-3 bg-purple-50 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-700">These thresholds control which leads are flagged as high-priority by the AI model. Lowering thresholds increases volume; raising them improves precision.</p>
              </div>
              {[
                { key: "minLeadScore", label: "Minimum Lead Score", description: "Leads below this score are marked as low priority", min: 30, max: 90 },
                { key: "minConversionProb", label: "Minimum Conversion Probability", description: "AI confidence threshold for recommendations", min: 20, max: 90 },
                { key: "confidenceLevel", label: "AI Confidence Level Required", description: "Minimum confidence before showing AI recommendations", min: 50, max: 95 },
              ].map(item => (
                <div key={item.key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">{item.label}</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-primary w-12 text-right">{aiThresholds[item.key as keyof typeof aiThresholds]}</span>
                  </div>
                  <Slider
                    min={item.min} max={item.max} step={5}
                    value={[aiThresholds[item.key as keyof typeof aiThresholds]]}
                    onValueChange={([v]) => setAiThresholds(t => ({ ...t, [item.key]: v }))}
                    data-testid={`slider-${item.key}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.min}</span><span>{item.max}</span>
                  </div>
                  <Separator />
                </div>
              ))}
              <Button onClick={handleSave} className="w-full" data-testid="save-ai-btn">
                <Save className="w-3.5 h-3.5 mr-1.5" />{saved ? "Saved!" : "Save AI Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Sun className="w-4 h-4 text-accent" />Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Theme Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
                    data-testid="theme-light"
                  >
                    <Sun className="w-5 h-5 text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Light Mode</p>
                      <p className="text-xs text-muted-foreground">Default theme</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
                    data-testid="theme-dark"
                  >
                    <Moon className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Easy on the eyes</p>
                    </div>
                  </button>
                </div>
              </div>
              <Separator />
              <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">IDBI Bank Prospect Assist AI</p>
                  <p className="text-xs text-muted-foreground">Hackathon Edition · v1.0.0</p>
                </div>
                <Badge className="ml-auto bg-primary/10 text-primary border-0 text-xs">Enterprise CRM</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
