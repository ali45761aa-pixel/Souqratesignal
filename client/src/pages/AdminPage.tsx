import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Key, Brain, Server, Settings, Plus, Trash2, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Save, RefreshCw, Shield
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_SERVICES = [
  { id: "anthropic", name: "Anthropic (Claude)", category: "AI", color: "text-orange-400" },
  { id: "openai", name: "OpenAI (GPT-4o)", category: "AI", color: "text-green-400" },
  { id: "deepseek", name: "DeepSeek", category: "AI", color: "text-blue-400" },
  { id: "stability_ai", name: "Stability AI", category: "AI", color: "text-purple-400" },
  { id: "telegram", name: "Telegram Bot API", category: "Bots", color: "text-sky-400" },
  { id: "whatsapp", name: "WhatsApp Business", category: "Bots", color: "text-green-500" },
  { id: "stripe", name: "Stripe", category: "Payments", color: "text-violet-400" },
  { id: "paymob", name: "Paymob", category: "Payments", color: "text-yellow-400" },
  { id: "github", name: "GitHub Token", category: "Deploy", color: "text-gray-400" },
  { id: "vercel", name: "Vercel Token", category: "Deploy", color: "text-white" },
  { id: "netlify", name: "Netlify Token", category: "Deploy", color: "text-teal-400" },
  { id: "aws_s3", name: "AWS S3", category: "Storage", color: "text-orange-500" },
  { id: "cloudflare_r2", name: "Cloudflare R2", category: "Storage", color: "text-orange-400" },
  { id: "resend", name: "Resend", category: "Email", color: "text-blue-300" },
  { id: "sendgrid", name: "SendGrid", category: "Email", color: "text-blue-500" },
  { id: "google_translate", name: "Google Translate", category: "Tools", color: "text-red-400" },
  { id: "sentry", name: "Sentry", category: "Monitoring", color: "text-pink-400" },
];

const AI_MODELS = [
  "claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5",
  "gpt-4o", "gpt-4o-mini", "gpt-4-turbo",
  "deepseek-chat", "deepseek-coder",
];

function ApiKeyRow({ service, existingKeys, onSave, onDelete }: {
  service: typeof API_SERVICES[0];
  existingKeys: any[];
  onSave: (service: string, key: string) => void;
  onDelete: (id: number) => void;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const existing = existingKeys.find(k => k.service === service.id);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/20 transition-all">
      <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center shrink-0">
        <Key className={cn("w-4 h-4", service.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{service.name}</span>
          <Badge variant="outline" className="text-xs">{service.category}</Badge>
          {existing && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
        </div>
        {existing ? (
          <div className="flex items-center gap-2">
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {existing.keyValue}
            </code>
            <button onClick={() => onDelete(existing.id)} className="text-destructive hover:text-destructive/80">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={show ? "text" : "password"}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={`Enter ${service.name} API key...`}
                className="h-7 text-xs bg-background pr-8"
              />
              <button
                onClick={() => setShow(!show)}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => { if (value) { onSave(service.id, value); setValue(""); } }}
              disabled={!value}
            >
              <Save className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [activeTab, setActiveTab] = useState("api-keys");

  const { data: apiKeys, refetch: refetchKeys } = trpc.admin.getApiKeys.useQuery();
  const { data: aiSettings } = trpc.admin.getAiSettings.useQuery();

  const upsertKey = trpc.admin.setApiKey.useMutation({
    onSuccess: () => { toast.success(tr.settings.keyAdded); refetchKeys(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteKey = trpc.admin.deleteApiKey.useMutation({
    onSuccess: () => { toast.success(tr.settings.keyDeleted); refetchKeys(); },
  });

  const updateAi = trpc.admin.updateAiSettings.useMutation({
    onSuccess: () => toast.success(tr.common.success),
    onError: (e) => toast.error(e.message),
  });

  const [aiForm, setAiForm] = useState({
    primaryModel: aiSettings?.primaryModel ?? "claude-sonnet-4-5",
    temperature: aiSettings?.temperature ?? 0.7,
    maxTokens: aiSettings?.maxTokens ?? 8192,
    systemPrompt: aiSettings?.systemPrompt ?? "",
    chainOfThought: aiSettings?.chainOfThought ?? true,
    useOllama: aiSettings?.useOllama ?? false,
    ollamaUrl: aiSettings?.ollamaUrl ?? "",
  });

  const categories = Array.from(new Set(API_SERVICES.map(s => s.category)));

  return (
    <div className="p-6 space-y-6 max-w-5xl" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          {lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === "ar" ? "إدارة مفاتيح API وإعدادات الذكاء الاصطناعي" : "Manage API keys and AI settings"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="w-4 h-4" />
            {tr.settings.apiKeys}
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="gap-2">
            <Brain className="w-4 h-4" />
            {tr.settings.title}
          </TabsTrigger>
          <TabsTrigger value="server" className="gap-2">
            <Server className="w-4 h-4" />
            {lang === "ar" ? "السيرفر" : "Server"}
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4 mt-4">
          {categories.map(cat => (
            <Card key={cat} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{cat}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {API_SERVICES.filter(s => s.category === cat).map(service => (
                  <ApiKeyRow
                    key={service.id}
                    service={service}
                    existingKeys={apiKeys ?? []}
                    onSave={(svc, key) => upsertKey.mutate({ service: svc, keyValue: key })}
                    onDelete={(id) => deleteKey.mutate({ service: (apiKeys ?? []).find((k: any) => k.id === id)?.service ?? "" })}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai-settings" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">{lang === "ar" ? "إعدادات النموذج" : "Model Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>{tr.settings.model}</Label>
                <Select value={aiForm.primaryModel} onValueChange={v => setAiForm(f => ({ ...f, primaryModel: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{tr.settings.temperature}</Label>
                  <span className="text-sm text-muted-foreground">{aiForm.temperature}</span>
                </div>
                <Slider
                  value={[aiForm.temperature]}
                  onValueChange={([v]) => setAiForm(f => ({ ...f, temperature: v }))}
                  min={0} max={2} step={0.1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{tr.settings.maxTokens}</Label>
                  <span className="text-sm text-muted-foreground">{aiForm.maxTokens.toLocaleString()}</span>
                </div>
                <Slider
                  value={[aiForm.maxTokens]}
                  onValueChange={([v]) => setAiForm(f => ({ ...f, maxTokens: v }))}
                  min={256} max={200000} step={256}
                />
              </div>

              <div className="space-y-2">
                <Label>{tr.settings.systemPrompt}</Label>
                <Textarea
                  value={aiForm.systemPrompt}
                  onChange={e => setAiForm(f => ({ ...f, systemPrompt: e.target.value }))}
                  placeholder={lang === "ar" ? "أدخل البرومبت الرئيسي للنظام..." : "Enter system prompt..."}
                  className="bg-background min-h-[100px] font-mono text-sm"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium">{tr.settings.chainOfThought}</p>
                  <p className="text-xs text-muted-foreground">Chain-of-Thought Reasoning</p>
                </div>
                <Switch
                  checked={aiForm.chainOfThought}
                  onCheckedChange={v => setAiForm(f => ({ ...f, chainOfThought: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium">{tr.settings.ollama}</p>
                  <p className="text-xs text-muted-foreground">Local Ollama instance</p>
                </div>
                <Switch
                  checked={aiForm.useOllama}
                  onCheckedChange={v => setAiForm(f => ({ ...f, useOllama: v }))}
                />
              </div>

              {aiForm.useOllama && (
                <div className="space-y-2">
                  <Label>Ollama URL</Label>
                  <Input
                    value={aiForm.ollamaUrl}
                    onChange={e => setAiForm(f => ({ ...f, ollamaUrl: e.target.value }))}
                    placeholder="http://localhost:11434"
                    className="bg-background font-mono"
                    dir="ltr"
                  />
                </div>
              )}

              <Button
                onClick={() => updateAi.mutate(aiForm)}
                disabled={updateAi.isPending}
                className="w-full gradient-primary text-white"
              >
                {updateAi.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Save className="w-4 h-4 me-2" />}
                {tr.common.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Server Tab */}
        <TabsContent value="server" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Docker", desc: lang === "ar" ? "إعدادات Docker لعزل المشاريع" : "Docker settings for project isolation", status: "configured" },
              { title: "GitHub", desc: lang === "ar" ? "نسخ الكود ونشره" : "Code backup and deployment", status: "pending" },
              { title: "Vercel / Netlify", desc: lang === "ar" ? "نشر تلقائي للمشاريع" : "Auto-deploy projects", status: "pending" },
              { title: "S3 / R2", desc: lang === "ar" ? "تخزين الملفات والأصول" : "File and asset storage", status: "pending" },
              { title: "SMTP", desc: lang === "ar" ? "إرسال البريد الإلكتروني" : "Email sending", status: "pending" },
              { title: "Redis", desc: lang === "ar" ? "Cache والمهام المجدولة" : "Cache and scheduled jobs", status: "pending" },
            ].map((item, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.status === "configured" ? "bg-green-400" : "bg-muted-foreground/30"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Feature coming soon")}>
                    {tr.common.edit}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
