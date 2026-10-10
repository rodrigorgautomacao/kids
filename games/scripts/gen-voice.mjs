// Gera a voz de estúdio (Piper, grátis) para as narrações do app.
//
// Uso:
//   bun scripts/gen-voice.mjs            # gera tudo (paralelo)
//   bun scripts/gen-voice.mjs --dry      # só conta as frases
//   LIMIT=20 bun scripts/gen-voice.mjs   # limita (teste)
//
// Requisitos (baixados em /tmp/opencode/piper, ver README):
//   - binário `piper` + libs (LD_LIBRARY_PATH)
//   - voz pt_BR (pt_BR-faber-medium.onnx)
//   - ffmpeg para converter WAV → OGG/Opus
//
// Saída: public/voice/<hash>.ogg + public/voice/manifest.json
// O app toca o áudio quando o texto tem hash no manifesto; senão cai na voz do
// aparelho (`speechSynthesis`).

import { execFile, spawn } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { SCENES } from '../src/data/scenes.ts';
import { cleanForSpeech } from '../src/lib/audio/voice.ts';
import { hashText } from '../src/lib/audio/hash.ts';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, '..');
const outDir = join(appRoot, 'public', 'voice');
const tmpDir = '/tmp/opencode/voice-tmp';

const PIPER = process.env.PIPER_BIN ?? '/tmp/opencode/piper/piper/piper';
const PIPER_LIB = process.env.PIPER_LIB ?? '/tmp/opencode/piper/piper';
const MODEL = process.env.PIPER_MODEL ?? '/tmp/opencode/piper/voices/pt_BR-faber-medium.onnx';
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;

/** Coleta frases de narração: catálogo de cenas + strings do código-fonte. */
export function collect() {
  const phrases = new Set();
  const add = (t) => {
    if (typeof t !== 'string') return;
    const c = cleanForSpeech(t);
    if (c.length >= 3 && /[A-Za-zÀ-ÿ]/.test(c)) phrases.add(c);
  };

  for (const s of SCENES) {
    add(s.title);
    s.acts.forEach(add);
    add(s.q);
    add(s.right.t);
    s.wrongs.forEach((w) => add(w.t));
  }

  const scan = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) {
        scan(p);
      } else if (/\.(ts|tsx)$/.test(f.name) && !/\.(test|spec)\./.test(f.name)) {
        // Testes não são narração: descrevem casos, não o que a criança ouve.
        const src = readFileSync(p, 'utf8');
        // Aspas com escape (`\'`) e sem piso de tamanho: um par curto (ex.: id
        // 'noe') não pode "desalinhar" a extração e pular o rótulo seguinte.
        for (const re of [
          /'((?:\\.|[^'\\\n]){1,160})'/g,
          /"((?:\\.|[^"\\\n]){1,160})"/g,
          /`((?:\\.|[^`\\\n]){1,160})`/g,
        ]) {
          for (const m of src.matchAll(re)) {
            const s = m[1].replace(/\\'/g, "'");
            if (looksNarration(s)) add(s);
          }
        }
      }
    }
  };
  scan(join(appRoot, 'src'));

  // Números aparecem como narração e como opção (contagem, rótulos numéricos).
  // Não passam no filtro de "frase" (não têm letra), então entram explicitamente
  // — a voz Piper lê "5" como "cinco".
  for (let n = 0; n <= 100; n++) phrases.add(String(n));

  EXTRA_PHRASES.forEach(add);

  return [...phrases].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Heurística: string de uma linha que parece frase falada (não código). */
function looksNarration(s) {
  if (!/[A-Za-zÀ-ÿ]/.test(s)) return false;
  if (/[{}()\[\]<>=;`$|\\]/.test(s)) return false;
  if (s.includes('://') || s.includes('${')) return false;
  if (s.includes(' ')) {
    // Frase: começa com maiúscula, dígito ou emoji.
    return /^[A-ZÀ-Ý0-9\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s);
  }
  // Palavra única: só entra se parecer RÓTULO/NOME — começa com maiúscula e é
  // só letras (aceita acento, hífen e apóstrofo). Evita chaves e classes
  // minúsculas do código (`seg`, `rounded-full`, `ui-press`).
  return /^[A-ZÀ-Ý][A-Za-zÀ-ÿ'’-]*$/.test(s) && s.length >= 3;
}

// Frases curtas que a heurística não pega (uma palavra com pontuação, ou
// minúscula), mas que o app monta em `speakQueue` — precisam de áudio próprio
// para não caírem na voz do aparelho.
const EXTRA_PHRASES = ['Ache!', 'diz:', 'concluído!', 'estrela', 'estrelas'];

function synth(phrase, file) {
  const wav = join(tmpDir, `${hashText(phrase)}.wav`);
  return new Promise((resolve, reject) => {
    const p = spawn(PIPER, ['--model', MODEL, '--output_file', wav], {
      env: { ...process.env, LD_LIBRARY_PATH: PIPER_LIB },
    });
    let err = '';
    p.stderr.on('data', (d) => {
      err += String(d);
    });
    p.on('error', reject);
    p.on('close', async (code) => {
      if (code !== 0) return reject(new Error(`piper ${code}: ${err.slice(-160)}`));
      try {
        await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-c:a', 'libopus', '-b:a', '28k', file]);
        rmSync(wav, { force: true });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    p.stdin.write(phrase + '\n');
    p.stdin.end();
  });
}

async function main() {
  const dry = process.argv.includes('--dry');
  let phrases = collect();
  if (Number.isFinite(LIMIT)) phrases = phrases.slice(0, LIMIT);
  console.log(`[gen-voice] ${phrases.length} frases únicas`);
  if (dry) {
    console.log(phrases.slice(0, 12).map((p) => `  · ${p}`).join('\n'));
    return;
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  // Preserva o acervo já gerado (união): frases que saíram do código por
  // heurística, mas ainda podem ser faladas a partir de um texto dinâmico,
  // continuam alcançáveis. Só mantém entradas cujo arquivo existe.
  const manifestPath = join(outDir, 'manifest.json');
  const manifest = {};
  if (existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(readFileSync(manifestPath, 'utf8'));
      for (const [k, v] of Object.entries(prev)) {
        if (typeof v === 'string' && existsSync(join(outDir, v))) manifest[k] = v;
      }
    } catch {
      /* manifesto anterior ilegível: recomeça do zero */
    }
  }

  let done = 0;
  let failed = 0;

  const queue = [...phrases];
  async function worker() {
    while (queue.length) {
      const phrase = queue.shift();
      const key = hashText(phrase);
      const file = join(outDir, `${key}.ogg`);
      manifest[key] = `${key}.ogg`;
      try {
        if (!existsSync(file)) await synth(phrase, file);
      } catch (e) {
        failed++;
        console.error(`[gen-voice] falhou: ${phrase.slice(0, 40)}… (${e.message?.slice(0, 80)})`);
      }
      done++;
      if (done % 50 === 0) console.log(`[gen-voice] ${done}/${phrases.length} (falhas: ${failed})`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest));
  console.log(`[gen-voice] pronto: ${Object.keys(manifest).length} áudios, ${failed} falhas`);
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
