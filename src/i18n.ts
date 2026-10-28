/**
 * Zero-dependency i18n for tokigen.gg.
 *
 * Markup hooks:
 *   data-i18n="key"                 -> sets textContent
 *   data-i18n-attr="attr:key;attr2:key2" -> sets attributes (aria-label, alt, title, ...)
 *
 * Language resolution order: ?lang= -> localStorage -> navigator.languages -> 'en'.
 * NOTE: pt-BR and ja copy should be reviewed by native speakers before launch.
 */

export const LANGS = ['en', 'pt-BR', 'ja'] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = 'tokigen_lang';

type Dict = Record<string, string>;

const en: Dict = {
  'meta.title.home': 'tokigen.gg — Create a world. Write the rules. Bring your friends!',
  'meta.title.studio': 'Web Studio (under construction) — tokigen.gg',
  'meta.description':
    'The tokigen client is your home to create, share, and join living multiplayer games. Create a world. Write the rules. Bring your friends!',

  'nav.skip': 'Skip to content',
  'nav.label': 'Primary',
  'nav.menu': 'Menu',
  'nav.showcase': 'Showcase',
  'nav.how': 'How it works',
  'nav.download': 'Download',
  'nav.studio': 'Web Studio',
  'nav.discord': 'Discord',
  'nav.language': 'Language',
  'common.soon': 'Coming soon',
  'theme.toDark': 'Switch to dark theme',
  'theme.toLight': 'Switch to light theme',
  'brand.home': 'tokigen.gg home',

  'hero.eyebrow': 'AI-native multiplayer game creation',
  'hero.line1': 'Create a world.',
  'hero.line2': 'Write the rules.',
  'hero.line3': 'Bring your friends!',
  'hero.lead':
    'The tokigen client is your home to create custom games, share room codes, and jump into living multiplayer worlds with your friends.',
  'hero.cta': 'Get Started Now',
  'hero.secondary': 'Watch showcase',
  'hero.stampLabel': 'Kigen — origin',

  'how.eyebrow': 'How it works',
  'how.title': 'From idea to game night',
  'how.sub':
    'An open-source client, our own generative systems and multiplayer servers — three pillars working together.',
  'how.client.title': 'Open-source client',
  'how.client.body':
    'The tokigen client is built on Godot Engine 4 and open-source tech like Jolt Physics, Terrain3D, and LimboAI (MIT). Use it to create games with AI, share room codes, and join your friends.',
  'how.gen.title': 'Custom generative systems',
  'how.gen.body':
    'Describe it in your own words. Our generative pipeline designs the game, builds the world procedurally, play-tests it with AI bots and packages it for the launcher.',
  'how.gen.chip1': 'Game design',
  'how.gen.chip2': 'Procedural worlds',
  'how.gen.chip3': 'Bot play-testing',
  'how.mp.title': 'Multiplayer servers',
  'how.mp.body':
    'Every game gets its own server. Share a room code and your friends are in within seconds — servers sleep when nobody is playing and wake on demand.',
  'how.mp.chip1': 'Room codes',
  'how.mp.chip2': 'Scale to zero',
  'how.mp.chip3': 'Rust servers',

  'templates.title': 'Start from a template',
  'templates.sub': 'Six starter templates with multiplayer netcode and native physics already wired in.',
  'templates.rpg.name': 'Action RPG',
  'templates.rpg.body': 'Third-person action with elemental powers and boss fights.',
  'templates.sandbox.name': 'Sandbox RPG',
  'templates.sandbox.body': 'Tick-based open world of skills, trading and adventure.',
  'templates.voxel.name': 'Voxel survival',
  'templates.voxel.body': 'Dig, craft and terraform a world made of blocks.',
  'templates.strategy.name': '4X strategy',
  'templates.strategy.body': 'Explore, expand, exploit and exterminate on a hex map.',
  'templates.arena.name': 'Arena shooter',
  'templates.arena.body': '60 Hz competitive FPS with rollback netcode.',
  'templates.tycoon.name': 'Tycoon & racer',
  'templates.tycoon.body': 'Collect, upgrade, then race on tracks you build.',

  'showcase.eyebrow': 'Showcase',
  'showcase.title': 'One prompt. One playable world.',
  'showcase.sub':
    'Our Fire Rig demo started life as this prompt. The video is recorded straight from the tokigen launcher.',
  'showcase.promptLabel': 'Your prompt',
  'showcase.prompt':
    'Build a prison break on a boiling iron rig out at sea. I want to bend metal from the coal vents into a shield, then take down the Fire Warden boss with my friends.',
  'showcase.step1': 'Designed',
  'showcase.step2': 'World built',
  'showcase.step3': 'Bot-tested',
  'showcase.step4': 'Ready to play',
  'showcase.resultLabel': 'Result: Rigbreak — The Boiling Iron',
  'showcase.videoLabel': 'Gameplay recorded in the tokigen launcher',

  'download.eyebrow': 'Download',
  'download.title': 'Get the tokigen launcher',
  'download.sub': 'Free. Install once to create games, share room codes, and join your friends.',
  'download.recommended': 'Recommended',
  'download.button': 'Download',
  'download.win.meta': 'Windows 10 / 11 · 64-bit',
  'download.mac.meta': 'Apple silicon & Intel',
  'download.linux.meta': 'x86_64 · Steam Deck',
  'download.note': 'Got a room code from a friend? Open the launcher and type it in.',

  'community.title': 'Join the community',
  'community.body': 'Share your games, find players and help shape tokigen.',

  'footer.tagline': 'Create a world. Write the rules. Bring your friends!',
  'footer.credit': 'Built with Godot Engine and open source.',

  'studio.eyebrow': 'Web Studio',
  'studio.title': 'Under construction',
  'studio.body':
    'Soon you will be able to browse screenshots of your games and inspect their 3D assets right from your browser.',
  'studio.feature1.title': 'Game gallery',
  'studio.feature1.body': 'Screenshots and clips captured from every build of your games.',
  'studio.feature2.title': '3D asset viewer',
  'studio.feature2.body': 'Spin, inspect and share the models generated for your worlds.',
  'studio.feature3.title': 'Share pages',
  'studio.feature3.body': 'A link your friends can open to see your game and grab the launcher.',
  'studio.cta': 'Get the launcher',
  'studio.back': 'Back to home',
  'studio.stampLabel': 'Under construction',
};

const ptBR: Dict = {
  'meta.title.home': 'tokigen.gg — Crie um mundo. Escreva as regras. Traga seus amigos!',
  'meta.title.studio': 'Estúdio Web (em construção) — tokigen.gg',
  'meta.description':
    'O cliente tokigen é o seu lugar para criar, compartilhar e jogar mundos multiplayer vivos. Crie um mundo. Escreva as regras. Traga seus amigos!',

  'nav.skip': 'Pular para o conteúdo',
  'nav.label': 'Principal',
  'nav.menu': 'Menu',
  'nav.showcase': 'Vitrine',
  'nav.how': 'Como funciona',
  'nav.download': 'Baixar',
  'nav.studio': 'Estúdio Web',
  'nav.discord': 'Discord',
  'nav.language': 'Idioma',
  'common.soon': 'Em breve',
  'theme.toDark': 'Mudar para o tema escuro',
  'theme.toLight': 'Mudar para o tema claro',
  'brand.home': 'Página inicial do tokigen.gg',

  'hero.eyebrow': 'Criação de jogos multiplayer com IA',
  'hero.line1': 'Crie um mundo.',
  'hero.line2': 'Escreva as regras.',
  'hero.line3': 'Traga seus amigos!',
  'hero.lead':
    'O cliente tokigen é o seu lugar para criar jogos personalizados, compartilhar códigos de sala e jogar mundos multiplayer vivos com seus amigos.',
  'hero.cta': 'Comece agora',
  'hero.secondary': 'Ver vitrine',
  'hero.stampLabel': 'Kigen — origem',

  'how.eyebrow': 'Como funciona',
  'how.title': 'Da ideia à noite de jogo',
  'how.sub':
    'Um cliente de código aberto, sistemas generativos próprios e servidores multiplayer — três pilares trabalhando juntos.',
  'how.client.title': 'Cliente de código aberto',
  'how.client.body':
    'O cliente tokigen é construído sobre o Godot Engine 4 e tecnologias abertas como Jolt Physics, Terrain3D e LimboAI (MIT). Use-o para criar jogos com IA, compartilhar códigos e entrar com a galera.',
  'how.gen.title': 'Sistemas generativos próprios',
  'how.gen.body':
    'Descreva com suas palavras. Nosso pipeline generativo projeta o jogo, constrói o mundo de forma procedural, testa tudo com bots de IA e empacota para o launcher.',
  'how.gen.chip1': 'Game design',
  'how.gen.chip2': 'Mundos procedurais',
  'how.gen.chip3': 'Testes com bots',
  'how.mp.title': 'Servidores multiplayer',
  'how.mp.body':
    'Cada jogo ganha seu próprio servidor. Compartilhe um código de sala e seus amigos entram em segundos — os servidores dormem quando ninguém está jogando e acordam na hora.',
  'how.mp.chip1': 'Códigos de sala',
  'how.mp.chip2': 'Escala até zero',
  'how.mp.chip3': 'Servidores em Rust',

  'templates.title': 'Comece com um modelo',
  'templates.sub': 'Seis modelos iniciais com rede multiplayer e física nativa já integradas.',
  'templates.rpg.name': 'RPG de ação',
  'templates.rpg.body': 'Ação em terceira pessoa com poderes elementais e chefões.',
  'templates.sandbox.name': 'RPG sandbox',
  'templates.sandbox.body': 'Mundo aberto por ticks com habilidades, comércio e aventura.',
  'templates.voxel.name': 'Sobrevivência voxel',
  'templates.voxel.body': 'Cave, construa e transforme um mundo feito de blocos.',
  'templates.strategy.name': 'Estratégia 4X',
  'templates.strategy.body': 'Explore, expanda, explore recursos e conquiste num mapa hexagonal.',
  'templates.arena.name': 'Arena de tiro',
  'templates.arena.body': 'FPS competitivo a 60 Hz com netcode de rollback.',
  'templates.tycoon.name': 'Tycoon e corrida',
  'templates.tycoon.body': 'Colecione, evolua e corra em pistas criadas por você.',

  'showcase.eyebrow': 'Vitrine',
  'showcase.title': 'Um prompt. Um mundo jogável.',
  'showcase.sub':
    'Nossa demo do Fire Rig nasceu deste prompt. O vídeo foi gravado direto no launcher do tokigen.',
  'showcase.promptLabel': 'Seu prompt',
  'showcase.prompt':
    'Crie uma fuga de prisão numa plataforma de ferro fervente no meio do mar. Quero dobrar o metal das saídas de carvão para fazer um escudo e derrotar o chefão Guardião de Fogo com meus amigos.',
  'showcase.step1': 'Projetado',
  'showcase.step2': 'Mundo construído',
  'showcase.step3': 'Testado por bots',
  'showcase.step4': 'Pronto para jogar',
  'showcase.resultLabel': 'Resultado: Rigbreak — The Boiling Iron',
  'showcase.videoLabel': 'Gameplay gravado no launcher do tokigen',

  'download.eyebrow': 'Baixar',
  'download.title': 'Baixe o launcher do tokigen',
  'download.sub': 'Grátis. Instale uma vez para criar jogos, compartilhar códigos de sala e jogar com amigos.',
  'download.recommended': 'Recomendado',
  'download.button': 'Baixar',
  'download.win.meta': 'Windows 10 / 11 · 64 bits',
  'download.mac.meta': 'Apple Silicon e Intel',
  'download.linux.meta': 'x86_64 · Steam Deck',
  'download.note': 'Recebeu um código de sala de um amigo? Abra o launcher e digite o código.',

  'community.title': 'Entre na comunidade',
  'community.body': 'Compartilhe seus jogos, encontre jogadores e ajude a moldar o tokigen.',

  'footer.tagline': 'Crie um mundo. Escreva as regras. Traga seus amigos!',
  'footer.credit': 'Feito com Godot Engine e código aberto.',

  'studio.eyebrow': 'Estúdio Web',
  'studio.title': 'Em construção',
  'studio.body':
    'Em breve você poderá ver capturas de tela dos seus jogos e explorar os assets 3D direto do navegador.',
  'studio.feature1.title': 'Galeria de jogos',
  'studio.feature1.body': 'Capturas e clipes de cada build dos seus jogos.',
  'studio.feature2.title': 'Visualizador 3D',
  'studio.feature2.body': 'Gire, inspecione e compartilhe os modelos gerados para seus mundos.',
  'studio.feature3.title': 'Páginas para compartilhar',
  'studio.feature3.body': 'Um link para seus amigos verem seu jogo e baixarem o launcher.',
  'studio.cta': 'Baixar o launcher',
  'studio.back': 'Voltar ao início',
  'studio.stampLabel': 'Em construção',
};

const ja: Dict = {
  'meta.title.home': 'tokigen.gg — 世界を創る。ルールを書く。仲間を呼ぼう！',
  'meta.title.studio': 'Webスタジオ（工事中）— tokigen.gg',
  'meta.description':
    'tokigenクライアントは、マルチプレイヤーゲームを創り、共有し、参加できるプラットフォームです。世界を創る。ルールを書く。仲間を呼ぼう！',

  'nav.skip': '本文へスキップ',
  'nav.label': 'メインメニュー',
  'nav.menu': 'メニュー',
  'nav.showcase': 'ショーケース',
  'nav.how': '仕組み',
  'nav.download': 'ダウンロード',
  'nav.studio': 'Webスタジオ',
  'nav.discord': 'Discord',
  'nav.language': '言語',
  'common.soon': '近日公開',
  'theme.toDark': 'ダークテーマに切り替え',
  'theme.toLight': 'ライトテーマに切り替え',
  'brand.home': 'tokigen.gg ホーム',

  'hero.eyebrow': 'AIネイティブなマルチプレイヤーゲーム制作',
  'hero.line1': '世界を創る。',
  'hero.line2': 'ルールを書く。',
  'hero.line3': '仲間を呼ぼう！',
  'hero.lead':
    'tokigenクライアントは、AIと共に独自のゲームを創り、ルームコードで共有し、友達とマルチプレイヤーの世界へ飛び込めるオールインワン環境です。',
  'hero.cta': '今すぐ始める',
  'hero.secondary': 'ショーケースを見る',
  'hero.stampLabel': '起源',

  'how.eyebrow': '仕組み',
  'how.title': 'アイデアから、みんなで遊べるゲームへ',
  'how.sub': 'オープンソースのクライアント、独自の生成システム、そしてマルチプレイヤーサーバー。3つの柱で動いています。',
  'how.client.title': 'オープンソースのクライアント',
  'how.client.body':
    'tokigenクライアントはGodot Engine 4をはじめ、Jolt Physics、Terrain3D、LimboAI（MITライセンス）で構築。ゲームの制作から、ルームコードの共有、仲間との参加までこれひとつで行えます。',
  'how.gen.title': '独自の生成システム',
  'how.gen.body':
    '普段の言葉で説明するだけ。独自の生成パイプラインがゲームを設計し、ワールドをプロシージャルに構築し、AIボットでプレイテストしてから、ランチャー用にパッケージします。',
  'how.gen.chip1': 'ゲームデザイン',
  'how.gen.chip2': 'プロシージャル生成',
  'how.gen.chip3': 'ボットによるテスト',
  'how.mp.title': 'マルチプレイヤーサーバー',
  'how.mp.body':
    'すべてのゲームに専用サーバー。ルームコードを共有すれば、仲間が数秒で参加できます。誰も遊んでいない時はサーバーが休み、必要な時にすぐ起動します。',
  'how.mp.chip1': 'ルームコード',
  'how.mp.chip2': 'ゼロスケール',
  'how.mp.chip3': 'Rustサーバー',

  'templates.title': 'テンプレートから始めよう',
  'templates.sub': '6つのスターターテンプレートには、マルチプレイヤー通信とネイティブ物理演算が最初から組み込まれています。',
  'templates.rpg.name': 'アクションRPG',
  'templates.rpg.body': '属性の力とボス戦が楽しめる三人称アクション。',
  'templates.sandbox.name': 'サンドボックスRPG',
  'templates.sandbox.body': 'スキル、交易、冒険が広がるティック制のオープンワールド。',
  'templates.voxel.name': 'ボクセル・サバイバル',
  'templates.voxel.body': 'ブロックの世界を掘って、作って、作り変えよう。',
  'templates.strategy.name': '4Xストラテジー',
  'templates.strategy.body': 'ヘックスマップで探索・拡張・開発・征服。',
  'templates.arena.name': 'アリーナシューター',
  'templates.arena.body': 'ロールバックネットコードによる60Hzの対戦FPS。',
  'templates.tycoon.name': 'タイクーン＆レーサー',
  'templates.tycoon.body': '集めて、育てて、自作コースでレース。',

  'showcase.eyebrow': 'ショーケース',
  'showcase.title': 'プロンプトひとつで、遊べる世界に。',
  'showcase.sub': '炎のリグのデモは、このプロンプトから生まれました。映像はtokigenランチャーで実際に録画したものです。',
  'showcase.promptLabel': 'あなたのプロンプト',
  'showcase.prompt':
    '海に浮かぶ灼熱の鉄のリグで脱獄するゲームを作って。石炭の噴出口から金属を操って盾にし、仲間と一緒に炎の看守ボスを倒したい。',
  'showcase.step1': '設計完了',
  'showcase.step2': 'ワールド構築',
  'showcase.step3': 'ボットでテスト済み',
  'showcase.step4': 'プレイ準備OK',
  'showcase.resultLabel': '結果：Rigbreak — The Boiling Iron',
  'showcase.videoLabel': 'tokigenランチャーで録画したゲームプレイ',

  'download.eyebrow': 'ダウンロード',
  'download.title': 'tokigenランチャーを入手',
  'download.sub': '無料。一度インストールすれば、ゲームの制作、共有、仲間とのプレイがすべて可能になります。',
  'download.recommended': 'おすすめ',
  'download.button': 'ダウンロード',
  'download.win.meta': 'Windows 10 / 11 · 64ビット',
  'download.mac.meta': 'Appleシリコン & Intel',
  'download.linux.meta': 'x86_64 · Steam Deck対応',
  'download.note': '友達からルームコードをもらった？ランチャーを開いてコードを入力するだけ。',

  'community.title': 'コミュニティに参加',
  'community.body': 'ゲームを共有して、仲間を見つけて、tokigenを一緒に作ろう。',

  'footer.tagline': '世界を創る。ルールを書く。仲間を呼ぼう！',
  'footer.credit': 'Godot Engineとオープンソースで構築。',

  'studio.eyebrow': 'Webスタジオ',
  'studio.title': '工事中',
  'studio.body': 'まもなく、ブラウザから自分のゲームのスクリーンショットや3Dアセットを見られるようになります。',
  'studio.feature1.title': 'ゲームギャラリー',
  'studio.feature1.body': 'ビルドごとのスクリーンショットやクリップを一覧で。',
  'studio.feature2.title': '3Dアセットビューア',
  'studio.feature2.body': 'ワールド用に生成されたモデルを回して、調べて、共有しよう。',
  'studio.feature3.title': '共有ページ',
  'studio.feature3.body': '友達がゲームを見てランチャーを入手できるリンク。',
  'studio.cta': 'ランチャーを入手',
  'studio.back': 'ホームに戻る',
  'studio.stampLabel': '工事中',
};

const DICTS: Record<Lang, Dict> = { en, 'pt-BR': ptBR, ja };

let current: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** Map arbitrary BCP-47 tags (e.g. "pt", "pt-PT", "ja-JP") onto supported languages. */
function matchLang(tag: string): Lang | null {
  const lower = tag.toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('en')) return 'en';
  return null;
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function detectLanguage(): Lang {
  const param = new URLSearchParams(location.search).get('lang');
  if (param) {
    const fromParam = isLang(param) ? param : matchLang(param);
    if (fromParam) return fromParam;
  }
  const stored = readStored();
  if (isLang(stored)) return stored;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const match = matchLang(tag);
    if (match) return match;
  }
  return 'en';
}

export function t(key: string, lang: Lang = current): string {
  return DICTS[lang][key] ?? en[key] ?? key;
}

export function getLanguage(): Lang {
  return current;
}

export function applyLanguage(lang: Lang, persist = false): void {
  current = lang;
  const root = document.documentElement;
  root.lang = lang;

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n!);
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    for (const pair of el.dataset.i18nAttr!.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  });

  const page = root.dataset.page ?? 'home';
  document.title = t(`meta.title.${page}`);
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage blocked: language still applies for this page view */
    }
  }

  document.dispatchEvent(new CustomEvent('tokigen:languagechange', { detail: { lang } }));
}
