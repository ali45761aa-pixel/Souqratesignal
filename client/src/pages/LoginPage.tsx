import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Eye, EyeOff, Sparkles, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`مرحباً ${data.user.name || data.user.username}! 👋`);
      utils.auth.meLocal.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message === "Invalid username or password" ? "اسم المستخدم أو كلمة المرور غير صحيحة" : err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إنشاء الحساب! مرحباً ${data.user.name} 🎉`);
      utils.auth.meLocal.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message === "Username already taken" ? "اسم المستخدم مستخدم بالفعل" : err.message),
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (mode === "login") {
      loginMutation.mutate({ username: username.trim(), password });
    } else {
      if (password.length < 6) { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
      registerMutation.mutate({ username: username.trim(), password, name: name.trim() || undefined });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">منصة الوكيل الذكي</h1>
          <p className="text-muted-foreground text-sm mt-1">ابنِ أي شيء بجملة واحدة</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode("register")}
              className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", mode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم الكامل</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="اسمك الكامل (اختياري)"
                  className="bg-background"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="username"
                  className="bg-background pr-10"
                  disabled={isLoading}
                  autoComplete="username"
                  dir="ltr"
                />
              </div>
              {mode === "register" && (
                <p className="text-xs text-muted-foreground mt-1">أحرف إنجليزية وأرقام و _ فقط</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "6 أحرف على الأقل" : "كلمة المرور"}
                  className="bg-background pr-10 pl-10"
                  disabled={isLoading}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === "login" ? "جاري الدخول..." : "جاري الإنشاء..."}
                </span>
              ) : (
                mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          منصة ذكاء اصطناعي متقدمة • 27 وكيل متخصص
        </p>
      </div>
    </div>
  );
}
