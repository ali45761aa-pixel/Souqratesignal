import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, FileText, Ticket, Plus, Search, Mail, Phone,
  Building2, DollarSign, Calendar, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function NewClientDialog({ onCreated }: { onCreated: () => void }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", country: "" });
  const create = trpc.crm.createClient.useMutation({
    onSuccess: () => { toast.success(lang === "ar" ? "تم إضافة العميل" : "Client added"); setOpen(false); onCreated(); },
    onError: e => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-white gap-2" size="sm">
          <Plus className="w-4 h-4" />
          {lang === "ar" ? "عميل جديد" : "New Client"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{lang === "ar" ? "إضافة عميل جديد" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {[
            { key: "name", label: lang === "ar" ? "الاسم *" : "Name *", required: true },
            { key: "email", label: "Email", required: false },
            { key: "phone", label: lang === "ar" ? "الهاتف" : "Phone", required: false },
            { key: "company", label: lang === "ar" ? "الشركة" : "Company", required: false },
            { key: "country", label: lang === "ar" ? "الدولة" : "Country", required: false },
          ].map(field => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs">{field.label}</Label>
              <Input
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="bg-background"
              />
            </div>
          ))}
          <Button
            onClick={() => create.mutate(form)}
            disabled={!form.name || create.isPending}
            className="w-full gradient-primary text-white"
          >
            {lang === "ar" ? "إضافة" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CRMPage() {
  const { lang, isRTL } = useLang();
  const [search, setSearch] = useState("");
  const { data: clients, refetch } = trpc.crm.listClients.useQuery();
  const { data: invoices } = trpc.crm.listInvoices.useQuery();
  const { data: tickets } = trpc.crm.listTickets.useQuery();

  const filteredClients = (clients ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lang === "ar" ? "إدارة العملاء" : "CRM"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "ar" ? "إدارة العملاء والفواتير والتذاكر" : "Manage clients, invoices, and tickets"}
          </p>
        </div>
        <NewClientDialog onCreated={refetch} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg" />
            <div>
              <p className="text-xl font-bold">{clients?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "عميل" : "Clients"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-8 h-8 text-yellow-400 p-1.5 bg-yellow-500/10 rounded-lg" />
            <div>
              <p className="text-xl font-bold">{invoices?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "فاتورة" : "Invoices"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-red-400 p-1.5 bg-red-500/10 rounded-lg" />
            <div>
              <p className="text-xl font-bold">{tickets?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "تذكرة" : "Tickets"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="clients" className="gap-2"><Users className="w-4 h-4" />{lang === "ar" ? "العملاء" : "Clients"}</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2"><FileText className="w-4 h-4" />{lang === "ar" ? "الفواتير" : "Invoices"}</TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2"><Ticket className="w-4 h-4" />{lang === "ar" ? "التذاكر" : "Tickets"}</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "ar" ? "بحث عن عميل..." : "Search clients..."} className="ps-9 bg-card" />
          </div>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{lang === "ar" ? "لا يوجد عملاء بعد" : "No clients yet"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map(client => (
                <Card key={client.id} className="bg-card border-border hover:border-primary/20 transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{client.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>}
                        {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
                        {client.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{client.company}</span>}
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-sm font-semibold text-green-400">${((client as any).totalPaid ?? (client as any).totalSpent ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "إجمالي" : "total paid"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          {!invoices || invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{lang === "ar" ? "لا توجد فواتير بعد" : "No invoices yet"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <Card key={inv.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <FileText className="w-8 h-8 text-yellow-400 p-1.5 bg-yellow-500/10 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">${inv.amount} {inv.currency}</p>
                      <Badge variant={inv.status === "confirmed" ? "default" : inv.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                        {inv.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{lang === "ar" ? "لا توجد تذاكر بعد" : "No tickets yet"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", {
                      "bg-red-400": ticket.status === "open",
                      "bg-yellow-400": ticket.status === "in_progress",
                      "bg-green-400": ticket.status === "resolved",
                      "bg-muted-foreground": ticket.status === "closed",
                    })} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ticket.message}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{ticket.priority}</Badge>
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
