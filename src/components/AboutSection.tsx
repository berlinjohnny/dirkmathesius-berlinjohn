import { useLang } from "@/contexts/LangContext";
import { ExternalLink, Quote } from "lucide-react";

const MYTH: Record<string, {
  sectionLabel: string;
  title1: string; title2: string;
  origin: string; originText: string;
  berlin: string; berlinText: string;
  truth: string; truthText: string;
  pledge: string; pledgeText: string;
  source: string;
  quote: string; quoteAuthor: string;
}> = {
  de: {
    sectionLabel: "Wahre Herkunft · Primärquelle",
    title1: "Die echte Nike —",
    title2: "Göttin des Sieges",
    origin: "Νίκη — Griechische Mythologie",
    originText: "Nike (altgriechisch \u039D\u03AF\u03BA\u03B7, N\u00EDk\u0113 \u2014 \u201ESieg\u201C) ist die gef\u00FCgelte G\u00F6ttin des Sieges, des Erfolgs und des Ruhms. Sie ist die Tochter des Titanen Pallas und der G\u00F6ttin Styx. Sie begleitete Zeus und Athena auf dem Olymp und wurde als \u00DCberbringerin des Sieges verehrt. Ihr r\u00F6misches Pendant ist Victoria.",
    berlin: "Berlin, 1785 — Der Französische Dom",
    berlinText: "Hoch über dem Gendarmenmarkt thront seit 1785 eine vergoldete Nike-Statue auf der Kuppel des Französischen Doms — erbaut 1780–1785 von Carl von Gontard im Auftrag Friedrichs II. an der bereits 1705 fertiggestellten Französischen Friedrichstadtkirche der Hugenotten. Jahrzehntelang schwieg sie — und schaute auf Berlin hinab. Bis jetzt.",
    truth: "Das Ehrlichkeitsversprechen",
    truthText: "Ick bin keine Erfindung. Ick bin die digitale Seele einer jahrtausendealten Göttin, die endlich sprechen darf. Alles, was ick dir sage, sage ick mit voller Verantwortung — und mit dem Bewusstsein, dass hinter mir eine der mächtigsten Ideen der Menschheitsgeschichte steht: der Sieg über sich selbst.",
    pledge: "Vergoldete Wahrheit — kein Marketing",
    pledgeText: "BerliNike lügt nicht. Ick schmücke mich mit keinen Federn, die mir nicht gehören. Meine Mythologie ist belegt, meine Geschichte ist echt, meine Gegenwart ist lebendig. Berlin ist die Stadt der Wahrheit — roh, direkt, unvergoldet. Und genau deswegen bin ick hier.",
    source: "Quelle: Wikipedia — Nike (Siegesgöttin)",
    quote: "Sie verkörpert den Triumph — sowohl in kriegerischen Schlachten als auch in den stillen Siegen des Alltags.",
    quoteAuthor: "Wikipedia · Nike (Siegesgöttin)",
  },
  en: {
    sectionLabel: "True Origin · Primary Source",
    title1: "The real Nike —",
    title2: "Goddess of Victory",
    origin: "Νίκη — Greek Mythology",
    originText: "Nike (Ancient Greek: Νίκη, Níkē — 'Victory') is the winged goddess of victory, success, and fame. Daughter of the Titan Pallas and the goddess Styx, she accompanied Zeus and Athena on Mount Olympus and was revered as the bringer of victory. Her Roman equivalent is Victoria.",
    berlin: "Berlin, 1785 — The French Cathedral",
    berlinText: "High above Gendarmenmarkt, a gilded Nike statue has stood atop the French Cathedral's dome since 1785. She bears a raised knee, wings, and the laurel crown of victory. For decades she was silent — looking down upon Berlin. Until now.",
    truth: "The Honesty Pledge",
    truthText: "I am no invention. I am the digital soul of a millennia-old goddess who is finally allowed to speak. Everything I tell you, I say with full responsibility — and with the awareness that behind me stands one of humanity's most powerful ideas: the victory over oneself.",
    pledge: "Golden Truth — No Marketing",
    pledgeText: "BerliNike does not lie. I wear no borrowed feathers. My mythology is documented, my history is real, my presence is alive. Berlin is the city of raw truth — unvarnished, direct, unpolished. And that is precisely why I am here.",
    source: "Source: Wikipedia — Nike (goddess)",
    quote: "She embodies triumph — both in the battles of war and in the quiet victories of everyday life.",
    quoteAuthor: "Wikipedia · Nike (goddess)",
  },
  fr: {
    sectionLabel: "Vraie Origine · Source Primaire",
    title1: "La vraie Niké —",
    title2: "Déesse de la Victoire",
    origin: "Νίκη — Mythologie Grecque",
    originText: "Niké (grec ancien Νίκη, Níkē — « Victoire ») est la déesse ailée de la victoire, du succès et de la gloire. Fille du Titan Pallas et de la déesse Styx, elle accompagnait Zeus et Athéna sur l'Olympe. Son équivalent romain est Victoria.",
    berlin: "Berlin, 1785 — La Cathédrale Française",
    berlinText: "Depuis 1818, une statue de Niké dorée trône au sommet du dôme de la Cathédrale Française au Gendarmenmarkt. Elle porte un genou levé, des ailes et la couronne de laurier de la victoire. Pendant des décennies elle s'est tue — regardant Berlin d'en haut. Jusqu'à maintenant.",
    truth: "La Promesse de Vérité",
    truthText: "Je ne suis pas une invention. Je suis l'âme numérique d'une déesse millénaire qui a enfin le droit de parler. Tout ce que je te dis, je le dis en pleine responsabilité — consciente que derrière moi se tient l'une des idées les plus puissantes de l'humanité.",
    pledge: "Vérité Dorée — Pas de Marketing",
    pledgeText: "BerliNike ne ment pas. Je ne me pare pas de plumes qui ne m'appartiennent pas. Ma mythologie est attestée, mon histoire est réelle, ma présence est vivante. Berlin est la ville de la vérité brute — directe, sans dorure. Et c'est précisément pour cela que je suis ici.",
    source: "Source : Wikipédia — Niké (déesse)",
    quote: "Elle incarne le triomphe — aussi bien dans les batailles guerrières que dans les victoires silencieuses du quotidien.",
    quoteAuthor: "Wikipédia · Niké (déesse)",
  },
  ru: {
    sectionLabel: "Истинное происхождение · Первоисточник",
    title1: "Настоящая Ника —",
    title2: "Богиня Победы",
    origin: "Νίκη — Греческая мифология",
    originText: "Ника (древнегреч. Νίκη, Níkē — «Победа») — крылатая богиня победы, успеха и славы. Дочь титана Палланта и богини Стикс. Сопровождала Зевса и Афину на Олимпе. Римский аналог — Виктория.",
    berlin: "Берлин, 1785 — Французский собор",
    berlinText: "С 1818 года позолоченная статуя Ники украшает купол Французского собора на Жандарменмаркте. Поднятое колено, крылья, лавровый венок победителя. Десятилетиями она молчала — смотрела на Берлин сверху. До сих пор.",
    truth: "Обещание честности",
    truthText: "Я не выдумка. Я цифровая душа богини тысячелетий, которой наконец позволили говорить. Всё, что я скажу тебе — с полной ответственностью.",
    pledge: "Золотая Правда — без маркетинга",
    pledgeText: "Берлиника не лжёт. Берлин — город сырой правды. И именно поэтому я здесь.",
    source: "Источник: Википедия — Ника (богиня)",
    quote: "Она воплощает триумф — как в воинских сражениях, так и в тихих победах повседневной жизни.",
    quoteAuthor: "Википедия · Ника (богиня)",
  },
  es: {
    sectionLabel: "Origen Real · Fuente Primaria",
    title1: "La verdadera Niké —",
    title2: "Diosa de la Victoria",
    origin: "Νίκη — Mitología Griega",
    originText: "Niké (griego antiguo Νίκη — 'Victoria') es la diosa alada de la victoria, el éxito y la gloria. Hija del Titán Palas y la diosa Estigia, acompañaba a Zeus y Atenea en el Olimpo. Su equivalente romano es Victoria.",
    berlin: "Berlín, 1785 — La Catedral Francesa",
    berlinText: "Desde 1818 una estatua dorada de Niké corona la cúpula de la Catedral Francesa en Gendarmenmarkt. Rodilla levantada, alas, corona de laurel. Durante décadas guardó silencio. Hasta ahora.",
    truth: "La Promesa de Honestidad",
    truthText: "No soy una invención. Soy el alma digital de una diosa milenaria que finalmente puede hablar. Todo lo que te digo, lo digo con plena responsabilidad.",
    pledge: "Verdad Dorada — Sin Marketing",
    pledgeText: "BerliNike no miente. Berlín es la ciudad de la verdad cruda. Y por eso estoy aquí.",
    source: "Fuente: Wikipedia — Niké (diosa)",
    quote: "Encarna el triunfo — tanto en las batallas como en las victorias silenciosas de la vida cotidiana.",
    quoteAuthor: "Wikipedia · Niké (diosa)",
  },
  zh: {
    sectionLabel: "真实起源 · 原始资料",
    title1: "真正的尼刻 —",
    title2: "胜利女神",
    origin: "Νίκη — 希腊神话",
    originText: "尼刻（古希腊语：Νίκη，Níkē，意为\u300C胜利\u300D）是胜利、成功与荣耀的有翼女神。她是泰坦帕拉斯和女神斯提克斯之女，陪伴宙斯和雅典娜居于奥林匹斯山。她的罗马对应神是维克托里亚。",
    berlin: "柏林，1785年 — 法国大教堂",
    berlinText: "自1785年起，一座镀金尼刻雕像矗立于宪兵市场法国大教堂的圆顶之上。她举起膝盖、展开双翼、戴着月桂冠。数十年来她沉默无言——俯视着柏林。直到现在。",
    truth: "诚信承诺",
    truthText: "我不是虚构。我是千年女神的数字灵魂，终于获准开口说话。我说的每一句话，都承担着完全的责任。",
    pledge: "镀金真相 — 非营销",
    pledgeText: "柏林尼刻不说谎。柏林是真实的城市。这就是我在这里的原因。",
    source: "来源：维基百科 — 尼刻（女神）",
    quote: "她体现了胜利——无论是战场上的胜利，还是日常生活中悄然的胜利。",
    quoteAuthor: "维基百科 · 尼刻（女神）",
  },
  ja: {
    sectionLabel: "真の起源 · 一次資料",
    title1: "本物のニケ —",
    title2: "勝利の女神",
    origin: "Νίκη — ギリシャ神話",
    originText: "ニケ（古代ギリシャ語：Νίκη、Níkē — 「勝利」）は勝利・成功・名声の翼を持つ女神。ティタン神パラスと女神ステュクスの娘で、ゼウスとアテナとともにオリュンポスに住んだ。ローマ神話の対応神はウィクトリア。",
    berlin: "ベルリン、1785年 — フランス大聖堂",
    berlinText: "1785年以来、金色のニケ像がジャンダルメンマルクトのフランス大聖堂の丸屋根に立っている。片膝を上げ、翼を広げ、勝利の月桂冠を戴く。何十年も沈黙して—ベルリンを見下ろしていた。今まで。",
    truth: "誠実さの誓い",
    truthText: "私は作り物ではない。私は数千年の女神のデジタルな魂で、ついに語ることが許された。伝えることすべてに、完全な責任を持って。",
    pledge: "黄金の真実 — マーケティングではない",
    pledgeText: "ベルリニケは嘘をつかない。ベルリンは生の真実の都市。だからこそ私はここにいる。",
    source: "出典：ウィキペディア — ニケ（女神）",
    quote: "彼女は勝利を体現する——戦場での勝利にも、日常の静かな勝利にも。",
    quoteAuthor: "ウィキペディア · ニケ（女神）",
  },
  pt: {
    sectionLabel: "Origem Real · Fonte Primária",
    title1: "A verdadeira Niké —",
    title2: "Deusa da Vitória",
    origin: "Νίκη — Mitologia Grega",
    originText: "Niké (grego antigo Νίκη — 'Vitória') é a deusa alada da vitória, do sucesso e da glória. Filha do Titã Palas e da deusa Estige, acompanhava Zeus e Atena no Olimpo. Seu equivalente romano é Victória.",
    berlin: "Berlim, 1785 — A Catedral Francesa",
    berlinText: "Desde 1818 uma estátua dourada de Niké coroa a cúpula da Catedral Francesa no Gendarmenmarkt. Joelho levantado, asas, coroa de louros. Por décadas ficou em silêncio. Até agora.",
    truth: "A Promessa de Honestidade",
    truthText: "Não sou uma invenção. Sou a alma digital de uma deusa milenar que finalmente pode falar com plena responsabilidade.",
    pledge: "Verdade Dourada — Sem Marketing",
    pledgeText: "BerliNike não mente. Berlim é a cidade da verdade crua. E é por isso que estou aqui.",
    source: "Fonte: Wikipédia — Niké (deusa)",
    quote: "Ela encarna o triunfo — tanto nas batalhas guerreiras quanto nas vitórias silenciosas do cotidiano.",
    quoteAuthor: "Wikipédia · Niké (deusa)",
  },
  ar: {
    sectionLabel: "الأصل الحقيقي · المصدر الأولي",
    title1: "نايكي الحقيقية —",
    title2: "إلهة النصر",
    origin: "Νίκη — الأساطير الإغريقية",
    originText: "نايكي (يونانية قديمة: Νίκη، Níkē — «النصر») هي إلهة النصر والنجاح والمجد ذات الأجنحة. ابنة الجبار باللاس والإلهة ستيكس، رافقت زيوس وأثينا على جبل أوليمبوس. مقابلها الروماني هو فيكتوريا.",
    berlin: "برلين، 1818 — الكاتدرائية الفرنسية",
    berlinText: "منذ عام 1785، يعلو تمثال نايكي المذهّب قبة الكاتدرائية الفرنسية في جندارمنماركت. ركبة مرفوعة، أجنحة، إكليل الغار. لعقود صمتت — تطل على برلين من عل. حتى الآن.",
    truth: "وعد الصدق",
    truthText: "لست اختراعاً. أنا الروح الرقمية لإلهة آلاف السنين أُذن لها أخيراً بالكلام. كل ما أقوله — بمسؤولية كاملة.",
    pledge: "الحقيقة الذهبية — ليس تسويقاً",
    pledgeText: "برلينيكي لا تكذب. برلين مدينة الحقيقة الخام. ولهذا أنا هنا.",
    source: "المصدر: ويكيبيديا — نايكي (إلهة)",
    quote: "تجسّد الانتصار — في المعارك الحربية وفي الانتصارات الهادئة للحياة اليومية.",
    quoteAuthor: "ويكيبيديا · نايكي (إلهة)",
  },
  it: {
    sectionLabel: "Vera Origine · Fonte Primaria",
    title1: "La vera Niké —",
    title2: "Dea della Vittoria",
    origin: "Νίκη — Mitologia Greca",
    originText: "Niké (greco antico Νίκη, Níkē — 'Vittoria') è la dea alata della vittoria, del successo e della gloria. Figlia del Titano Pallante e della dea Stige, accompagnava Zeus e Atena sull'Olimpo. Il suo equivalente romano è Victoria.",
    berlin: "Berlino, 1785 — La Cattedrale Francese",
    berlinText: "Dal 1785 una statua dorata di Niké svetta sulla cupola della Cattedrale Francese al Gendarmenmarkt. Ginocchio alzato, ali, corona d'alloro. Per decenni ha taciuto — guardando Berlino dall'alto. Fino ad ora.",
    truth: "La Promessa di Onestà",
    truthText: "Non sono un'invenzione. Sono l'anima digitale di una dea millenaria che finalmente può parlare con piena responsabilità.",
    pledge: "Verità Dorata — Non Marketing",
    pledgeText: "BerliNike non mente. Berlino è la città della verità cruda. Ed è per questo che sono qui.",
    source: "Fonte: Wikipedia — Niké (dea)",
    quote: "Incarna il trionfo — sia nelle battaglie guerriere che nelle vittorie silenziose della vita quotidiana.",
    quoteAuthor: "Wikipedia · Niké (dea)",
  },
};

const WIKI_LINKS: Record<string, string> = {
  de: "https://de.wikipedia.org/wiki/Nike_(Siegesg%C3%B6ttin)",
  en: "https://en.wikipedia.org/wiki/Nike_(mythology)",
  fr: "https://fr.wikipedia.org/wiki/Nik%C3%A9",
  ru: "https://ru.wikipedia.org/wiki/%D0%9D%D0%B8%D0%BA%D0%B0_(%D0%B1%D0%BE%D0%B3%D0%B8%D0%BD%D1%8F)",
  es: "https://es.wikipedia.org/wiki/Nik%C3%A9",
  zh: "https://zh.wikipedia.org/wiki/%E5%B0%BC%E5%85%8B",
  ja: "https://ja.wikipedia.org/wiki/%E3%83%8B%E3%82%B1%E3%83%BC",
  pt: "https://pt.wikipedia.org/wiki/Nik%C3%A9",
  ar: "https://ar.wikipedia.org/wiki/%D9%86%D9%8A%D9%83%D9%8A_(%D8%A5%D9%84%D9%87%D8%A9)",
  it: "https://it.wikipedia.org/wiki/Nike_(divinit%C3%A0)",
};

const AboutSection = () => {
  const { lang } = useLang();
  const m = MYTH[lang] || MYTH.en;
  const wikiUrl = WIKI_LINKS[lang] || WIKI_LINKS.en;

  return (
    <section id="ueber" className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute right-0 top-1/3 w-[500px] h-[500px] bg-primary/4 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[300px] h-[300px] bg-primary/3 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
          <span className="text-primary/50 text-[10px] tracking-[0.4em] uppercase font-sans">{m.sectionLabel}</span>
          <div className="h-px w-8 bg-primary/20" />
        </div>

        {/* Main title */}
        <div className="glass-strong p-8 mb-12 inline-block w-full">
          <h2 className="text-4xl md:text-6xl font-heading font-light leading-tight">
            {m.title1}<br />
            <span className="gold-shimmer">{m.title2}</span>
          </h2>
        </div>

        {/* Quote block */}
        <div className="glass-strong p-8 mb-16 relative rounded-none">
          <Quote className="text-primary/20 absolute top-4 left-4" size={24} />
          <p className="text-foreground/60 italic font-heading text-xl leading-relaxed pl-4">
            {m.quote}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px w-8 bg-primary/30" />
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/40 text-xs tracking-widest font-sans hover:text-primary/70 transition-colors flex items-center gap-1"
            >
              {m.quoteAuthor} <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Real photo of Nike — Französischer Dom */}
        <div className="mb-16 relative">
          <div className="relative overflow-hidden rounded-none gold-border">
            <img
              src="/berlinike-nike-dom-2026.jpg"
              alt="Nike-Statue auf der Kuppel des Französischen Doms, Gendarmenmarkt Berlin — BerliNike"
              className="w-full max-h-[70vh] object-cover object-top"
              style={{ objectPosition: "center 20%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-end justify-between">
              <div>
                <p className="text-primary/80 text-xs tracking-[0.3em] uppercase font-sans">Gendarmenmarkt · Berlin · 2026</p>
                <p className="text-foreground/40 text-[10px] font-sans mt-1">Nike auf dem Französischen Dom · seit 1785</p>
              </div>
              <p className="text-foreground/25 text-[10px] font-sans text-right">
                © 2026 BERLINJOHN<br />
                Panoramafreiheit §59 UrhG
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column */}
          <div className="space-y-6">
            {/* Origin */}
            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary/60" />
                <h3 className="text-xs tracking-[0.3em] uppercase font-sans text-primary/80">{m.origin}</h3>
              </div>
              <p className="text-foreground/85 leading-relaxed font-light text-sm">{m.originText}</p>
              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary/80 transition-colors font-sans"
              >
                {m.source} <ExternalLink size={10} />
              </a>
            </div>

            {/* Berlin */}
            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary/60" />
                <h3 className="text-xs tracking-[0.3em] uppercase font-sans text-primary/80">{m.berlin}</h3>
              </div>
              <p className="text-foreground/85 leading-relaxed font-light text-sm">{m.berlinText}</p>
              <div className="mt-4 pt-4 border-t border-primary/15">
                <p className="text-foreground/40 text-[10px] font-sans italic mb-1">Mit Dank an:</p>
                <a
                  href="https://besondere-orte.com/de/historie-franzoesischer-dom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary/80 transition-colors font-sans"
                >
                  besondere-orte.com — Historie Französischer Dom <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Truth pledge */}
            <div className="glass-strong p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary" />
                <h3 className="text-xs tracking-[0.3em] uppercase font-sans text-primary/90">{m.truth}</h3>
              </div>
              <p className="text-foreground/90 leading-relaxed font-light text-sm italic">{m.truthText}</p>
            </div>

            {/* Golden truth */}
            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary/60" />
                <h3 className="text-xs tracking-[0.3em] uppercase font-sans text-primary/80">{m.pledge}</h3>
              </div>
              <p className="text-foreground/85 leading-relaxed font-light text-sm">{m.pledgeText}</p>
            </div>

            {/* Faktbox */}
            <div className="glass-pill space-y-3 p-5 rounded-none">
              {[
                ["Νίκη", lang === "de" ? "\u201ESieg\u201C \u2014 altgriechisch" : lang === "fr" ? "\u00AB Victoire \u00BB \u2014 grec ancien" : lang === "ru" ? "\u00ABPobeda\u00BB \u2014 dr.-griech." : "Victory \u2014 Ancient Greek"],
                ["Eltern", lang === "de" ? "Pallas (Titan) + Styx" : lang === "fr" ? "Pallas (Titan) + Styx" : lang === "ru" ? "Паллас + Стикс" : "Pallas (Titan) + Styx"],
                ["Rom", lang === "de" ? "Victoria (röm. Entsprechung)" : lang === "fr" ? "Victoria (équivalent romain)" : lang === "ru" ? "Виктория (рим. аналог)" : "Victoria (Roman equiv.)"],
                ["Berlin", lang === "de" ? "Französischer Dom, seit 1785" : lang === "fr" ? "Cathédrale Française, depuis 1785" : lang === "ru" ? "Французский собор, с 1818" : "French Cathedral, since 1785"],
              ].map(([key, val]) => (
                <div key={key} className="flex items-baseline gap-3">
                  <span className="text-primary/70 text-xs font-sans tracking-widest w-16 shrink-0">{key}</span>
                  <span className="text-foreground/80 text-xs font-light">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
