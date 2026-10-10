// Invariantes de `data/devocionalSemanal.ts` — o que a tela
// (`components/games/GameDevocionalDaSemana.tsx`) **dá de certo**.
//
// Este arquivo é o gate de conteúdo da curadoria. A tela é de leitura: ela confia
// que toda semana tem 6 dias na ordem, que toda `ref` existe e — a regra que
// mais importa — que `versiculo.texto` está VAZIO em toda parte. Se alguém um
// dia renderizar texto bíblico por engano, este teste quebra antes do shipped.

import { describe, expect, it } from 'vitest';
import {
  DEVOCIONAIS,
  DEVOCIONAL_INICIO_ATUAL,
  semanasPorTema,
  type SemanaDevocional,
} from './devocionalSemanal';

/* ──────────────────────────────── helpers ──────────────────────────────── */

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

const NOMES_DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;
const DIAS_PT = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

/** 'AAAA-MM-DD' → Date UTC (meio-dia evita qualquer escorregar de fuso). */
function dataDe(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12));
}

/** Segunda-feira → sábado, no formato do material: '28 de setembro', '01 de outubro'. */
function dataLonga(iso: string): string {
  const d = dataDe(iso);
  const nome = MESES[d.getUTCMonth()];
  return `${String(d.getUTCDate()).padStart(2, '0')} de ${nome}`;
}

function somaDias(iso: string, dias: number): string {
  const d = dataDe(iso);
  d.setUTCDate(d.getUTCDate() + dias);
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/** Número da semana ISO 8601 da data (a segunda da semana 1 é a que contém o
 *  primeiro quinta de janeiro). 2026-09-28 → 40. */
function semanaIso(iso: string): number {
  const d = dataDe(iso);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = segunda
  d.setUTCDate(d.getUTCDate() - dow + 3); // a quinta da semana ISO
  const primeiro = new Date(Date.UTC(d.getUTCFullYear(), 0, 4, 12));
  const primeiroDow = (primeiro.getUTCDay() + 6) % 7;
  return 1 + Math.round(((d.getTime() - primeiro.getTime()) / 86400000 - 3 + primeiroDow) / 7);
}

/** Só os DADOS da curadoria (nada de cabeçalho de comentário). */
function dados(s: SemanaDevocional): unknown {
  return {
    tema: s.tema,
    capa: { titulo: s.capa.titulo, ref: s.capa.versiculo.ref },
    dias: s.dias.map((d) => ({
      dia: d.dia,
      data: d.data,
      tema: d.tema,
      ref: d.versiculo.ref,
      texto: d.texto,
      praticando: d.praticando,
      leituras: d.leituras,
      extras: d.extras,
    })),
  };
}

/* ─────────────────────────────── invariantes ─────────────────────────────── */

describe('Devocional da Semana — estrutura do histórico', () => {
  it('tem ao menos uma semana e está em ordem CRESCENTE por `inicio`', () => {
    expect(DEVOCIONAIS.length).toBeGreaterThanOrEqual(1);
    const inicios = DEVOCIONAIS.map((s) => s.inicio);
    expect([...inicios].sort((a, b) => a.localeCompare(b))).toEqual(inicios);
  });

  it('toda semana usa `id === inicio` e os ids são únicos', () => {
    for (const s of DEVOCIONAIS) {
      expect(s.id, s.inicio).toBe(s.inicio);
      expect(s.fim, s.inicio).toBe(somaDias(s.inicio, 5)); // sábado
    }
    expect(new Set(DEVOCIONAIS.map((s) => s.id)).size).toBe(DEVOCIONAIS.length);
  });

  it('toda semana começa numa segunda-feira e o `semana` bate com a data', () => {
    for (const s of DEVOCIONAIS) {
      expect(dataDe(s.inicio).getUTCDay(), `${s.id}: início`).toBe(1); // 1 = segunda
      expect(s.semana, `${s.id}: semana ISO`).toBe(semanaIso(s.inicio));
    }
  });

  it('toda semana tem exatamente 6 dias, de segunda a sábado, nessa ordem', () => {
    for (const s of DEVOCIONAIS) {
      expect(s.dias.map((d) => d.id), s.id).toEqual([...NOMES_DIAS]);
      expect(s.dias.map((d) => d.dia), s.id).toEqual([...DIAS_PT]);
    }
  });

  it('cada dia tem data, tema, versículo com referência e mensagem', () => {
    for (const s of DEVOCIONAIS) {
      for (let i = 0; i < s.dias.length; i++) {
        const d = s.dias[i];
        const quem = `${s.id}/${d.id}`;
        expect(d.data.trim(), quem).not.toBe('');
        expect(d.tema.trim(), quem).not.toBe('');
        expect(d.versiculo.ref.trim(), quem).not.toBe('');
        expect(d.texto.trim(), quem).not.toBe('');
        // a data impressa no material bate com `inicio` + posição na semana
        expect(d.data, quem).toBe(dataLonga(somaDias(s.inicio, i)));
      }
    }
  });

  // 🔒 Capa cujo MATERIAL não traz versículo algum (a arte do PDF não tem —
  // conferido na imagem). Assim como `praticando`, onde a fonte é vaga o campo
  // fica vazio em vez de inventado, e a tela omite o bloco. Se o dono entregar
  // uma capa com versículo, tire a semana daqui.
  const CAPA_SEM_VERSICULO = ['2026-10-05'];

  it('a capa de toda semana tem título — e versículo em toda capa que o material traz', () => {
    for (const s of DEVOCIONAIS) {
      expect(s.capa.titulo.trim(), s.id).not.toBe('');
      if (CAPA_SEM_VERSICULO.includes(s.id)) {
        expect(s.capa.versiculo.ref.trim(), `${s.id}: capa vazia de propósito`).toBe('');
        expect(s.capa.versiculo.texto, s.id).toBe('');
      } else {
        expect(s.capa.versiculo.ref.trim(), s.id).not.toBe('');
      }
    }
  });
});

describe('Devocional da Semana — 🔒 o texto bíblico nunca entra na tela', () => {
  it('`versiculo.texto` está vazio em TODA parte (capa e dias de todas as semanas)', () => {
    // A vertical é NAA (ADR-001): escrever a redação aqui seria inventar texto
    // bíblico. A tela mostra só a `ref` + "abra a Bíblia em casa". Se este teste
    // falhar, NÃO renderize o campo — peça o texto NAA ao dono com a permissão
    // da SBB ou volte a esvaziá-lo.
    for (const s of DEVOCIONAIS) {
      expect(s.capa.versiculo.texto, `${s.id} capa`).toBe('');
      for (const d of s.dias) {
        expect(d.versiculo.texto, `${s.id}/${d.id}`).toBe('');
      }
    }
  });
});

describe('Devocional da Semana — campos vazios de propósito', () => {
  // 🔒 ESTA LISTA CRESCE quando o dono entregar mais material (outras semanas
  // com bloco PRATICANDO, ou a página de terça/quinta que saiu em outra
  // diagramação no PDF). Ao acrescentar, ATUALIZE a lista abaixo — o teste
  // existe para ninguém inventar `praticando` onde a fonte é vaga
  // (jogos-biblicos §2/§5: onde falta material, falta mesmo).
  const SEM_PRATICANDO = [
    '2026-09-28/ter',
    '2026-09-28/qui',
    '2026-10-05/ter',
    '2026-10-05/qui',
  ];

  it('`praticando` só falta exatamente onde é legítimo', () => {
    const sem = DEVOCIONAIS.flatMap((s) =>
      s.dias.filter((d) => d.praticando.trim() === '').map((d) => `${s.id}/${d.id}`),
    );
    expect(sem.sort()).toEqual([...SEM_PRATICANDO].sort());
  });

  it('os caixotes extras têm título, e o corpo é lido só quando existe', () => {
    // Onde o PDF trazia só o cabeçalho (o corpo estava na imagem), o caixote
    // pode ter `texto` vazio — a tela só renderiza os que têm corpo.
    for (const s of DEVOCIONAIS) {
      for (const d of s.dias) {
        for (const e of d.extras) {
          expect(e.titulo.trim(), `${s.id}/${d.id}`).not.toBe('');
          expect(typeof e.texto, `${s.id}/${d.id}/${e.titulo}`).toBe('string');
        }
      }
    }
  });
});

describe('Devocional da Semana — derivados (o que a tela usa)', () => {
  it('`DEVOCIONAL_INICIO_ATUAL` é a segunda-feira mais recente', () => {
    const maisRecente = DEVOCIONAIS.map((s) => s.inicio).sort((a, b) => b.localeCompare(a))[0];
    expect(DEVOCIONAL_INICIO_ATUAL).toBe(maisRecente);
    expect(dataDe(DEVOCIONAL_INICIO_ATUAL).getUTCDay()).toBe(1);
  });

  it('`semanasPorTema` filtra ignorando caixa e acento, e devolve [] no que não existe', () => {
    const tema = DEVOCIONAIS[0].tema;
    const formas = [tema, tema.toUpperCase(), tema.toLowerCase()];
    for (const forma of formas) {
      expect(semanasPorTema(forma).length, forma).toBeGreaterThanOrEqual(1);
      expect(semanasPorTema(forma).every((s) => DEVOCIONAIS.includes(s))).toBe(true);
    }
    // sem acento: 'Gratidao, cuidado e amor' acha a semana de 'Gratidão, ...'
    const semAcento = tema.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    expect(semanasPorTema(semAcento).map((s) => s.id)).toEqual(
      DEVOCIONAIS.filter((s) => s.tema === tema).map((s) => s.id),
    );
    expect(semanasPorTema('Tema que não existe')).toEqual([]);
    expect(semanasPorTema('')).toEqual([]);
  });
});

describe('Devocional da Semana — identidade da vertical', () => {
  // 🔒 Vertical genérica, sem marca de igreja e sem monetização
  // (jogos-biblicos §1/§8). Testado SÓ no array de dados: o cabeçalho de
  // comentário do arquivo legitimately cita esses termos ao explicar por que
  // eles foram removidos da curadoria.
  const PROIBIDOS = [
    'igreja',
    'lagoinha',
    'pastor',
    'oferta',
    'dízimo',
    'dizimo',
    'loja',
    'app',
    'site',
    'inscreva',
    'assine',
    'whatsapp',
  ];

  it('nenhum tema, capa ou dia cita marca de igreja / loja / oferta', () => {
    const proibidos = PROIBIDOS.map((p) => [p, new RegExp(p, 'i')] as const);
    for (const s of DEVOCIONAIS) {
      const texto = JSON.stringify(dados(s)).toLowerCase();
      for (const [termo, re] of proibidos) {
        expect(re.test(texto), `${termo} apareceu na semana ${s.id}`).toBe(false);
      }
    }
  });
});