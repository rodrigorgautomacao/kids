import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { isIOS, isStandalone } from '../lib/device';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'kids-install-dismissed';

/**
 * Convite para instalar o jogo na tela de início.
 *
 * - Android/Chrome: botão que dispara o prompt nativo.
 * - iPhone/Safari: instrução manual (o iOS não tem prompt programático).
 * - Já instalado (standalone): não mostra nada.
 */
export default function InstallHint() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [standalone, setStandalone] = useState(isStandalone);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = isIOS();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setStandalone(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function close() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* modo privado: só não persiste */
    }
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (standalone || dismissed) return null;
  // No iPhone só mostramos a dica depois que o usuário já jogou algo.
  if (!prompt && !ios) return null;

  return (
    <div className="relative mx-auto mt-4 w-full max-w-md rounded-3xl border-2 border-white/20 bg-white/10 px-4 py-3 text-left">
      <button
        type="button"
        onClick={close}
        aria-label="Fechar dica de instalação"
        className="absolute top-2 right-2 rounded-full p-1 text-white/70 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm font-black text-amber-300">📲 Levar os jogos no bolso</p>
      {prompt ? (
        <button
          type="button"
          onClick={install}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-amber-950 shadow"
        >
          <Download className="h-4 w-4" /> Instalar na tela de início
        </button>
      ) : (
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold text-white/85">
          Toque em <Share className="inline h-4 w-4 text-sky-300" /> <b>Compartilhar</b> e depois em
          <b>“Adicionar à Tela de Início”</b>.
        </p>
      )}
    </div>
  );
}
