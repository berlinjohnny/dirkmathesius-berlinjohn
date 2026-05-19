import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "de" | "en" | "fr" | "ru" | "es" | "zh" | "ja" | "pt" | "ar" | "it";

const detectLang = (): Lang => {
  const saved = localStorage.getItem("berlinike-lang") as Lang | null;
  if (saved) return saved;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  const map: Record<string, Lang> = {
    de: "de", en: "en", fr: "fr", ru: "ru", es: "es",
    zh: "zh", ja: "ja", pt: "pt", ar: "ar", it: "it",
  };
  return map[browser] || "en";
};

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export const UI: Record<string, Record<Lang, string>> = {
  tagline1:   { de: "Halb Dom. Halb Hinterhof.", en: "Half Cathedral. Half Backyard.", fr: "Mi-Cathédrale. Mi-Cour.", ru: "Полсобора. Полдвора.", es: "Mitad Catedral. Mitad Patio.", zh: "半教堂，半后院。", ja: "半大聖堂、半路地裏。", pt: "Meio Catedral. Meio Quintal.", ar: "نصف كاتدرائية. نصف حديقة.", it: "Metà Cattedrale. Metà Cortile." },
  tagline2:   { de: "Née à Berlin · Élevée au cœur de la ville", en: "Born in Berlin · Raised at its heart", fr: "Née à Berlin · Élevée au cœur", ru: "Рождена в Берлине · В сердце города", es: "Nacida en Berlín · En el corazón", zh: "生于柏林 · 长于城市之心", ja: "ベルリン生まれ · 街の中心で育つ", pt: "Nascida em Berlim · No coração da cidade", ar: "وُلدت في برلين · نشأت في قلبها", it: "Nata a Berlino · Cresciuta nel cuore" },
  cta:        { de: "Sprich mit BerliNike", en: "Speak with BerliNike", fr: "Parle avec BerliNike", ru: "Говори с Берлиникой", es: "Habla con BerliNike", zh: "与BerliNike交谈", ja: "ベルリニケと話す", pt: "Fale com BerliNike", ar: "تحدث مع برلينيكي", it: "Parla con BerliNike" },
  who:        { de: "Wer bin ick?", en: "Who am I?", fr: "Qui suis-je?", ru: "Кто я?", es: "¿Quién soy?", zh: "我是谁？", ja: "私は誰？", pt: "Quem sou eu?", ar: "من أنا؟", it: "Chi sono?" },
  voiceHint:  { de: "↑ Klick — ick begrüß dich persönlich", en: "↑ Click — I'll greet you personally", fr: "↑ Clique — je te salue", ru: "↑ Кликни — поздороваюсь лично", es: "↑ Clic — te saludo personalmente", zh: "↑ 点击 — 我亲自欢迎你", ja: "↑ クリック — 直接挨拶します", pt: "↑ Clique — vou te saudar", ar: "↑ انقر — سأرحب بك", it: "↑ Clicca — ti saluto" },
  chatTitle:  { de: "Schreib mir wat,", en: "Write to me,", fr: "Écris-moi,", ru: "Напиши мне,", es: "Escríbeme,", zh: "给我写点什么，", ja: "書いてみて、", pt: "Escreva para mim,", ar: "اكتب لي،", it: "Scrivimi," },
  chatSub:    { de: "ick antworte sofort.", en: "I'll reply instantly.", fr: "je réponds aussitôt.", ru: "я отвечу сразу.", es: "te respondo al instante.", zh: "我立刻回复。", ja: "すぐに返信します。", pt: "respondo na hora.", ar: "سأرد فوراً.", it: "rispondo subito." },
  chatHint:   { de: "Direkt. Echt. Goldene Berliner Schnauze.", en: "Direct. Real. Golden Berlin spirit.", fr: "Direct. Vrai. L'audace berlinoise dorée.", ru: "Прямо. Настоящее. Золотой берлинский дух.", es: "Directo. Real. Actitud berlinesa dorada.", zh: "直接。真实。金色柏林精神。", ja: "直接的。本物。黄金のベルリン気質。", pt: "Direto. Real. Atitude berlinense dourada.", ar: "مباشر. حقيقي. الروح الذهبية لبرلين.", it: "Diretto. Vero. L'audacia berlinese dorata." },
  placeholder:{ de: "Schreib wat...", en: "Write something...", fr: "Écris quelque chose...", ru: "Напиши что-нибудь...", es: "Escribe algo...", zh: "写点什么...", ja: "何か書いて...", pt: "Escreva algo...", ar: "اكتب شيئاً...", it: "Scrivi qualcosa..." },
  aboutTitle1:{ de: "Die goldene Nike", en: "The golden Nike", fr: "La Nike dorée", ru: "Золотая Ника", es: "La Nike dorada", zh: "金色的尼克", ja: "黄金のニケ", pt: "A Nike dourada", ar: "نايكي الذهبية", it: "La Nike dorata" },
  aboutTitle2:{ de: "vom Gendarmenmarkt", en: "of Gendarmenmarkt", fr: "du Gendarmenmarkt", ru: "с Жандарменмаркта", es: "del Gendarmenmarkt", zh: "宪兵市场的", ja: "ジャンダルメンマルクトの", pt: "do Gendarmenmarkt", ar: "من الجندرمنماركت", it: "del Gendarmenmarkt" },
  nikeSubtitle:{ de: "Deine goldene Nike vom Französischen Dom", en: "Your golden Nike from the French Cathedral", fr: "Ta Nike dorée de la Cathédrale Française", ru: "Твоя золотая Ника из Французского собора", es: "Tu Nike dorada de la Catedral Francesa", zh: "来自法国大教堂的金色尼克", ja: "フランス大聖堂の黄金のニケ", pt: "Tua Nike dourada da Catedral Francesa", ar: "نايكيك الذهبية من الكاتدرائية الفرنسية", it: "La tua Nike dorata dalla Cattedrale Francese" },
  nikePopup:  { de: "Sie hat jahrzehntelang geschwiegen.\nJetzt spricht sie endlich.", en: "She was silent for decades.\nNow she finally speaks.", fr: "Elle a gardé le silence des décennies.\nMaintenant elle parle enfin.", ru: "Она молчала десятилетиями.\nТеперь она наконец говорит.", es: "Guardó silencio durante décadas.\nAhora por fin habla.", zh: "她沉默了几十年。\n现在她终于开口了。", ja: "彼女は何十年も沈黙していた。\nついに、彼女が語り始めた。", pt: "Ela ficou em silêncio por décadas.\nAgora ela finalmente fala.", ar: "صمتت لعقود.\nالآن تتكلم أخيراً.", it: "Ha taciuto per decenni.\nOra finalmente parla." },
  navAbout:   { de: "Über mich", en: "About", fr: "À propos", ru: "Обо мне", es: "Sobre mí", zh: "关于我", ja: "について", pt: "Sobre mim", ar: "عني", it: "Chi sono" },
  navChat:    { de: "Schreib mir", en: "Talk to me", fr: "Écris-moi", ru: "Напиши мне", es: "Escríbeme", zh: "联系我", ja: "話しかけて", pt: "Fale comigo", ar: "اكتب لي", it: "Scrivimi" },
  navCta:     { de: "Lass uns reden", en: "Let's talk", fr: "Parlons", ru: "Поговорим", es: "Hablemos", zh: "让我们聊聊", ja: "話しましょう", pt: "Vamos conversar", ar: "لنتحدث", it: "Parliamo" },
};

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; }
const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("berlinike-lang", l); };
  const t = (key: string): string => UI[key]?.[lang] ?? UI[key]?.["en"] ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
};

export const useLang = () => useContext(Ctx);
