import { Download, Globe2, HelpCircle, History, Moon, Share2, Shuffle, Sun } from "lucide-react";
import { getTranslation, type Language } from "@/features/i18n";

export default function TopBar({
  dark,
  lang = "ZH",
  onHistory,
  onRandom,
  onShare,
  onLanguage,
  onHelp,
  onDownload,
  onTheme,
}: {
  dark: boolean;
  lang?: Language;
  onHistory: () => void;
  onRandom: () => void;
  onShare: () => void;
  onLanguage?: () => void;
  onHelp?: () => void;
  onDownload: () => void;
  onTheme: () => void;
}) {
  const t = getTranslation(lang);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon-mini">
          <svg viewBox="0 0 100 100" width="28" height="28">
            <rect width="100" height="100" rx="22" fill="#10b981" />
            <path d="M50 14 C50 14 74 38 74 62 A24 24 0 0 1 26 62 C26 38 50 14 50 14 Z" fill="#ffffff" />
            <circle cx="50" cy="52" r="7" fill="#10b981" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>
            QM <span>icon</span>
          </h1>
          <small>
            {lang === "ZH" ? "免注册 · 纯浏览器 · 14+ 平台" : "No Login · Browser Only · 14+ Platforms"}
          </small>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="btn ghost" onClick={onHistory} title={t.topbar.history}>
          <History size={13} />
          <span>{t.topbar.history}</span>
        </button>
        <button className="btn ghost" onClick={onRandom} title={t.topbar.random}>
          <Shuffle size={13} />
          <span>{t.topbar.random}</span>
        </button>
        <button className="btn ghost" onClick={onShare} title={t.topbar.share}>
          <Share2 size={13} />
          <span>{t.topbar.share}</span>
        </button>
        <button className="btn ghost icon-only" onClick={onLanguage} title={lang === "ZH" ? "Switch to English" : "切换为中文"}>
          <Globe2 size={13} />
          <span>{lang === "ZH" ? "EN" : "中"}</span>
        </button>
        <button className="btn ghost icon-only" onClick={onTheme} aria-label={t.topbar.theme} title={t.topbar.theme}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button className="btn ghost icon-only" onClick={onHelp} aria-label={t.topbar.help} title={t.topbar.help}>
          <HelpCircle size={14} />
        </button>
        <button className="btn primary" onClick={onDownload} title={t.topbar.download}>
          <Download size={13} />
          <span>{t.topbar.download}</span>
        </button>
      </div>
    </header>
  );
}
