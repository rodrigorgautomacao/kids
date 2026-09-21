// i18n leve (Fase 10) — só a CARCAÇA da interface vira idioma.
//
// O conteúdo bíblico (cenas das histórias, perguntas, falas) continua em
// português: traduzir conteúdo é um trabalho de curadoria à parte, que não
// deve ser feito por glossário automático. Aqui ficam os rótulos de UI:
// Hub (filtros, botões), livrinho de figurinhas e palco de cenas.
//
// Persistência: `kids-lang-v1` ('pt' | 'en'). Padrão: 'pt'.

const LANG_KEY = 'kids-lang-v1';

export type Lang = 'pt' | 'en';

const PT = {
  'hub.jogar': 'Jogar →',
  'hub.continuar': 'Continuar →',
  'hub.em-breve': 'Em breve',
  'hub.figurinhas': 'Minhas Figurinhas',
  'hub.efeitos': 'Efeitos',
  'hub.musica': 'Música',
  'hub.pequeninos': 'Pequeninos',
  'hub.pequeninos-dica': 'Pré-leitores: menos opções, narração sempre',
  'filtro.todos': 'Todos',
  'filtro.idade': 'Idade',
  'filtro.at': 'Antigo Testamento',
  'filtro.nt': 'Novo Testamento',
  'filtro.at-nt': 'AT+NT',
  'book.titulo': 'Meu Livro de Figurinhas',
  'book.subtitulo': 'Colete cenas contando as histórias da Aventura',
  'book.fechar': 'Fechar',
  'book.coletadas': 'colecionadas',
  'book.lock': 'Figurinha secreta… apareça na Aventura!',
  'stage.ouvir': 'Ouvir de novo',
  'stage.continuar': 'Continuar ▶',
  'stage.pergunta-nova': 'Ouvir a pergunta',
  'stage.quase': 'Quase! Tenta de novo 💡',
  'stage.erradas': 'opção errada saiu do caminho',
  'stage.erradas-pl': 'opções erradas saíram do caminho',
  'stage.figurinha-nova': 'Figurinha nova!',
  'stage.coletada': 'Figurinha colecionada:',
  'stage.voltar': '🌍 Voltar ao mundo',
  'stage.ver-novo': '▶ Ver de novo',
  'menu.titulo': 'Que história você quer ouvir?',
  'menu.contar': '🎭 Contar história',
  'menu.perguntinha': '❓ Perguntinha do personagem',
  'menu.dica': 'Cada história vale uma figurinha!',
  'talk.ouca': 'Ouvir de novo',
} as const;

const EN: Record<keyof typeof PT, string> = {
  'hub.jogar': 'Play →',
  'hub.continuar': 'Continue →',
  'hub.em-breve': 'Soon',
  'hub.figurinhas': 'My Stickers',
  'hub.efeitos': 'Effects',
  'hub.musica': 'Music',
  'hub.pequeninos': 'Little ones',
  'hub.pequeninos-dica': 'Early readers: fewer choices, always narrated',
  'filtro.todos': 'All',
  'filtro.idade': 'Age',
  'filtro.at': 'Old Testament',
  'filtro.nt': 'New Testament',
  'filtro.at-nt': 'OT+NT',
  'book.titulo': 'My Sticker Book',
  'book.subtitulo': 'Collect scenes by hearing the Adventure stories',
  'book.fechar': 'Close',
  'book.coletadas': 'collected',
  'book.lock': 'Secret sticker… find it in the Adventure!',
  'stage.ouvir': 'Listen again',
  'stage.continuar': 'Continue ▶',
  'stage.pergunta-nova': 'Hear the question',
  'stage.quase': 'So close! Try again 💡',
  'stage.erradas': 'wrong choice stepped away',
  'stage.erradas-pl': 'wrong choices stepped away',
  'stage.figurinha-nova': 'New sticker!',
  'stage.coletada': 'Sticker collected:',
  'stage.voltar': '🌍 Back to the world',
  'stage.ver-novo': '▶ Watch again',
  'menu.titulo': 'Which story do you want to hear?',
  'menu.contar': '🎭 Tell a story',
  'menu.perguntinha': '❓ Character question',
  'menu.dica': 'Every story gives you a sticker!',
  'talk.ouca': 'Hear again',
};

const DICTS: Record<Lang, Record<keyof typeof PT, string>> = { pt: PT, en: EN };

let cached: Lang | null = null;

export function getLang(): Lang {
  if (cached) return cached;
  try {
    cached = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'pt';
  } catch {
    cached = 'pt';
  }
  return cached;
}

export function setLang(lang: Lang) {
  cached = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignora */
  }
}

/** Chave de tradução pública (evita depender do shape interno do dicionário). */
export type TKey = keyof typeof PT;

/** Tradução de chave de UI (carcaça). */
export function t(key: TKey): string {
  return DICTS[getLang()][key];
}

export function isEn(): boolean {
  return getLang() === 'en';
}