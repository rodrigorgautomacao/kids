// Livrinho de Figurinhas da Aventura (Fase 8).
//
// Coleção das 36 cenas-teatro: cada cena do catálogo tem uma figurinha que se
// ganha completando a história no palco (SceneStage). O livrinho NUNCA bloqueia
// nada — é coleção pura, para orgulho e rejogabilidade (sem moeda, sem paywall).

import { useEffect, useState } from 'react';
import { SCENES, SCENE_COUNT, scenesForCharacter, CHARACTER_IDS } from '../data/scenes';
import { loadStickers, subscribeStickers } from '../lib/stickers';
import { t } from '../lib/i18n';

/** Nome amigável de cada estação (a Aventura usa esses ids). */
const CHARACTER_LABEL: Record<string, string> = {
  noe: 'Noé',
  criacao: 'Anjo',
  elias: 'Elias',
  jonas: 'Jonas',
  eliseu: 'Eliseu',
  daniel: 'Daniel',
  natal: 'Maria',
  moises: 'Moisés',
  josue: 'Josué',
  davi: 'Davi',
  salomao: 'Salomão',
  paulo: 'Paulo',
};

const CHARACTER_EMOJI: Record<string, string> = {
  noe: '🧓',
  criacao: '👼',
  elias: '🧔',
  jonas: '🙋',
  eliseu: '🧥',
  daniel: '🧑',
  natal: '👩',
  moises: '🗿',
  josue: '📯',
  davi: '🎯',
  salomao: '🦉',
  paulo: '📜',
};

interface CollectionBookProps {
  open: boolean;
  onClose: () => void;
}

export default function CollectionBook({ open, onClose }: CollectionBookProps) {
  const [collected, setCollected] = useState<Set<string>>(loadStickers);

  // Reage em tempo real quando a Aventura coleciona uma figurinha.
  useEffect(() => {
    if (!open) return;
    const cancel = subscribeStickers(() => setCollected(loadStickers()));
    return cancel;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const got = collected.size;

  return (
    <div
      role="dialog"
      aria-label={t('book.titulo')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3"
    >
      <div className="flex max-h-[92%] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-2 rounded-t-3xl border-b-2 border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">💮 {t('book.titulo')}</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-500">{t('book.subtitulo')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-800 shadow-inner">
              {got}/{SCENE_COUNT} {t('book.coletadas')}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('book.fechar')}
              className="ui-press flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {CHARACTER_IDS.map((cid) => {
              const scenes = scenesForCharacter(cid);
              if (scenes.length === 0) return null;
              return (
                <section key={cid}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-600">
                    <span className="text-xl">{CHARACTER_EMOJI[cid]}</span>
                    {CHARACTER_LABEL[cid]}
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] font-bold text-slate-400">
                      {scenes.filter((s) => collected.has(s.id)).length}/{scenes.length}
                    </span>
                  </h3>
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${Math.min(scenes.length, 3)}, minmax(0, 1fr))` }}
                  >
                    {scenes.map((s) => {
                      const has = collected.has(s.id);
                      return (
                        <div
                          key={s.id}
                          className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center ${
                            has
                              ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50'
                              : 'border-dashed border-slate-200 bg-slate-50'
                          }`}
                          title={has ? `${s.title} · ${s.ref}` : t('book.lock')}
                        >
                          <span
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-inner ${
                              has ? 'bg-gradient-to-b from-amber-100 to-orange-100' : 'bg-slate-100 grayscale'
                            }`}
                          >
                            {has ? s.sticker : '🔒'}
                          </span>
                          <span className={`text-[10px] leading-tight font-black ${has ? 'text-slate-700' : 'text-slate-400'}`}>
                            {has ? s.title : '·····'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
          {SCENES.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">Sem figurinhas ainda…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}