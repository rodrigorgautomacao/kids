// "Devocional da Semana" — a tela de **LEITURA** da vertical (data/devocionalSemanal).
//
// POR QUE ESTE JOGO NÃO É UM JOGO
// A criança não acerta nem erra aqui: ela lê. O devocional do material do dono é
// uma mensagem por dia (segunda a sábado) + o versículo do dia + um bloco
// PRATICANDO. O honesto é mostrar exatamente isso e nada mais: o "acerto" é ter
// lido, e o registro é um histórico (`lib/leitura`), não uma pontuação.
// Consequências de engenharia:
//
// - **Nada de texto bíblico na tela.** `versiculo.texto` está vazio em toda a
//   fonte de propósito (a redação NAA não pode ser reproduzida — ADR-001). A tela
//   mostra a REFERÊNCIA + "Abra a Bíblia em casa e leia". É assim que a regra de
//   conteúdo vira regra de UI; o teste em `data/devocionalSemanal.test.ts` trava
//   `versiculo.texto === ''` em toda parte.
// - **Nada reprova.** Pode marcar lido, voltar, reler à vontade. Sem "errou", sem
//   tempo, sem perder estrela. A única coisa que "falha" é o botão de apagar, e
//   ele pede consentimento claro.
// - **Nada de `Math.random()`/`Date.now()`** deciding ordem de tela: o dia
//   sugerido vem do histórico (`best`/marcas) e da ordem do array. O `hoje()` da
//   lib só carimba data.
// - **Narração é canal de primeira classe** (a faixa 3–4 não lê): toda mensagem,
//   bloco PRATICANDO e caixote extra tem 🔊; a referência do versículo também é
//   falada, porque quem não lê ainda precisa saber qual passageu abrir.
//
// ACESSIBILIDADE / FORMA (skills `jogos-forma`, `jogos-mobile`)
// - Estado "lido × não lido" **nunca** é só matiz: muda a FORMA (estrela cheia ×
//   círculo vazio tracejado), a LUMINÂNCIA (âmbar sólido × branco) e o TEXTO
//   ("3 de 6 dias lidos") — o filtro de cor não come a informação.
// - Alvos ≥ 44 px (`min-h-11`/`min-h-12`), `safe-area-pad` vem do `GameShell`,
//   coluna `max-w-2xl` para a leitura não esticar em 1000 px de desktop, e a fita
//   dos 6 dias é `grid-cols-3 sm:grid-cols-6` (360 px: 2 fileiras, não 6 colunas
//   espremidas).
// - Texto em rem (escala do aparelho respeitada) e contraste AA: corpo
//   `text-slate-800` sobre branco (~14:1), título `text-amber-800` (~7:1).

import { useEffect, useMemo, useState } from 'react';
import Confetti from 'react-confetti';
import { BookOpen, Check, ChevronLeft, Eraser, Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import { StarItem } from '../art';
import { sfx, voice } from '../../lib/audio';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { usePrefersReducedMotion } from '../../lib/motion';
import {
  avisarLeitura,
  concluir,
  loadLeitura,
  limparJogo,
  marcar,
  progresso,
  subscribeLeitura,
  temMarca,
  unidade,
  type LeituraStore,
  type UnidadeLeitura,
} from '../../lib/leitura';
import {
  DEVOCIONAIS,
  DEVOCIONAL_INICIO_ATUAL,
  semanasPorTema,
  type DiaDevocional,
  type SemanaDevocional,
} from '../../data/devocionalSemanal';

const GAME_ID = 'devocional-da-semana';

type Tela = 'biblioteca' | 'capa' | 'dia';
type Filtro = 'semana' | 'tema';

/** Ordem fixa dos dias. É ela que define a sugestão de "próximo dia" (seg → sáb). */
const ORDEM_DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Compara temas ignorando caixa e acento — o mesmo cuidado de `semanasPorTema`. */
function chaveTema(tema: string): string {
  return tema
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // acentos (combining marks) — 'Praticando' == 'praticando'
}

/* ───────────────────────────── datas (à mão) ───────────────────────────── */
// `toLocaleDateString`/`Intl` falam a língua do aparelho e mudam o texto entre
// gadgets; a curadoria exige pt-BR estável. Por isso o mês é uma tabela.

/** '2026-09-28' → '28 de setembro'. */
function formatarData(iso: string): string {
  const partes = ISO.exec(iso);
  if (!partes) return iso;
  const nome = MESES[Number(partes[2]) - 1];
  return nome ? `${Number(partes[3])} de ${nome}` : iso;
}

/** '2026-09-28' + '2026-10-03' → '28 de set – 3 de out'. */
function formatarIntervalo(inicio: string, fim: string): string {
  const a = ISO.exec(inicio);
  const b = ISO.exec(fim);
  if (!a || !b) return `${formatarData(inicio)} – ${formatarData(fim)}`;
  const ma = MESES_CURTOS[Number(a[2]) - 1];
  const mb = MESES_CURTOS[Number(b[2]) - 1];
  return `${Number(a[3])} de ${ma} – ${Number(b[3])} de ${mb}`;
}

/* ───────────────────────────── histórico ───────────────────────────── */

/** Id estável da unidade de leitura: `2026-09-28/seg`. É ele que sobrevive a
 *  o dono entregar mais material (ver o cabeçalho de `lib/leitura.ts`). */
function unidadeDe(semanaId: string, diaId: string): string {
  return `${semanaId}/${diaId}`;
}

function idsDaSemana(semana: SemanaDevocional): string[] {
  return semana.dias.map((d) => unidadeDe(semana.id, d.id));
}

/** Um dia conta como lido quando foi concluído (`best > 0`) **ou** marcado. */
function lido(u: UnidadeLeitura): boolean {
  return u.best > 0 || temMarca(u, 'lido');
}

/** Uma bolinha por dia, na ordem do array. */
function flagsDaSemana(store: LeituraStore, semana: SemanaDevocional): boolean[] {
  return semana.dias.map((d) => lido(unidade(store, GAME_ID, unidadeDe(semana.id, d.id))));
}

/* ───────────────────────────── peças visuais ───────────────────────────── */

/** Botão 🔊 de 44 px. `aria-label` é sempre passado: ícone sem nome não é lido
 *  por leitor de tela, e quem não lê ainda precisa do alvo grande. */
function BotaoOuvir({
  texto,
  label,
  className = 'bg-sky-600',
}: {
  texto: string;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        sfx.click();
        voice.speak(texto);
      }}
      className={`ui-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ${className}`}
    >
      <Volume2 className="h-5 w-5" aria-hidden />
    </button>
  );
}

/** As 6 bolinhas da semana. Forma + valor, não matiz (skill `jogos-forma` §4). */
function Bolinhas({ lidos }: { lidos: boolean[] }) {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      {lidos.map((feito, i) => (
        <span
          key={i}
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            feito ? 'bg-amber-400' : 'border-2 border-dashed border-slate-300 bg-white'
          }`}
        >
          {feito ? <Check className="h-4 w-4 text-amber-950" strokeWidth={4} /> : null}
        </span>
      ))}
    </span>
  );
}

/**
 * O destaque do versículo: referência grande, convite e a fala. 🔒 `texto` do
 * versículo **nunca** é renderizado (ver o cabeçalho do arquivo).
 */
function BlocoVersiculo({ referencia, diaDaSemana }: { referencia: string; diaDaSemana?: string }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100 p-5 shadow-inner ring-2 ring-indigo-200">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-black tracking-wide text-indigo-800 uppercase">
          <BookOpen className="h-5 w-5" aria-hidden /> Versículo de {diaDaSemana ?? 'hoje'}
        </span>
        <BotaoOuvir
          texto={`Versículo de hoje: ${referencia}. Abra a Bíblia em casa e leia.`}
          label="Ouvir a referência do versículo"
          className="bg-indigo-600"
        />
      </div>
      <p className="mt-2 text-2xl font-black break-words text-indigo-950 sm:text-3xl">
        {referencia}
      </p>
      <p className="mt-2 text-base font-bold text-indigo-950/85">
        Abra a Bíblia em casa e leia {referencia}. 📖
      </p>
      <p className="mt-1 text-sm font-bold text-indigo-950/70">
        A Palavra mora na sua Bíblia — aqui no jogo a gente guarda só o endereço
        dela.
      </p>
    </div>
  );
}

/** Etiqueta pequena (tema do dia, tema da semana, leituras da semana). */
function Etiqueta({ children, tom = 'claro' }: { children: string; tom?: 'claro' | 'escuro' }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-black ${
        tom === 'escuro'
          ? 'bg-amber-400 text-amber-950'
          : 'bg-white/85 text-slate-700 ring-2 ring-slate-200'
      }`}
    >
      {children}
    </span>
  );
}

/** Cartão de uma semana na lista do histórico. Alvo = o cartão inteiro. */
function CartaoSemana({
  semana,
  lidos,
  onOpen,
}: {
  semana: SemanaDevocional;
  lidos: boolean[];
  onOpen: (semana: SemanaDevocional) => void;
}) {
  const quantos = lidos.filter(Boolean).length;
  return (
    <button
      type="button"
      onClick={() => onOpen(semana)}
      aria-label={`${semana.tema}, semana de ${formatarIntervalo(semana.inicio, semana.fim)}, ${quantos} de ${semana.dias.length} dias lidos. Abrir a capa desta semana.`}
      className="ui-press flex w-full flex-col gap-2 rounded-3xl bg-white/95 p-4 text-left shadow-lg ring-2 ring-amber-200 hover:ring-amber-400"
    >
      <span className="flex items-center gap-2">
        <StarItem size={22} />
        <span className="text-lg leading-tight font-black break-words text-slate-800">
          {semana.tema}
        </span>
      </span>
      <span className="text-sm font-bold text-slate-600">
        {formatarIntervalo(semana.inicio, semana.fim)}
        {/* Capa sem versículo no material (CAPA_SEM_VERSICULO): sem "📖" órfão. */}
        {semana.capa.versiculo.ref ? ` · 📖 ${semana.capa.versiculo.ref}` : ''}
      </span>
      <span className="flex items-center gap-2">
        <Bolinhas lidos={lidos} />
        <span className="text-xs font-black text-slate-600">
          {quantos} de {semana.dias.length} dias lidos
        </span>
      </span>
    </button>
  );
}

/* ──────────────────────────────── a tela ──────────────────────────────── */

export default function GameDevocionalDaSemana({ onExit }: { onExit: () => void }) {
  const [store, setStore] = useState<LeituraStore>(() => loadLeitura());
  const [tela, setTela] = useState<Tela>('biblioteca');
  const [semanaId, setSemanaId] = useState<string>(DEVOCIONAL_INICIO_ATUAL);
  const [diaId, setDiaId] = useState<string>(ORDEM_DIAS[0]);
  const [filtro, setFiltro] = useState<Filtro>('semana');
  const [temaAtivo, setTemaAtivo] = useState<string>('');
  const [confirmando, setConfirmando] = useState(false);
  /** Semana fechada: a capa mostra o resumo "6 dias lidos" com o confete. */
  const [resumo, setResumo] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // O histórico pode mudar fora desta tela (outro jogo, outra aba): a
  // assinatura recarrega do `localStorage`.
  useEffect(() => subscribeLeitura(() => setStore(loadLeitura())), []);

  // Nunca deixar narração falando depois que a tela saiu.
  useEffect(() => () => voice.stopSpeaking(), []);

  /** Semana em destaque (a mais recente) + histórico do novo pro velho + temas. */
  const { semanaAtual, semanasDesc, temas } = useMemo(() => {
    const desc = [...DEVOCIONAIS].sort((a, b) => b.inicio.localeCompare(a.inicio));
    const atual = desc.find((s) => s.inicio === DEVOCIONAL_INICIO_ATUAL) ?? desc[0];
    const unicos: string[] = [];
    const vistas = new Set<string>();
    for (const s of desc) {
      const k = chaveTema(s.tema);
      if (vistas.has(k)) continue;
      vistas.add(k);
      unicos.push(s.tema);
    }
    return { semanaAtual: atual, semanasDesc: desc, temas: unicos };
  }, []);

  const semana = useMemo(
    () => DEVOCIONAIS.find((s) => s.id === semanaId) ?? semanaAtual,
    [semanaId, semanaAtual],
  );
  const dia = useMemo(
    () => semana?.dias.find((d) => d.id === diaId) ?? null,
    [semana, diaId],
  );

  const lidos = useMemo(() => (semana ? flagsDaSemana(store, semana) : []), [store, semana]);
  const idxDia = dia && semana ? semana.dias.findIndex((d) => d.id === dia.id) : -1;
  const lidoAtual = idxDia >= 0 ? lidos[idxDia] === true : false;
  const praticadoAtual =
    dia && semana ? temMarca(unidade(store, GAME_ID, unidadeDe(semana.id, dia.id)), 'praticado') : false;
  /** Primeiro dia não lido; se a semana acabou, o primeiro do dia (releitura livre). */
  const sugestao = semana ? (semana.dias.find((_, i) => lidos[i] !== true) ?? semana.dias[0]) : null;

  /* ------------------------------ navegação ------------------------------ */

  function pararAudio() {
    voice.stopSpeaking();
  }

  function irParaBiblioteca() {
    pararAudio();
    setTela('biblioteca');
    setResumo(false);
    setConfirmando(false);
    sfx.click();
  }

  function abrirSemana(s: SemanaDevocional) {
    pararAudio();
    setSemanaId(s.id);
    setConfirmando(false);
    setResumo(false);
    setTela('capa');
    sfx.open();
  }

  function abrirDia(d: DiaDevocional) {
    pararAudio(); // o dia anterior pode ainda estar narrando
    setDiaId(d.id);
    setTela('dia');
    sfx.click();
  }

  // Ao entrar no dia, anuncia o dia e o tema: quem ainda não lê sabe onde está
  // antes de tocar em qualquer coisa. 400 ms depois do toque (a voz do iOS só
  // destrava em gesto do usuário — `voice.primeVoice()` no primeiro toque).
  useEffect(() => {
    if (tela !== 'dia' || !dia) return;
    const t = window.setTimeout(() => {
      voice.speakQueue([dia.dia, dia.data, 'Tema de hoje:', dia.tema]);
    }, 400);
    return () => window.clearTimeout(t);
  }, [tela, dia]);

  /* ------------------------------- ações ------------------------------- */

  /** "Marcar como lido": grava, comemora e leva ao próximo dia não lido — ou
   *  fecha a semana na capa. Nunca reprova e nunca bloqueia: voltar é sempre
   *  possível — e reler não custa nada. */
  function avancar() {
    if (!semana || !dia) return;
    const uid = unidadeDe(semana.id, dia.id);
    const proximoStore = lidoAtual ? store : concluir(store, GAME_ID, uid, 0, 'lido');
    if (!lidoAtual) {
      setStore(proximoStore);
      avisarLeitura();
      sfx.star();
    } else {
      sfx.click();
    }
    pararAudio();
    // Próximo = primeiro dia ainda não lido **depois** deste; se todos os
    // seguintes já foram lidos (releitura), volta ao primeiro que faltou. A
    // ordem é a do array — sem sorteio e sem "hoje" (jogos-arquitetura:
    // determinismo é o que faz o histórico valer).
    const posicao = semana.dias.findIndex((d) => d.id === dia.id);
    const faltam: number[] = [];
    semana.dias.forEach((d, i) => {
      if (!lido(unidade(proximoStore, GAME_ID, unidadeDe(semana.id, d.id)))) faltam.push(i);
    });
    const destino = faltam.find((i) => i > posicao) ?? faltam[0];
    const proximoDia = destino === undefined ? null : semana.dias[destino];
    if (proximoDia) {
      abrirDia(proximoDia);
      return;
    }
    setResumo(true);
    setTela('capa');
    sfx.chapter();
    voice.speak('Você leu os seis dias desta semana! Que bom. Dá para ler tudo de novo quando quiser.');
  }

  function marcarPraticado() {
    if (!semana || !dia || praticadoAtual) return;
    const proximoStore = marcar(store, GAME_ID, unidadeDe(semana.id, dia.id), 'praticado');
    setStore(proximoStore);
    avisarLeitura();
    sfx.badge();
    voice.speak('Que bom! Você praticou hoje.');
  }

  function apagarHistorico() {
    const proximoStore = limparJogo(store, GAME_ID);
    setStore(proximoStore);
    avisarLeitura();
    setConfirmando(false);
    sfx.click();
    voice.speak('Tudo apagado. Quando quiser, é só ler de novo.');
  }

  /* ─────────────────────────── tela: biblioteca ─────────────────────────── */

  const semanasVisiveis =
    filtro === 'semana'
      ? semanasDesc.filter((s) => s.id !== semanaAtual?.id)
      : temaAtivo
        ? [...semanasPorTema(temaAtivo)].sort((a, b) => b.inicio.localeCompare(a.inicio))
        : [];

  /** Dia lido × total da semana em destaque (o botão de sempre voltar). */
  const progressoAtual = semanaAtual ? progresso(store, GAME_ID, idsDaSemana(semanaAtual)) : null;

  const biblioteca = (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <p className="px-1 text-center text-base font-bold text-slate-600">
        Uma mensagem por dia, de segunda a sábado. Leia com calma, sem pressa.
      </p>

      {/* Semana em destaque — o botão de sempre voltar. */}
      {semanaAtual && progressoAtual ? (
        <section
          aria-labelledby="devocional-semana-atual"
          className="rounded-3xl bg-gradient-to-br from-amber-100 to-rose-100 p-5 shadow-lg ring-2 ring-amber-300"
        >
          <Etiqueta tom="escuro">Esta semana</Etiqueta>
          <h3 id="devocional-semana-atual" className="mt-2 text-2xl leading-tight font-black text-amber-950">
            {semanaAtual.tema}
          </h3>
          <p className="mt-1 text-sm font-bold text-amber-900">
            {formatarIntervalo(semanaAtual.inicio, semanaAtual.fim)}
            {/* Capa sem versículo no material (CAPA_SEM_VERSICULO): sem "📖" órfão. */}
            {semanaAtual.capa.versiculo.ref ? ` · 📖 ${semanaAtual.capa.versiculo.ref}` : ''}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Bolinhas lidos={flagsDaSemana(store, semanaAtual)} />
            <span className="text-xs font-black text-amber-900">
              {progressoAtual.lidos} de {semanaAtual.dias.length} dias lidos
            </span>
          </div>
          <button
            type="button"
            onClick={() => abrirSemana(semanaAtual)}
            className="ui-press mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 text-xl font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
          >
            {progressoAtual.lidos === 0
              ? 'Começar 📖'
              : `Continuar (${progressoAtual.lidos}/${semanaAtual.dias.length} dias)`}
          </button>
        </section>
      ) : null}

      {/* Filtros: por semana / por tema. `aria-pressed` é o estado, não só a cor. */}
      <div role="group" aria-label="Escolher devocional" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filtro === 'semana'}
          onClick={() => {
            sfx.click();
            setFiltro('semana');
          }}
          className={`ui-press min-h-11 flex-1 rounded-2xl px-5 text-base font-black ${
            filtro === 'semana'
              ? 'bg-amber-500 text-amber-950 shadow-[0_4px_0_rgba(202,138,4,0.9)]'
              : 'bg-white/90 text-slate-700 shadow'
          }`}
        >
          Por semana
        </button>
        <button
          type="button"
          aria-pressed={filtro === 'tema'}
          onClick={() => {
            sfx.click();
            setFiltro('tema');
          }}
          className={`ui-press min-h-11 flex-1 rounded-2xl px-5 text-base font-black ${
            filtro === 'tema'
              ? 'bg-amber-500 text-amber-950 shadow-[0_4px_0_rgba(202,138,4,0.9)]'
              : 'bg-white/90 text-slate-700 shadow'
          }`}
        >
          Por tema
        </button>
      </div>

      {filtro === 'tema' ? (
        <div role="group" aria-label="Temas das semanas" className="flex flex-wrap gap-2">
          {temas.length === 0 ? (
            <p className="text-sm font-bold text-slate-600">Nenhum tema no histórico ainda.</p>
          ) : (
            temas.map((tema) => {
              const ativo = temaAtivo === tema;
              return (
                <button
                  key={tema}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => {
                    sfx.click();
                    setTemaAtivo(ativo ? '' : tema);
                  }}
                  className={`ui-press min-h-11 rounded-full px-4 text-sm font-black ${
                    ativo
                      ? 'bg-sky-600 text-white shadow-[0_4px_0_rgba(3,105,161,0.9)]'
                      : 'bg-white/90 text-slate-700 shadow'
                  }`}
                >
                  {tema}
                </button>
              );
            })
          )}
        </div>
      ) : null}

      <section aria-labelledby="devocional-historico" className="flex flex-col gap-3">
        <h3 id="devocional-historico" className="text-lg font-black text-slate-800">
          {filtro === 'tema' ? `Semanas de “${temaAtivo}”` : 'Histórico de devocionais'}
        </h3>

        {semanasVisiveis.length === 0 ? (
          <p className="rounded-3xl bg-white/90 p-5 text-sm leading-relaxed font-bold text-slate-600 shadow">
            {filtro === 'tema' && !temaAtivo
              ? 'Escolha um tema acima para ver as semanas dele.'
              : 'As semanas anteriores aparecem aqui quando chegarem. Por enquanto só existe esta aqui em cima — e dá para ler quantas vezes quiser. 💛'}
          </p>
        ) : (
          semanasVisiveis.map((s) => (
            <CartaoSemana
              key={s.id}
              semana={s}
              lidos={flagsDaSemana(store, s)}
              onOpen={abrirSemana}
            />
          ))
        )}
      </section>

      {/* Apagar histórico: leitura não é jogo — precisa de consentimento claro. */}
      <section className="flex flex-col gap-3">
        {!confirmando ? (
          <button
            type="button"
            onClick={() => {
              sfx.click();
              setConfirmando(true);
            }}
            className="ui-press mx-auto flex min-h-11 items-center gap-2 rounded-full bg-white/70 px-5 py-2 text-sm font-bold text-slate-600"
          >
            <Eraser className="h-4 w-4" aria-hidden /> Recomeçar
          </button>
        ) : (
          <div
            role="alertdialog"
            aria-label="Apagar o que você já leu"
            className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-lg ring-2 ring-slate-200"
          >
            <p className="text-base leading-snug font-black text-slate-800">
              Apagar o que você já leu?
            </p>
            <p className="text-sm leading-relaxed font-bold text-slate-600">
              Isso apaga as estrelas e as marcas de “praticado”. Não tem problema
              nenhum: você pode ler tudo de novo depois, quantas vezes quiser. 💛
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  sfx.click();
                  setConfirmando(false);
                }}
                className="ui-press min-h-12 flex-1 rounded-2xl bg-slate-200 px-5 text-base font-black text-slate-800"
              >
                Não, quero guardar
              </button>
              <button
                type="button"
                onClick={apagarHistorico}
                className="ui-press min-h-12 flex-1 rounded-2xl bg-rose-200 px-5 text-base font-black text-rose-950 ring-2 ring-rose-300"
              >
                Sim, apagar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  /* ───────────────────────────── tela: capa ───────────────────────────── */

  const capa = semana ? (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {resumo ? (
        <div
          role="status"
          className="animate-pop flex flex-col items-center gap-1 rounded-3xl bg-emerald-100 p-4 text-center ring-2 ring-emerald-300"
        >
          <p className="text-xl font-black text-emerald-900">
            Você leu os 6 dias desta semana! 🎉
          </p>
          <p className="text-sm font-bold text-emerald-900/85">
            Que bom. Pode voltar e ler tudo de novo quando quiser.
          </p>
        </div>
      ) : null}

      <section className="rounded-3xl bg-white/95 p-5 shadow-lg ring-2 ring-amber-200">
        <Etiqueta tom="escuro">{formatarIntervalo(semana.inicio, semana.fim)}</Etiqueta>
        <h3 className="mt-2 text-3xl leading-tight font-black break-words text-amber-950">
          {semana.capa.titulo}
        </h3>
        <p className="mt-2 mb-3">
          <Etiqueta>{semana.tema}</Etiqueta>
        </p>

        {/* Capa sem versículo no material (CAPA_SEM_VERSICULO): o bloco some —
            nunca renderizar "Abra a Bíblia em casa e leia" sem referência. */}
        {semana.capa.versiculo.ref ? (
          <BlocoVersiculo referencia={semana.capa.versiculo.ref} />
        ) : null}

        <h4 className="mt-4 text-sm font-black text-slate-700">Os 6 dias da semana</h4>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {semana.dias.map((d, i) => {
            const feito = lidos[i] === true;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => abrirDia(d)}
                aria-label={`${d.dia}, ${d.data}${feito ? ', já lido' : ', ainda não lido'}`}
                className={`ui-press flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-2 text-sm font-black ${
                  feito
                    ? 'border-amber-600 bg-amber-400 text-amber-950'
                    : 'border-dashed border-slate-300 bg-white text-slate-600'
                }`}
              >
                <span>{d.dia}</span>
                <span className="text-xs font-bold opacity-90">{feito ? '✅ lido' : d.data}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => sugestao && abrirDia(sugestao)}
          disabled={!sugestao}
          className="ui-press flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 text-xl font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
        >
          {sugestao ? `Ler ${sugestao.dia.toLowerCase()}-feira 📖` : 'Sem dias nesta semana'}
        </button>
        <button
          type="button"
          onClick={irParaBiblioteca}
          className="ui-press mx-auto flex min-h-11 items-center gap-2 rounded-full bg-white/85 px-5 py-2 text-sm font-bold text-slate-700 shadow"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Voltar à biblioteca
        </button>
      </div>
    </div>
  ) : null;

  /* ───────────────────────────── tela: dia ───────────────────────────── */

  const extras = dia ? dia.extras.filter((e) => e.texto.trim() !== '') : [];
  const leituras = dia ? dia.leituras.filter((l) => l.trim() !== '') : [];

  const telaDia = dia && semana ? (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          pararAudio();
          setTela('capa');
          sfx.click();
        }}
        className="ui-press flex min-h-11 w-fit items-center gap-1 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-slate-700 shadow"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Capa da semana
      </button>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta tom="escuro">{`${dia.dia}-feira`}</Etiqueta>
          <Etiqueta>{dia.tema}</Etiqueta>
        </div>
        <h3 className="text-3xl leading-tight font-black text-amber-950">{dia.dia}</h3>
        <p className="text-sm font-bold text-slate-600">{dia.data}</p>
      </header>

      <BlocoVersiculo referencia={dia.versiculo.ref} diaDaSemana={dia.dia.toLowerCase()} />

      {/* A mensagem — texto do autor, não citação bíblica. */}
      <section
        aria-labelledby="devocional-mensagem"
        className="rounded-3xl bg-white p-5 shadow-lg ring-2 ring-slate-200"
      >
        <div className="flex items-center justify-between gap-3">
          <h4 id="devocional-mensagem" className="text-lg font-black text-slate-800">
            Mensagem de hoje
          </h4>
          <BotaoOuvir texto={dia.texto} label="Ouvir a mensagem de hoje" />
        </div>
        <p className="mt-3 text-lg leading-relaxed break-words text-slate-800">{dia.texto}</p>
      </section>

      {dia.praticando.trim() !== '' ? (
        <section
          aria-labelledby="devocional-praticando"
          className="rounded-3xl bg-amber-100 p-5 shadow-lg ring-2 ring-amber-300"
        >
          <div className="flex items-center justify-between gap-3">
            <h4 id="devocional-praticando" className="text-lg font-black text-amber-950">
              PRATICANDO 💛
            </h4>
            <BotaoOuvir
              texto={dia.praticando}
              label="Ouvir a sugestão de hoje"
              className="bg-amber-600"
            />
          </div>
          <p className="mt-3 text-lg leading-relaxed break-words text-amber-950">
            {dia.praticando}
          </p>
          <button
            type="button"
            aria-pressed={praticadoAtual}
            disabled={praticadoAtual}
            onClick={marcarPraticado}
            className={`ui-press mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-black ${
              praticadoAtual
                ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500'
                : 'bg-white text-amber-900 ring-2 ring-amber-400'
            }`}
          >
            <Check className="h-5 w-5" strokeWidth={4} aria-hidden />
            {praticadoAtual ? 'Você praticou!' : 'Eu pratiquei'}
          </button>
        </section>
      ) : null}

      {extras.length > 0 ? (
        <section aria-labelledby="devocional-extras" className="flex flex-col gap-3">
          <h4 id="devocional-extras" className="text-lg font-black text-slate-800">
            Tem mais coisa hoje
          </h4>
          {extras.map((e, i) => (
            <div key={i} className="rounded-3xl bg-sky-50 p-5 shadow ring-2 ring-sky-200">
              <div className="flex items-center justify-between gap-3">
                <h5 className="text-base font-black break-words text-sky-950">{e.titulo}</h5>
                <BotaoOuvir texto={e.texto} label={`Ouvir: ${e.titulo}`} />
              </div>
              <p className="mt-2 text-lg leading-relaxed break-words text-sky-950">{e.texto}</p>
            </div>
          ))}
        </section>
      ) : null}

      {leituras.length > 0 ? (
        <section aria-labelledby="devocional-leituras" className="flex flex-col gap-2">
          <h4 id="devocional-leituras" className="text-sm font-black text-slate-700">
            Para ler com calma na semana
          </h4>
          <ul className="flex flex-wrap gap-2">
            {leituras.map((l) => (
              <li key={l}>
                <Etiqueta>{l}</Etiqueta>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="flex flex-col gap-3">
        {lidoAtual ? (
          <p className="rounded-3xl bg-emerald-100 p-4 text-center text-base font-black text-emerald-900 ring-2 ring-emerald-300">
            Você já leu este dia ✅ Dá para voltar e ler de novo quando quiser.
          </p>
        ) : null}

        <button
          type="button"
          onClick={avancar}
          className="ui-press flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 text-xl font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
        >
          {lidoAtual
            ? 'Ir para o próximo dia ▶'
            : 'Marcar como lido ⭐'}
        </button>

        <p className="px-2 text-center text-sm leading-relaxed font-bold text-slate-600">
          Aqui não existe errar: pode voltar, reler e praticar no seu tempo. 💛
        </p>
      </footer>
    </div>
  ) : null;

  /* ──────────────────────────────── casca ──────────────────────────────── */

  // Sem `subtitle` no GameShell: lá o subtítulo sai em `text-white/85`, que é
  // ilegível no fundo claro deste jogo (achado de contraste no GameShell.tsx:90,
  // que afeta os outros jogos de fundo claro). O mesmo texto entra na biblioteca
  // com cor própria, abaixo do título.
  return (
    <GameShell
      title="Devocional da Semana"
      onExit={onExit}
      bg="bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50"
      titleClass="text-amber-800"
    >
      {/* Confete fora de qualquer wrapper com `transform` (senão o `fixed` dele
          vira `absolute` e cai no lugar errado). */}
      {tela === 'capa' && resumo && !reducedMotion ? (
        <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
      ) : null}

      {/* Coluna rolável: o texto do dia não cabe na altura da tela do celular. */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain px-3 pb-8">
        {tela === 'biblioteca' ? biblioteca : null}
        {tela === 'capa' ? capa : null}
        {tela === 'dia' ? telaDia : null}
      </div>
    </GameShell>
  );
}