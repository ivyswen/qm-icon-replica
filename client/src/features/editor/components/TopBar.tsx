import { Download, Globe2, HelpCircle, History, Moon, Share2, Shuffle, Sun, Zap } from "lucide-react";
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
      <div className="brand-lockup">
        <div className="brand-mark">
          <Zap size={16} fill="#f59e0b" color="#f59e0b" />
        </div>
        <div>
          <div className="brand-name">
            QM <span className="brand-highlight">icon</span>
          </div>
          <div className="brand-subtitle">
            {lang === "ZH" ? "免注册 · 纯浏览器 · 14+ 平台" : "No Login · Browser Only · 14+ Platforms"}
          </div>
        </div>
      </div>
      <div className="top-actions">
        <button onClick={onHistory} title={t.topbar.history}>
          <History size={13} />
          {t.topbar.history}
        </button>
        <button onClick={onRandom} title={t.topbar.random}>
          <Shuffle size={13} />
          {t.topbar.random}
        </button>
        <button onClick={onShare} title={t.topbar.share}>
          <Share2 size={13} />
          {t.topbar.share}
        </button>
        <button onClick={onLanguage} title={lang === "ZH" ? "Switch to English" : "切换为中文"}>
          <Globe2 size={13} />
          {lang === "ZH" ? "EN" : "中"}
        </button>
        <button onClick={onTheme} className="icon-only" aria-label={t.topbar.theme} title={t.topbar.theme}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button onClick={onHelp} className="icon-only" aria-label={t.topbar.help} title={t.topbar.help}>
          <HelpCircle size={14} />
        </button>
        <button className="download-btn" onClick={onDownload} title={t.topbar.download}>
          <Download size={13} />
          {t.topbar.download}
        </button>
      </div>
    </header>
  );
}
