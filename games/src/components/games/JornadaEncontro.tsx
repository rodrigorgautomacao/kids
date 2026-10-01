// A carta do encontro — o coração de *O Peregrino* dentro do platformer.
//
// Regras desta tela (ADR-010, `jogos-biblicos` §3/§5, `jogos-qa` §1):
//  · O NPC FALA primeiro (voz), a escolha vem depois, e a REFERÊNCIA NAA só
//    aparece DEPOIS do acerto (regra de ouro da casa).
//  · Errar NUNCA pune: a opção errada é riscada e corrigida com doçura pela
//    própria personagem; a criança escolhe de novo. Sem game over, sem perder
//    semente, selo ou estrela.
//  · Alvos grandes (≥ 48 px), texto curto, 🔊 em toda linha falada.

import { useEffect, useState } from 'react';
import Npc, { type NpcLook } from '../art/Npc';
import SpeakChip from '../SpeakChip';
import { sfx, voice } from '../../lib/audio';
import type { Encontro } from '../../lib/jornada/encontros';

/** Cada personagem de Bunyan com sua própria aparência (sem emoji, arte real). */
const NPC_LOOK: Record<string, Partial<NpcLook> & { halo: string }> = {
  'O Evangelista': { robe: '#0369a1', headwear: 'hood', headwearColor: '#e2e8f0', hairStyle: 'long', hair: '#e2e8f0', halo: '#38bdf8' },
  'A Boa Vontade': { robe: '#ca8a04', headwear: 'headband', headwearColor: '#facc15', hair: '#78350f', halo: '#fde047' },
  'O Intérprete': { robe: '#6d28d9', beard: true, beardColor: '#e5e7eb', beardStyle: 'long', halo: '#c4b5fd' },
  'Pliável': { robe: '#475569', headwear: 'hood', headwearColor: '#94a3b8', hairStyle: 'short', halo: '#94a3b8' },
  'As Quatro Companheiras': { robe: '#be185d', headwear: 'hood', headwearColor: '#fbcfe8', hair: '#7c2d12', halo: '#f9a8d4' },
  'A Voz que Orienta': { robe: '#0f172a', headwear: 'hood', headwearColor: '#64748b', hair: '#1e293b', halo: '#e2e8f0' },
  'O Mercador da Feira': { robe: '#b91c1c', headwear: 'headband', headwearColor: '#f59e0b', hair: '#111827', halo: '#fb923c' },
  'O Grande Desespero': { robe: '#334155', headwear: 'hood', headwearColor: '#1e293b', hair: '#0f172a', halo: '#64748b' },
  'A Ignorância': { robe: '#0891b2', hairStyle: 'buzz', hair: '#111827', halo: '#22d3ee' },
  'O Senhor do Mundo': { robe: '#7c2d12', headwear: 'headband', headwearColor: '#fbbf24', hair: '#1c1917', halo: '#fbbf24' },
  'A Esperança': { robe: '#15803d', headwear: 'hood', headwearColor: '#bbf7d0', hair: '#78350f', halo: '#4ade80' },
  'Os Dois Seres Brilhantes': { robe: '#e2e8f0', headwear: 'none', hair: '#fde047', halo: '#fef9c3' },
};

interface Props {
  encontro: Encontro;
  smallKids: boolean;
  onResolver: (acerto: string, ref: string, efeito: Encontro['efeito']) => void;
}

export default function JornadaEncontro({ encontro, smallKids, onResolver }: Props) {
  const [tentadas, setTentadas] = useState<number[]>([]);
  const [eco, setEco] = useState<string | null>(null);
  const [acertou, setAcertou] = useState(false);
  const [tremor, setTremor] = useState(0);

  const identidade = NPC_LOOK[encontro.npc] ?? { robe: '#0ea5e9', halo: '#38bdf8' };
  const { halo, ...look } = identidade;
  const certa = encontro.opcoes.findIndex((o) => o.certa);

  // Narração: o NPC apresenta a situação (skill `jogos-audio` §2: sequência,
  // nunca tudo em cima).
  useEffect(() => {
    voice.stopSpeaking();
    const t1 = window.setTimeout(() => voice.speak(`${encontro.npc} diz: ${encontro.fala}`), 350);
    return () => window.clearTimeout(t1);
  }, [encontro.id, encontro.npc, encontro.fala]);

  // No Modo Pequeninos, as opções também são faladas.
  useEffect(() => {
    if (!smallKids || acertou) return;
    const t = window.setTimeout(
      () => voice.speakQueue(encontro.opcoes.filter((_, i) => !tentadas.includes(i)).map((o) => o.texto)),
      2600 + encontro.fala.length * 30,
    );
    return () => window.clearTimeout(t);
  }, [smallKids, encontro.id, acertou]);

  const escolher = (i: number) => {
    if (acertou || tentadas.includes(i)) return;
    const op = encontro.opcoes[i];
    if (op.certa) {
      setAcertou(true);
      sfx.correct();
      voice.speak(`${encontro.acerto} ${encontro.ref}`);
      return;
    }
    // Erro sem punição: risca, explica e devolve a escolha.
    sfx.gentle();
    setTremor((n) => n + 1);
    setTentadas((t) => [...t, i]);
    setEco(op.eco ?? 'Ainda não é essa. Tente de novo.');
    voice.speak(op.eco ?? 'Ainda não é essa. Tente de novo.');
  };

  return (
    <div className="absolute inset-0 z-[65] flex items-center justify-center bg-slate-950/75 p-3">
      <div
        key={tremor}
        className={`screen-in flex max-h-full w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-3xl bg-slate-900/95 p-4 shadow-2xl ${acertou ? 'ring-4 ring-amber-300/60' : 'ring-2 ring-white/15'}`}
      >
        {/* Personagem + situação */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <div
              className="rounded-2xl p-1"
              style={{ background: `${halo}33`, boxShadow: `0 0 18px ${halo}55` }}
            >
              <Npc
                motif="jornada"
                look={look}
                state={acertou ? 'happy' : 'idle'}
                size={72}
                className="rounded-xl"
              />
            </div>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-black text-white">
              {encontro.npc}
            </span>
          </div>
          <div className="relative flex-1 rounded-2xl bg-white/10 p-3">
            <SpeakChip text={encontro.fala} className="absolute -top-2 -right-2" />
            <p className="pr-6 text-[15px] font-bold text-white/90">{encontro.fala}</p>
            <p className="mt-1 text-[11px] font-semibold text-white/60">{encontro.papel}</p>
          </div>
        </div>

        {/* Escolhas */}
        <div className="flex flex-col gap-2">
          {encontro.opcoes.map((op, i) => {
            const errada = tentadas.includes(i);
            const winner = acertou && i === certa;
            return (
              <div key={i} className="relative">
                <button
                  type="button"
                  disabled={errada || acertou}
                  onClick={() => escolher(i)}
                  className={`ui-press w-full rounded-2xl px-4 py-3 text-left text-[15px] font-bold shadow-md transition-all ${
                    winner
                      ? 'bg-emerald-400 text-emerald-950 ring-4 ring-emerald-300'
                      : errada
                        ? 'bg-slate-700/60 text-white/40 line-through'
                        : 'bg-white text-slate-800 hover:bg-amber-50'
                  }`}
                >
                  <span className="pr-7">{op.texto}</span>
                </button>
                {!errada && !acertou ? <SpeakChip text={op.texto} className="absolute top-2 right-2" /> : null}
              </div>
            );
          })}
        </div>

        {eco && !acertou ? (
          <p className="rounded-2xl bg-amber-100/10 px-3 py-2 text-sm font-bold text-amber-100">
            {encontro.npc}: “{eco}”
          </p>
        ) : null}

        {acertou ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-emerald-400/10 p-3">
            <p className="text-sm font-bold text-emerald-100">{encontro.acerto}</p>
            <p className="text-xs font-black text-amber-300">{encontro.ref}</p>
            <button
              type="button"
              onClick={() => {
                sfx.streak(1);
                onResolver(encontro.acerto, encontro.ref, encontro.efeito);
              }}
              className="ui-press mt-1 w-full rounded-full bg-amber-300 px-6 py-3 text-base font-black text-slate-900 shadow-lg"
            >
              Seguir ➜
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
