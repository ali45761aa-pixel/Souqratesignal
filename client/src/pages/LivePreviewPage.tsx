import { useState, useRef, useCallback } from "react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Code2,
  Eye, RotateCcw, RotateCw, Save, Download, GitBranch, Clock,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Editor from "@monaco-editor/react";

type ViewMode = "desktop" | "tablet" | "mobile";

const VIEW_SIZES: Record<ViewMode, { width: string; label: string }> = {
  desktop: { width: "100%", label: "1280px" },
  tablet: { width: "768px", label: "768px" },
  mobile: { width: "375px", label: "375px" },
};

// Sample code for demo
const SAMPLE_CODE = {
  html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مشروعي</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; }
    .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }
    h1 { font-size: 3rem; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: #94a3b8; margin-top: 1rem; font-size: 1.2rem; }
    .btn { margin-top: 2rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <div class="hero">
    <div>
      <h1>مرحباً بك في مشروعي</h1>
      <p>تم بناؤه بواسطة منصة الوكيل الذكي</p>
      <button class="btn">ابدأ الآن</button>
    </div>
  </div>
</body>
</html>`,
  css: `/* Global Styles */
:root {
  --primary: #6366f1;
  --background: #0a0a0f;
  --foreground: #e2e8f0;
}

body {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  background: var(--background);
  color: var(--foreground);
}`,
  javascript: `// Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
  console.log('Project loaded!');
  
  // Add click handler to button
  const btn = document.querySelector('.btn');
  if (btn) {
    btn.addEventListener('click', () => {
      alert('مرحباً! تم النقر على الزر');
    });
  }
});`,
};

export default function LivePreviewPage() {
  const { lang, isRTL } = useLang();
  const tr = t(lang);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeFile, setActiveFile] = useState("index.html");
  const [code, setCode] = useState(SAMPLE_CODE.html);
  const [previewKey, setPreviewKey] = useState(0);
  const [history, setHistory] = useState<string[]>([SAMPLE_CODE.html]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const files = [
    { name: "index.html", lang: "html", code: SAMPLE_CODE.html },
    { name: "styles.css", lang: "css", code: SAMPLE_CODE.css },
    { name: "main.js", lang: "javascript", code: SAMPLE_CODE.javascript },
  ];

  const currentFile = files.find(f => f.name === activeFile) ?? files[0];

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    setCode(value);
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCode(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCode(history[historyIndex + 1]);
    }
  };

  const refreshPreview = () => {
    setPreviewKey(k => k + 1);
    toast.success(lang === "ar" ? "تم تحديث المعاينة" : "Preview refreshed");
  };

  const getPreviewContent = () => {
    if (activeFile === "index.html") return code;
    return `<html><body style="background:#0a0a0f;color:#e2e8f0;padding:1rem;font-family:monospace;"><pre>${code}</pre></body></html>`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">
            {lang === "ar" ? "محرر الكود + معاينة مباشرة" : "Code Editor + Live Preview"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIndex === 0}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIndex === history.length - 1}>
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-border" />
          {/* View Mode */}
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {(["desktop","tablet","mobile"] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "p-1 rounded-md transition-all",
                  viewMode === mode ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "desktop" && <Monitor className="w-4 h-4" />}
                {mode === "tablet" && <Tablet className="w-4 h-4" />}
                {mode === "mobile" && <Smartphone className="w-4 h-4" />}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refreshPreview}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content: Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col border-e border-border">
          {/* File Tabs */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30 overflow-x-auto">
            {files.map(file => (
              <button
                key={file.name}
                onClick={() => { setActiveFile(file.name); setCode(file.code); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all shrink-0",
                  activeFile === file.name
                    ? "bg-background text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", {
                  "bg-orange-400": file.lang === "html",
                  "bg-blue-400": file.lang === "css",
                  "bg-yellow-400": file.lang === "javascript",
                })} />
                {file.name}
              </button>
            ))}
          </div>
          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={currentFile.lang}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                lineNumbers: "on",
                renderLineHighlight: "line",
                smoothScrolling: true,
              }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col bg-muted/10">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card/30">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">{tr.preview.title}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {VIEW_SIZES[viewMode].label}
            </Badge>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/5">
            <div
              className="bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
              style={{ width: VIEW_SIZES[viewMode].width, minHeight: "400px" }}
            >
              <iframe
                key={previewKey}
                ref={iframeRef}
                srcDoc={getPreviewContent()}
                className="w-full h-full min-h-[500px] border-0"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
