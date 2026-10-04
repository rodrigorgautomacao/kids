// "Estudo da Semana" — o currículo do mês (Escola Bíblica infantil, Pentateuco +
// tema especial) dentro do jogo.
//
// 🔒 REGRA DE OURO DESTA TELA (ADR-001, versão NAA)
// O jogo **nunca mostra texto bíblico**. Em `data/estudoSemana.ts`,
// `referencias[].texto` vem vazio de propósito: a redação NAA não pode ser
// reproduzida aqui (a única exceção é 2 Timóteo 3.16-17, que está atestada na
// fonte). O que a tela mostra é a **REFERÊNCIA** + o convite "Abra a Bíblia em
// casa e leia" — é o hábito que o jogo existe para ensinar, não o texto.
//
// 🔒 TOM DE GRAÇA (`jogos-biblicos` §5, `jogos-narrativa` §3)
// Errar a pergunta **não pune e não reprova**: som macio e descendente
// (`sfx.wrong`), a alternativa fica marcada como "tentamos" e a EXPLICAÇÃO
// aparece — é ela quem ensina. Nenhuma alternativa trava, sempre dá para tocar
// de novo, e a estrela é `starsForWrong` (0 erro = 3 ⭐). Nunca há som de buzz,
// nunca há reprovação, nunca há triângulo na tela.
//
// A PERGUNTA é o jogo — mas ela nunca é parede: a lição inteira fica na tela e
// a criança pode pular a pergunta e continuar lendo.
//
// ORDEM DA LIÇÃO = estrutura de 3 tempos (`jogos-narrativa` §1): as referências
// primeiro (é para onde a história leva), depois HISTÓRIA → IDEIA → PERGUNTA →
// PRATICANDO → leituras. Nada fora de ordem.
//
// ORDEM DE TELAS: biblioteca → lição → concluída. Tudo determinístico: nada de
// `Math.random()` nem `Date.now()` escolhendo ordem, tela ou faixa.

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Check, RotateCcw, Star, X } from 'lucide-react';
import GameShell from '../GameShell';
import LevelDone from '../LevelDone';
import SpeakChip from '../SpeakChip';
import { sfx, voice } from '../../lib/audio';
import { burst, ring } from '../../lib/fx';
import { starsForWrong } from '../../lib/minigame';
import { isSmallKidsMode } from '../../lib/prefs';
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
  ESTUDO_MES_ATUAL,
  MESES_ESTUDO,
  TRILHOS,
  licoesDoMes,
  licoesPorTema,
  type LicaoEstudo,
  type TrilhoEstudo,
} from '../../data/estudoSemana';

const GAME_ID = 'estudo-da-semana';

/** O usuário escolhe entre as três idades. `todos` NÃO é escolha: é conteúdo
 *  (o tema do mês, semana 0) que aparece junto com a lição da semana. */
const TRILHOS_ESCOLHA: TrilhoEstudo[] = ['baby', '4-6', '7-9'];

/** Escolha de idade da família, para o jogo abrir na faixa certa da outra vez. */
const KEY_TRILHO = 'kids-estudo-trilho-v1';

/** Meses em pt-BR — formatados à mão (nada de `toLocaleDateString`: a data
 *  muda com o fuso do aparelho e o rótulo da lição tem que ser estável). */
const MESES_PT: Record<number, string> = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 5: 'Maio', 6: 'Junho',
  7: 'Julho', 8: 'Agosto', 9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro',
};

/* ------------------------------- formatação ------------------------------- */

/** '2026-10' → 'Outubro 2026' */
function formatarMes(mesId: string): string {
  const partes = mesId.split('-');
  const ano = partes[0] ?? '';
  const mes = partes[1] ?? '';
  return `${MESES_PT[Number(mes)] ?? mes} ${ano}`.trim();
}

/** '2026-10' → 'de outubro' (para "Semana 2 de outubro") */
function formatarMesBaixo(mesId: string): string {
  const [, mes] = mesId.split('-');
  const nome = MESES_PT[Number(mes)];
  return nome ? `de ${nome.toLowerCase()}` : '';
}

/** Semana 0 é o TEMA DO MÊS (vale para todas as idades), não uma semana. */
function etiquetaSemana(licao: LicaoEstudo): string {
  if (licao.semana === 0) return 'Tema do mês';
  return `Semana ${licao.semana} ${formatarMesBaixo(licao.mes)}`;
}

/** A referência que abre a lição (a que sustenta a história). */
function refPrincipal(licao: LicaoEstudo): string {
  return licao.referencias[0]?.ref ?? '';
}

/** Ordem de leitura: o tema do mês (semana 0) primeiro, depois semana 1..4. */
function ordemDeEstudo(a: LicaoEstudo, b: LicaoEstudo): number {
  return (a.semana === 0 ? -1 : a.semana) - (b.semana === 0 ? -1 : b.semana);
}

function trilhoSalvo(): TrilhoEstudo | null {
  try {
    const bruto = localStorage.getItem(KEY_TRILHO);
    return bruto === 'baby' || bruto === '4-6' || bruto === '7-9' ? bruto : null;
  } catch {
    return null;
  }
}

function guardarTrilho(trilho: TrilhoEstudo): void {
  try {
    localStorage.setItem(KEY_TRILHO, trilho);
  } catch {
    /* armazenamento indisponível: a escolha vale só nesta sessão */
  }
}

/**
 * Faixa inicial.
 *
 * 1. A escolha da família manda (ela é salva quando o adulto troca a idade);
 * 2. sem escolha, é `baby` — o piso do mês. Motivo: o modo pequeninos é a única
 *    pista do aparelho e ela só apontaria para `baby` mesmo (a faixa que não
 *    lê), e `baby` é o material mais simples — funciona para todas as idades.
 *
 * 🔒 Nenhum `Date.now()` aqui: a faixa não pode mudar sozinha com o relógio
 * (senão a mesma família abre a tela em lições diferentes).
 */
function trilhoInicial(): TrilhoEstudo {
  return trilhoSalvo() ?? 'baby';
}

/** Mês inicial: o mês em foco do app (cai no último disponível se mudar). */
function mesInicial(): string {
  const meses = MESES_ESTUDO.map((m) => m.id);
  if (meses.includes(ESTUDO_MES_ATUAL)) return ESTUDO_MES_ATUAL;
  return meses[meses.length - 1] ?? ESTUDO_MES_ATUAL;
}

/* ----------------------------- blocos de tela ------------------------------ */

/** 3 estrelas. Ícone + rótulo textual — a cor nunca é o único canal. */
function Estrelas({ n }: { n: number }) {
  return (
    <span role="img" aria-label={`${n} de 3 estrelas`} className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={`h-4 w-4 ${i <= n ? 'fill-yellow-400 text-yellow-500' : 'text-slate-300'}`}
        />
      ))}
    </span>
  );
}

/** O que a criança já fez nesta lição: lida · praticada · pergunta respondida. */
function Marcas({ u }: { u: UnidadeLeitura }) {
  const feitas = [
    { ok: temMarca(u, 'lido'), texto: '📖 Lida' },
    { ok: temMarca(u, 'praticado'), texto: '✋ Praticada' },
    { ok: temMarca(u, 'respondido'), texto: '💬 Pergunta' },
  ].filter((m) => m.ok);
  if (feitas.length === 0) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
        Para ler
      </span>
    );
  }
  return (
    <span className="flex flex-wrap gap-1">
      {feitas.map((m) => (
        <span
          key={m.texto}
          className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-900 ring-1 ring-emerald-300"
        >
          {m.texto}
        </span>
      ))}
    </span>
  );
}

interface CartaoProps {
  licao: LicaoEstudo;
  u: UnidadeLeitura;
  onAbrir: (licao: LicaoEstudo) => void;
}

/** Cartão de uma lição na biblioteca: semana, título, tema, referência e o que
 *  já foi feito. O alvo é o cartão inteiro (≥ 44 px de altura em qualquer tela). */
function CartaoLicao({ licao, u, onAbrir }: CartaoProps) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx.open();
        onAbrir(licao);
      }}
      className="ui-press flex w-full flex-col gap-1.5 rounded-3xl bg-white p-3 text-left shadow-lg ring-2 ring-amber-200 hover:bg-amber-50 hover:ring-amber-400"
    >
      <span className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black tracking-wide text-amber-900 uppercase ring-1 ring-amber-300">
          {etiquetaSemana(licao)}
        </span>
        <Estrelas n={u.best} />
      </span>
      <span className="text-lg leading-tight font-black text-slate-900">{licao.titulo}</span>
      <span className="text-sm font-bold text-slate-600">{licao.tema}</span>
      <span className="text-sm font-black text-sky-800">📖 {refPrincipal(licao)}</span>
      <Marcas u={u} />
    </button>
  );
}

/* ---------------------------------- tela ----------------------------------- */

type Tela = 'biblioteca' | 'licao' | 'concluida';
type Visao = 'semana' | 'tema';

export default function GameEstudoDaSemana({ onExit }: { onExit: () => void }) {
  /* ------------------------------- estado ------------------------------- */
  const [store, setStore] = useState<LeituraStore>(loadLeitura);
  const [trilho, setTrilho] = useState<TrilhoEstudo>(trilhoInicial);
  const [mesId, setMesId] = useState<string>(mesInicial);
  const [visao, setVisao] = useState<Visao>('semana');
  const [tela, setTela] = useState<Tela>('biblioteca');
  const [licao, setLicao] = useState<LicaoEstudo | null>(null);
  /** Índices das alternativas erradas já reveladas (a explicação fica). */
  const [tentadas, setTentadas] = useState<number[]>([]);
  const [certa, setCerta] = useState(false);
  const [errados, setErrados] = useState(0);
  const [confirmar, setConfirmar] = useState(false);

  const rolagem = useRef<HTMLDivElement>(null);
  const painel = useRef<HTMLElement>(null);

  // Histórico reage a mudanças feitas em outra tela (mesmo contrato dos selos).
  useEffect(() => subscribeLeitura(() => setStore(loadLeitura())), []);

  // Ao sair da tela: nada continua falando (voz do aparelho é global).
  useEffect(
    () => () => {
      voice.stopSpeaking();
    },
    [],
  );

  // Tela nova começa no topo (o conteúdo é rolável, o cabeçalho fica).
  useEffect(() => {
    if (rolagem.current) rolagem.current.scrollTop = 0;
  }, [tela, licao]);

  // A PERGUNTA é narrada ANTES das opções: quem ainda não lê (0–3 e parte dos
  // 4–6) precisa ouvir o enunciado e cada escolha, nessa ordem. Na faixa 7–9 a
  // leitura é o canal principal — lá a narração só acontece quando pedem (🔊).
  useEffect(() => {
    if (tela !== 'licao' || !licao) return;
    if (trilho === '7-9') return;
    const t = window.setTimeout(
      () => voice.speakQueue([licao.pergunta.enunciado, ...licao.pergunta.alternativas]),
      700,
    );
    return () => window.clearTimeout(t);
  }, [tela, licao, trilho]);

  /* ------------------------------- derivados ----------------------------- */
  const licoesMes = useMemo(() => [...licoesDoMes(mesId, trilho)].sort(ordemDeEstudo), [mesId, trilho]);

  const idsMes = useMemo(() => licoesMes.map((l) => l.id), [licoesMes]);

  const prog = useMemo(() => progresso(store, GAME_ID, idsMes), [store, idsMes]);

  /** "por tema": agrupa as lições pelo tema, usando `licoesPorTema`. */
  const temasDoMes = useMemo(() => {
    const lista: string[] = [];
    for (const l of licoesMes) if (!lista.includes(l.tema)) lista.push(l.tema);
    return lista;
  }, [licoesMes]);

  const gruposTema = useMemo(
    () =>
      temasDoMes
        .map((tema) => ({
          tema,
          licoes: licoesPorTema(tema, trilho).filter((l) => l.mes === mesId),
        }))
        .filter((g) => g.licoes.length > 0),
    [temasDoMes, trilho, mesId],
  );

  const mes = MESES_ESTUDO.find((m) => m.id === mesId);

  const temProgresso = idsMes.some((id) => {
    const u = unidade(store, GAME_ID, id);
    return u.best > 0 || u.plays > 0 || u.marcas.length > 0;
  });

  const indice = licao ? licoesMes.findIndex((l) => l.id === licao.id) : -1;
  const proxima = indice >= 0 && indice + 1 < licoesMes.length ? licoesMes[indice + 1] : null;

  /* -------------------------------- ações ------------------------------- */
  function sair() {
    voice.stopSpeaking();
    onExit();
  }

  function escolherTrilho(novo: TrilhoEstudo) {
    if (novo === trilho) return;
    sfx.click();
    setTrilho(novo);
    guardarTrilho(novo);
  }

  function abrirLesson(alvo: LicaoEstudo) {
    voice.stopSpeaking();
    setLicao(alvo);
    setTentadas([]);
    setCerta(false);
    setErrados(0);
    setTela('licao');
    // Ler é o primeiro passo: a lição entra no histórico como 'lido' na hora
    // de abrir (marca aditiva e idempotente — nada é perdido ao recarregar).
    setStore(marcar(store, GAME_ID, alvo.id, 'lido'));
    avisarLeitura();
  }

  function voltarBiblioteca() {
    voice.stopSpeaking();
    setTela('biblioteca');
    setLicao(null);
  }

  function responder(indiceAlt: number, ev: MouseEvent<HTMLButtonElement>) {
    if (!licao || certa) return;
    const p = licao.pergunta;

    if (indiceAlt === p.correta) {
      setCerta(true);
      sfx.correct();
      // 🥳 Juice: a estrela cai no ponto tocado (o host é o painel da lição).
      const el = ev.currentTarget;
      const box = painel.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - (box?.left ?? 0);
      const y = r.top + r.height / 2 - (box?.top ?? 0);
      burst(painel.current, x, y, { kind: 'spark', count: 18 });
      ring(painel.current, x, y, '#34d399', 42);
      voice.speak(p.explicacao);
      return;
    }

    // Errou: som macio e descendente + a explicação aparece. A alternativa fica
    // marcada e DÁ PARA TOCAR DE NOVO — nada trava, nada é punido.
    sfx.wrong();
    setTentadas((prev) => (prev.includes(indiceAlt) ? prev : [...prev, indiceAlt]));
    // Só uma alternativa nova conta como erro: insistir na mesma não tira
    // estrela (a criança que insiste aprende no mesmo ritmo).
    setErrados((n) => (tentadas.includes(indiceAlt) ? n : n + 1));
    voice.speak(p.explicacao);
  }

  function marcarPraticado() {
    if (!licao) return;
    if (temMarca(unidade(store, GAME_ID, licao.id), 'praticado')) return;
    sfx.collect();
    setStore(marcar(store, GAME_ID, licao.id, 'praticado'));
    avisarLeitura();
    voice.speak('Muito bem! Você praticou esta lição.');
  }

  function terminarLesson() {
    if (!licao) return;
    sfx.click();
    // `concluir` nunca rebaixa a estrela (`best` é o máximo) — reler não pune.
    setStore(concluir(store, GAME_ID, licao.id, errados, 'respondido'));
    avisarLeitura();
    setTela('concluida');
  }

  function irParaProxima() {
    if (proxima) abrirLesson(proxima);
    else voltarBiblioteca();
  }

  function apagarTudo() {
    sfx.click();
    setStore(limparJogo(store, GAME_ID));
    avisarLeitura();
    setConfirmar(false);
  }

  /* --------------------------------- casca ------------------------------- */
  const BG = 'bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50';
  const TITULO = 'text-amber-700';

  // ── 1. BIBLIOTECA ──────────────────────────────────────────────────────────
  if (tela === 'biblioteca') {
    return (
      <GameShell
        title="Estudo da Semana"
        subtitle="Uma lição por semana — do começo do mês ao fim"
        onExit={sair}
        bg={BG}
        titleClass={TITULO}
      >
        <div ref={rolagem} className="flex w-full flex-1 flex-col overflow-y-auto px-3 pb-6 sm:px-4">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
            {/* faixa (idade) */}
            <section className="flex flex-col gap-2 rounded-3xl bg-white/95 p-3 shadow-lg">
              <h3 className="text-sm font-black tracking-wide text-slate-600 uppercase">
                Para qual idade?
              </h3>
              <div role="group" aria-label="Escolher a idade" className="flex flex-col gap-2 sm:flex-row">
                {TRILHOS_ESCOLHA.map((id) => {
                  const info = TRILHOS.find((t) => t.id === id);
                  const ativo = trilho === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => escolherTrilho(id)}
                      aria-pressed={ativo}
                      className={`ui-press flex min-h-14 flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 text-center ${
                        ativo
                          ? 'bg-amber-400 text-amber-950 shadow-[0_4px_0_rgba(180,83,9,0.9)] ring-4 ring-amber-600/40'
                          : 'bg-amber-50 text-slate-700 ring-2 ring-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span className="text-base leading-tight font-black">
                        {ativo ? '✓ ' : ''}
                        {info?.nome ?? id}
                      </span>
                      <span className={`text-xs font-bold ${ativo ? 'text-amber-900' : 'text-slate-500'}`}>
                        {info?.idade ?? ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-slate-600">
                📢 Este mês traz ainda o tema para todas as idades: {mes?.tema ?? '—'}
              </p>
            </section>

            {/* mês */}
            <section className="flex flex-col gap-2 rounded-3xl bg-white/95 p-3 shadow-lg">
              <h3 className="text-sm font-black tracking-wide text-slate-600 uppercase">Qual mês?</h3>
              <div role="group" aria-label="Escolher o mês" className="flex flex-wrap gap-2">
                {MESES_ESTUDO.map((m) => {
                  const ativo = mesId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        sfx.click();
                        setMesId(m.id);
                      }}
                      aria-pressed={ativo}
                      className={`ui-press flex min-h-14 w-full flex-col items-start justify-center rounded-2xl px-3 py-2 text-left sm:flex-1 sm:basis-40 ${
                        ativo
                          ? 'bg-sky-600 text-white shadow-[0_4px_0_rgba(7,89,133,0.9)]'
                          : 'bg-sky-50 text-slate-700 ring-2 ring-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      <span className="text-base leading-tight font-black">
                        {ativo ? '✓ ' : ''}
                        {m.nome}
                      </span>
                      <span className={`text-xs font-bold ${ativo ? 'text-sky-50' : 'text-sky-800'}`}>
                        {m.tema}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* progresso + filtro */}
            <section className="flex flex-col gap-2 rounded-3xl bg-white/95 p-3 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black text-slate-700">
                  {formatarMes(mesId)}: {prog.lidos}/{idsMes.length} lições lidas
                </span>
                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 ring-1 ring-amber-300">
                  {prog.estrelas} ⭐ de {prog.maxEstrelas}
                </span>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Lições lidas neste mês"
                aria-valuemin={0}
                aria-valuemax={idsMes.length}
                aria-valuenow={prog.lidos}
              >
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${prog.percent}%` }} />
              </div>
              <div role="group" aria-label="Como escolher a lição" className="flex gap-2">
                {(
                  [
                    ['semana', 'Por semana'],
                    ['tema', 'Por tema'],
                  ] as Array<[Visao, string]>
                ).map(([id, rotulo]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      sfx.click();
                      setVisao(id);
                    }}
                    aria-pressed={visao === id}
                    className={`ui-press min-h-11 flex-1 rounded-full px-4 py-2 text-sm font-black ${
                      visao === id
                        ? 'bg-slate-800 text-white shadow-[0_4px_0_rgba(2,6,23,0.9)]'
                        : 'bg-slate-100 text-slate-700 ring-2 ring-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            </section>

            {/* lista */}
            {licoesMes.length === 0 ? (
              <p className="rounded-3xl bg-white/95 p-6 text-center text-base font-black text-slate-600 shadow-lg">
                Ainda não há lições neste mês. Volte quando o material entrar. 📖
              </p>
            ) : null}

            {visao === 'semana' ? (
              <ul className="flex flex-col gap-2">
                {licoesMes.map((l) => (
                  <li key={l.id}>
                    <CartaoLicao
                      licao={l}
                      u={unidade(store, GAME_ID, l.id)}
                      onAbrir={(alvo) => abrirLesson(alvo)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-4">
                {gruposTema.map((g) => (
                  <section key={g.tema} className="flex flex-col gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-black tracking-wide text-slate-700 uppercase">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                      {g.tema}
                      <span className="h-px flex-1 bg-slate-300" aria-hidden />
                      <span className="text-xs font-bold text-slate-500">
                        {g.licoes.length} {g.licoes.length === 1 ? 'lição' : 'lições'}
                      </span>
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {g.licoes.map((l) => (
                        <li key={l.id}>
                          <CartaoLicao
                            licao={l}
                            u={unidade(store, GAME_ID, l.id)}
                            onAbrir={(alvo) => abrirLesson(alvo)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            {/* recomeçar (discreto + confirmação) */}
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setConfirmar(true);
              }}
              disabled={!temProgresso}
              className="ui-press mx-auto flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-black text-slate-600 shadow ring-2 ring-slate-200 disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" /> Recomeçar
            </button>
            <p className="pb-2 text-center text-[11px] font-bold text-slate-500">
              NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do Brasil. Usada com
              permissão.
            </p>
          </div>
        </div>

        {confirmar ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Recomeçar o estudo"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4"
          >
            <div className="animate-pop flex w-full max-w-sm flex-col gap-3 rounded-3xl bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl leading-tight font-black text-slate-900">
                  Apagar o que você já estudou?
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    setConfirmar(false);
                  }}
                  aria-label="Fechar a confirmação"
                  className="ui-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm font-bold text-slate-600">
                As estrelas e as marcas de <b>todo</b> o estudo serão apagadas. Tudo pode ser
                estudado de novo — ler nunca acaba.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={apagarTudo}
                  className="ui-press min-h-12 rounded-2xl bg-amber-400 px-5 py-3 text-base font-black text-amber-950 shadow-[0_4px_0_rgba(180,83,9,0.9)]"
                >
                  Sim, apagar e recomeçar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.click();
                    setConfirmar(false);
                  }}
                  className="ui-press min-h-12 rounded-2xl bg-slate-100 px-5 py-3 text-base font-black text-slate-700 ring-2 ring-slate-300"
                >
                  Não, voltar
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </GameShell>
    );
  }

  // ── 2. LIÇÃO ──────────────────────────────────────────────────────────────
  if (tela === 'licao' && licao) {
    const p = licao.pergunta;
    const explicacaoVisivel = certa || tentadas.length > 0;
    const praticado = temMarca(unidade(store, GAME_ID, licao.id), 'praticado');
    // Modo pequeninos (pré-leitora): a mesma tela com letras maiores.
    const pequeno = isSmallKidsMode();
    const corpo = pequeno ? 'text-xl' : 'text-lg';
    const destaque = pequeno ? 'text-2xl' : 'text-xl';

    return (
      <GameShell
        title="Estudo da Semana"
        subtitle={`${etiquetaSemana(licao)} · ${formatarMes(licao.mes)}`}
        onExit={sair}
        bg={BG}
        titleClass={TITULO}
      >
        <div ref={rolagem} className="flex w-full flex-1 flex-col overflow-y-auto px-3 pb-6 sm:px-4">
          <article
            ref={painel}
            className="relative mx-auto flex w-full max-w-2xl flex-col gap-4"
          >
            {/* cabeçalho */}
            <header className="rounded-3xl bg-white/95 p-4 shadow-lg ring-2 ring-amber-200">
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-black tracking-wide text-amber-900 uppercase ring-1 ring-amber-300">
                {etiquetaSemana(licao)}
              </span>
              <h3 className="mt-2 text-2xl leading-tight font-black text-slate-900 sm:text-3xl">
                {licao.titulo}
              </h3>
              <p className="text-sm font-black text-amber-800">{licao.tema}</p>
            </header>

            {/* REFERÊNCIAS — a porta de entrada: a história leva para lá */}
            <section
              aria-labelledby="estudo-refs"
              className="flex flex-col gap-2 rounded-3xl bg-sky-100 p-4 ring-2 ring-sky-300"
            >
              <div className="flex items-center gap-2">
                <h4 id="estudo-refs" className="text-lg font-black text-sky-950">
                  📖 Leia na Bíblia
                </h4>
                <SpeakChip
                  text={`${licao.referencias.map((r) => r.ref).join(', ')}. Abra a Bíblia em casa e leia.`}
                  className="ml-auto"
                  label="Ouvir as referências"
                />
              </div>
              <ul className="flex flex-wrap gap-2">
                {licao.referencias.map((r) => (
                  <li key={r.ref} className="flex flex-col gap-1">
                    <span className="inline-flex items-center rounded-2xl bg-white px-3 py-2 text-base font-black text-sky-900 ring-2 ring-sky-400">
                      {r.ref}
                    </span>
                    {/* `texto` só vem preenchido quando a fonte atesta a redação
                        (hoje: 2 Timóteo 3.16-17). Nunca preencha à mão: a redação
                        bíblica não é editável na tela, é só convite a ler. */}
                    {r.texto ? (
                      <span className="max-w-xs rounded-2xl bg-white/80 px-3 py-2 text-sm font-bold text-sky-950">
                        {r.texto}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-black text-sky-950">Abra a Bíblia em casa e leia. 📖</p>
            </section>

            {trilho === 'baby' ? (
              <p className="rounded-3xl bg-amber-100 p-3 text-sm font-black text-amber-950 ring-2 ring-amber-300">
                👨‍👩‍👧 Um adulto lê esta lição em voz alta com a criança. Toque em 🔊 para ouvir
                de novo.
              </p>
            ) : null}

            {/* 1. A HISTÓRIA */}
            <section
              aria-labelledby="estudo-historia"
              className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <h4 id="estudo-historia" className="text-lg font-black text-slate-900">
                  🗺️ A história
                </h4>
                <SpeakChip text={licao.historia} className="ml-auto" label="Ouvir a história" />
              </div>
              <p className={`${corpo} leading-relaxed font-bold text-slate-800`}>{licao.historia}</p>
            </section>

            {/* 2. A IDEIA — a única mensagem, a que ela leva */}
            <section
              aria-labelledby="estudo-ideia"
              className="flex flex-col gap-2 rounded-3xl bg-amber-200 p-4 ring-4 ring-amber-400"
            >
              <div className="flex items-center gap-2">
                <h4 id="estudo-ideia" className="text-lg font-black text-amber-950">
                  💡 A ideia de hoje
                </h4>
                <SpeakChip text={licao.ideia} className="ml-auto" label="Ouvir a ideia" />
              </div>
              <p className={`${destaque} leading-snug font-black text-amber-950`}>{licao.ideia}</p>
            </section>

            {/* 3. A PERGUNTA — é o jogo */}
            <section
              aria-labelledby="estudo-pergunta"
              className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-lg"
            >
              <div className="flex items-start gap-2">
                <h4 id="estudo-pergunta" className="text-lg font-black text-slate-900">
                  ❓ Perguntinha
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    sfx.pop();
                    // A pergunta é narrada ANTES das opções: quem não lê ainda
                    // precisa ouvir o enunciado e cada escolha, nessa ordem.
                    voice.speakQueue([p.enunciado, ...p.alternativas]);
                  }}
                  aria-label="Ouvir a pergunta e as opções"
                  className="ui-press ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md"
                >
                  🔊
                </button>
              </div>
              <p className={`${destaque} leading-snug font-black text-slate-900`}>{p.enunciado}</p>

              <ul className="flex flex-col gap-2">
                {p.alternativas.map((alt, i) => {
                  const marksRight = certa && i === p.correta;
                  const marksTentada = !certa && tentadas.includes(i);
                  return (
                    <li key={alt} className="relative">
                      <button
                        type="button"
                        onClick={(ev) => responder(i, ev)}
                        disabled={certa}
                        className={`ui-press flex min-h-14 w-full flex-col items-start gap-1 rounded-2xl py-3 pr-14 pl-3 text-left font-black shadow ring-2 ${
                          pequeno ? 'text-xl' : 'text-lg'
                        } ${
                          marksRight
                            ? 'bg-emerald-100 text-emerald-950 ring-4 ring-emerald-500'
                            : marksTentada
                              ? 'bg-amber-100 text-amber-950 ring-2 ring-dashed ring-amber-500'
                              : 'bg-white text-slate-800 ring-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        <span className="flex w-full items-center gap-3">
                          <span
                            aria-hidden
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-black ${
                              marksRight ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {marksRight ? <Check className="h-5 w-5" /> : i + 1}
                          </span>
                          <span className="flex-1">{alt}</span>
                        </span>
                        {/* O canal de estado é ÍCONE + PALAVRA, nunca só cor. */}
                        {marksRight ? (
                          <span className="pl-11 text-sm font-black text-emerald-900">
                            ✓ Isso mesmo!
                          </span>
                        ) : null}
                        {marksTentada ? (
                          <span className="pl-11 text-sm font-black text-amber-900">
                            ↺ Tente de novo
                          </span>
                        ) : null}
                      </button>
                      <SpeakChip
                        text={alt}
                        size="md"
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                        label={`Ouvir a opção: ${alt}`}
                      />
                    </li>
                  );
                })}
              </ul>

              {explicacaoVisivel ? (
                <div className="flex items-start gap-2 rounded-2xl bg-amber-100 p-3 ring-2 ring-amber-400">
                  <p className="flex-1 text-base leading-relaxed font-bold text-amber-950">
                    <span className="font-black">Por quê? </span>
                    {p.explicacao}
                  </p>
                  <SpeakChip
                    text={p.explicacao}
                    className="shrink-0"
                    label="Ouvir a explicação"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={terminarLesson}
                className="ui-press flex min-h-14 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-lg font-black text-amber-950 shadow-[0_6px_0_rgba(180,83,9,0.9)]"
              >
                {explicacaoVisivel ? 'Continuar ▶' : 'Continuar a ler ▶'}
              </button>
            </section>

            {/* 4. O PRATICANDO */}
            <section
              aria-labelledby="estudo-praticando"
              className="flex flex-col gap-2 rounded-3xl bg-emerald-50 p-4 ring-2 ring-emerald-300"
            >
              <div className="flex items-center gap-2">
                <h4 id="estudo-praticando" className="text-lg font-black text-emerald-950">
                  ✋ Praticando
                </h4>
                <SpeakChip
                  text={licao.praticando}
                  className="ml-auto"
                  label="Ouvir a atividade"
                />
              </div>
              <p className="text-base leading-relaxed font-bold text-emerald-950">
                {licao.praticando}
              </p>
              <button
                type="button"
                onClick={marcarPraticado}
                disabled={praticado}
                aria-pressed={praticado}
                className={`ui-press flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-left text-lg font-black shadow ring-2 ${
                  praticado
                    ? 'bg-emerald-600 text-white ring-emerald-700'
                    : 'bg-white text-emerald-900 ring-emerald-400 hover:bg-emerald-100'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    praticado ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {praticado ? <Check className="h-5 w-5" /> : '✋'}
                </span>
                {praticado ? 'Eu pratiquei! ✅' : 'Eu pratiquei'}
              </button>
            </section>

            {/* leituras */}
            {licao.leituras.length > 0 ? (
              <section
                aria-labelledby="estudo-leituras"
                className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-lg"
              >
                <h4 id="estudo-leituras" className="text-lg font-black text-slate-900">
                  📚 Para ler com calma
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {licao.leituras.map((r) => (
                    <li
                      key={r}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-700 ring-1 ring-slate-300"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <button
              type="button"
              onClick={voltarBiblioteca}
              className="ui-press min-h-12 rounded-full bg-white px-6 py-3 text-base font-black text-slate-700 shadow ring-2 ring-slate-200"
            >
              ← Voltar à biblioteca
            </button>
          </article>
        </div>
      </GameShell>
    );
  }

  // ── 3. CONCLUÍDA ───────────────────────────────────────────────────────────
  if (tela === 'concluida' && licao) {
    const headline =
      licao.semana === 0 ? 'Tema do mês lido!' : `Lição da semana ${licao.semana} lida!`;
    return (
      <GameShell
        title="Estudo da Semana"
        subtitle={`${etiquetaSemana(licao)} · ${formatarMes(licao.mes)}`}
        onExit={sair}
        bg={BG}
        titleClass={TITULO}
      >
        <div className="flex w-full flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pb-8">
          {/* A IDEIA fica em destaque acima da comemoração: é a mensagem que a
              criança leva para casa. O `LevelDone` só imprime a `lesson` no fim
              de um capítulo (componente compartilhado — não muda), por isso o
              mesmo texto é mostrado aqui, com 🔊, em todas as lições. */}
          <div className="flex w-full max-w-2xl flex-col gap-2 rounded-3xl bg-amber-200 p-4 ring-4 ring-amber-400">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-amber-950">💡 A ideia que fica</h3>
              <SpeakChip text={licao.ideia} className="ml-auto" label="Ouvir a ideia" />
            </div>
            <p className="text-xl leading-snug font-black text-amber-950">{licao.ideia}</p>
          </div>

          <LevelDone
            stars={starsForWrong(errados)}
            wrong={errados}
            headline={headline}
            lesson={licao.ideia}
            onNext={irParaProxima}
            onExit={onExit}
            celebrate
          />

          <p className="max-w-md text-center text-sm font-bold text-slate-700">
            {proxima
              ? `Agora: ${etiquetaSemana(proxima)} — ${proxima.titulo}`
              : 'Você terminou o mês! Escolha outra semana no menu ou volte.'}
          </p>
        </div>
      </GameShell>
    );
  }

  return null;
}