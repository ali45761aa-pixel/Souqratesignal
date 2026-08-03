import { useState, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Bitcoin, Copy, CheckCircle2, Clock, AlertCircle, Loader2,
  CreditCard, Wallet, RefreshCw, QrCode, ArrowRight, DollarSign,
  Shield, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CRYPTO_NETWORKS = [
  { id: "USDT_TRC20", name: "USDT (TRC-20)", icon: "₮", color: "text-green-400", network: "TRON" },
  { id: "USDT_BEP20", name: "USDT (BEP-20)", icon: "₮", color: "text-yellow-400", network: "BSC" },
  { id: "USDT_ERC20", name: "USDT (ERC-20)", icon: "₮", color: "text-blue-400", network: "Ethereum" },
  { id: "TRX", name: "TRX", icon: "⚡", color: "text-red-400", network: "TRON" },
  { id: "BTC", name: "Bitcoin (BTC)", icon: "₿", color: "text-orange-400", network: "Bitcoin" },
  { id: "ETH", name: "Ethereum (ETH)", icon: "Ξ", color: "text-purple-400", network: "Ethereum" },
  { id: "TON", name: "TON", icon: "💎", color: "text-sky-400", network: "TON" },
  { id: "BNB", name: "BNB", icon: "🔶", color: "text-yellow-500", network: "BSC" },
];

function CryptoInvoice({ payment, onRefresh }: { payment: any; onRefresh: () => void }) {
  const { lang } = useLang();
  const tr = t(lang);
  const [copied, setCopied] = useState<"address" | "memo" | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { onRefresh(); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRefresh]);

  const copy = (text: string, type: "address" | "memo") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast.success(tr.common.copied);
  };

  const network = CRYPTO_NETWORKS.find(n => n.id === payment.cryptoCurrency);

  return (
    <Card className="bg-card border-border max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-2xl">
          {network?.icon}
        </div>
        <CardTitle className="text-lg">{network?.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{network?.network} Network</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
          <p className="text-3xl font-bold text-foreground">{payment.amount}</p>
          <p className="text-sm text-muted-foreground">{payment.currency}</p>
        </div>

        {/* Wallet Address */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{tr.payments.walletAddress}</Label>
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-muted p-2.5 rounded-lg font-mono break-all text-foreground">
              {payment.walletAddress || lang === "ar" ? "لم يتم تكوين المحفظة بعد" : "Wallet not configured yet"}
            </code>
            <Button size="icon" variant="outline" className="shrink-0 h-auto" onClick={() => copy(payment.walletAddress, "address")}>
              {copied === "address" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Memo */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{tr.payments.memo}</Label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <code className="text-sm font-mono font-bold text-primary">{payment.memo}</code>
            </div>
            <Button size="icon" variant="outline" className="shrink-0 h-auto" onClick={() => copy(payment.memo, "memo")}>
              {copied === "memo" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === "ar"
              ? "⚠️ يجب إرسال الميمو مع التحويل لتأكيد الدفع تلقائياً"
              : "⚠️ You must include the memo with your transfer for automatic confirmation"}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            {payment.status === "pending" && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
            {payment.status === "confirmed" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {payment.status === "failed" && <AlertCircle className="w-4 h-4 text-destructive" />}
            <span className="text-sm font-medium">
              {payment.status === "pending" ? tr.payments.waiting : payment.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            <span>{countdown}s</span>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">{tr.payments.monitoring}</p>
      </CardContent>
    </Card>
  );
}

export default function PaymentsPage() {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [selectedCrypto, setSelectedCrypto] = useState("USDT_TRC20");
  const [amount, setAmount] = useState("");
  const [activePayment, setActivePayment] = useState<any>(null);

  const { data: payments, refetch } = trpc.payments.getPayments.useQuery();
  const createInvoice = trpc.payments.createCryptoInvoice.useMutation({
    onSuccess: (data) => { setActivePayment(data); toast.success(lang === "ar" ? "تم إنشاء الفاتورة" : "Invoice created"); },
    onError: e => toast.error(e.message),
  });

  const { data: paymentStatus, refetch: refetchStatus } = trpc.payments.checkPaymentStatus.useQuery(
    { paymentId: activePayment?.id },
    { enabled: !!activePayment?.id, refetchInterval: 30000 }
  );

  const statusCounts = {
    pending: (payments ?? []).filter(p => p.status === "pending").length,
    confirmed: (payments ?? []).filter(p => p.status === "confirmed").length,
    total: (payments ?? []).reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          {lang === "ar" ? "نظام الدفع" : "Payment System"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === "ar" ? "عملات رقمية + Stripe + Paymob" : "Crypto + Stripe + Paymob"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400 p-1.5 bg-yellow-500/10 rounded-lg" />
            <div><p className="text-xl font-bold">{statusCounts.pending}</p><p className="text-xs text-muted-foreground">{tr.payments.pending}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-400 p-1.5 bg-green-500/10 rounded-lg" />
            <div><p className="text-xl font-bold">{statusCounts.confirmed}</p><p className="text-xs text-muted-foreground">{tr.payments.confirmed}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg" />
            <div><p className="text-xl font-bold">${statusCounts.total.toFixed(2)}</p><p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي" : "Total"}</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="crypto">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="crypto" className="gap-2"><Bitcoin className="w-4 h-4" />{tr.payments.crypto}</TabsTrigger>
          <TabsTrigger value="stripe" className="gap-2"><CreditCard className="w-4 h-4" />{tr.payments.stripe}</TabsTrigger>
          <TabsTrigger value="paymob" className="gap-2"><CreditCard className="w-4 h-4" />{tr.payments.paymob}</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><Clock className="w-4 h-4" />{lang === "ar" ? "السجل" : "History"}</TabsTrigger>
        </TabsList>

        {/* Crypto Tab */}
        <TabsContent value="crypto" className="mt-4">
          {activePayment ? (
            <div className="space-y-4">
              <CryptoInvoice payment={paymentStatus ?? activePayment} onRefresh={refetchStatus} />
              <div className="text-center">
                <Button variant="outline" onClick={() => setActivePayment(null)}>
                  {lang === "ar" ? "إنشاء فاتورة جديدة" : "Create New Invoice"}
                </Button>
              </div>
            </div>
          ) : (
            <Card className="bg-card border-border max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-base">{lang === "ar" ? "إنشاء فاتورة دفع" : "Create Payment Invoice"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "العملة والشبكة" : "Currency & Network"}</Label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CRYPTO_NETWORKS.map(n => (
                        <SelectItem key={n.id} value={n.id}>
                          <span className={n.color}>{n.icon}</span> {n.name} ({n.network})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tr.payments.amount}</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-background text-lg font-mono"
                    dir="ltr"
                  />
                </div>
                <Button
                  onClick={() => createInvoice.mutate({ amount: parseFloat(amount), currency: "USD", cryptoCurrency: selectedCrypto })}
                  disabled={!amount || parseFloat(amount) <= 0 || createInvoice.isPending}
                  className="w-full gradient-primary text-white gap-2"
                >
                  {createInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {lang === "ar" ? "إنشاء فاتورة" : "Create Invoice"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stripe" className="mt-4">
          <Card className="bg-card border-border max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <CreditCard className="w-12 h-12 text-violet-400 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "أضف مفتاح Stripe من لوحة الإدارة لتفعيل هذه الميزة" : "Add Stripe API key from Admin Panel to enable this feature"}
              </p>
              <Button variant="outline" onClick={() => toast.info("Go to Admin Panel → API Keys → Stripe")}>
                {lang === "ar" ? "إعداد Stripe" : "Setup Stripe"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paymob" className="mt-4">
          <Card className="bg-card border-border max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <CreditCard className="w-12 h-12 text-yellow-400 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "أضف مفتاح Paymob من لوحة الإدارة لتفعيل هذه الميزة" : "Add Paymob API key from Admin Panel to enable this feature"}
              </p>
              <Button variant="outline" onClick={() => toast.info("Go to Admin Panel → API Keys → Paymob")}>
                {lang === "ar" ? "إعداد Paymob" : "Setup Paymob"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{lang === "ar" ? "لا توجد مدفوعات بعد" : "No payments yet"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map(p => (
                <Card key={p.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {p.method === "crypto" ? <Bitcoin className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.cryptoCurrency ?? p.method}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.memo && `Memo: ${p.memo}`}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{p.amount} {p.currency}</p>
                      <Badge variant={p.status === "confirmed" ? "default" : p.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                        {p.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
