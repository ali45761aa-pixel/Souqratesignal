import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FolderOpen, Search, Plus, Star, StarOff, Globe, ShoppingCart,
  MessageSquare, Gamepad2, BookOpen, Trash2, Eye, Tag, Clock,
  DollarSign, Zap, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  website: <Globe className="w-4 h-4" />,
  ecommerce: <ShoppingCart className="w-4 h-4" />,
  bot: <MessageSquare className="w-4 h-4" />,
  game: <Gamepad2 className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
};

export default function ProjectsPage() {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "failed">("all");

  const { data: projects, refetch } = trpc.projects.list.useQuery();
  const updateProject = trpc.projects.update.useMutation({ onSuccess: () => refetch() });
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => { toast.success(lang === "ar" ? "تم حذف المشروع" : "Project deleted"); refetch(); },
  });

  const filtered = (projects ?? []).filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tr.nav.projects}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {(projects ?? []).length} {lang === "ar" ? "مشروع" : "projects"}
          </p>
        </div>
        <Link href="/chat">
          <Button className="gradient-primary text-white gap-2" size="sm">
            <Plus className="w-4 h-4" />
            {tr.nav.newProject}
          </Button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr.common.search} className="ps-9 bg-card" />
        </div>
        <div className="flex gap-2">
          {(["all","active","completed","failed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                filter === f ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:border-primary/20"
              )}
            >
              {f === "all" ? (lang === "ar" ? "الكل" : "All") : tr.status[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground">{tr.dashboard.noProjects}</p>
          <Link href="/chat">
            <Button variant="outline" className="mt-4 gap-2">
              <Zap className="w-4 h-4" />
              {tr.dashboard.startFirst}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <Card key={project.id} className="bg-card border-border hover:border-primary/30 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {TYPE_ICONS[project.projectType ?? "website"] ?? <Globe className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={
                    project.status === "completed" ? "default" :
                    project.status === "failed" ? "destructive" :
                    project.status === "paused" ? "outline" : "secondary"
                  } className="text-xs shrink-0">
                    {(tr.status as any)[project.status] ?? project.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.prompt}</p>

                {/* Tags */}
                {(project.tags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(project.tags as string[]).slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />${project.totalCost.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />{(project.tokensUsed / 1000).toFixed(1)}K
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/chat?project=${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <Eye className="w-3 h-3" /> {tr.common.view}
                    </Button>
                  </Link>
                  <button
                    onClick={() => updateProject.mutate({ id: project.id, isFavorite: !project.isFavorite })}
                    className="p-2 rounded-lg border border-border hover:border-yellow-400/30 hover:bg-yellow-400/10 transition-all"
                  >
                    {project.isFavorite
                      ? <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      : <StarOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => { if (confirm(lang === "ar" ? "هل تريد حذف هذا المشروع؟" : "Delete this project?")) deleteProject.mutate({ id: project.id }); }}
                    className="p-2 rounded-lg border border-border hover:border-destructive/30 hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
