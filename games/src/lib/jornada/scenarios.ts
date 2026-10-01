// Cenário da "A Grande Jornada": um "cartão-postal" por marco de Bunyan.
//
// Regra da skill `jogos-visual` §6: cada zona precisa de silhueta única,
// reconhecível de longe — não só "outro emoji". Tudo em Canvas 2D puro, sem
// `blur`/filtro/bitmap (orçamento de GPU do celular, §5), e as silhuetas são
// estáticas: sem loop infinito queimando bateria.
//
// Cada função recebe a posição na TELA e desenha a base do objeto em (0,0),
// crescendo para a direita e para cima. `paleta` traz as duas cores do bioma.

export interface Paleta {
  /** Cor da silhueta (normalmente `ground[0]` escurecida). */
  silhueta: string;
  /** Cor de destaque/detalhe (normalmente `ground[1]`). */
  destaque: string;
  /** Cor clara para realce (luz,snow, papel). */
  clara: string;
}

function stamp(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
}

const end = (ctx: CanvasRenderingContext2D) => ctx.restore();

/** Contorno grosso estilo adesivo (skill §1: sombra dura, contorno marcante). */
function contorno(ctx: CanvasRenderingContext2D, cor: string, largura = 3) {
  ctx.lineWidth = largura;
  ctx.strokeStyle = cor;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function poly(ctx: CanvasRenderingContext2D, cor: string, pontos: [number, number][]) {
  ctx.beginPath();
  ctx.moveTo(pontos[0][0], pontos[0][1]);
  for (const [px, py] of pontos.slice(1)) ctx.lineTo(px, py);
  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
}

function ret(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, w, h);
}

function circ(ctx: CanvasRenderingContext2D, cor: string, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = cor;
  ctx.fill();
}

/* ─────────────────────────── as 12 silhuetas ─────────────────────────── */

/** Cidade de Escuridão: torres quebradas, telhados desabados. */
export function ruins(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  poly(ctx, p.silhueta, [[0, 0], [0, -54], [14, -60], [22, -46], [26, -54], [30, 0]]);
  poly(ctx, p.silhueta, [[38, 0], [38, -34], [50, -38], [62, -30], [62, 0]]);
  poly(ctx, p.silhueta, [[74, 0], [74, -46], [86, -52], [98, -44], [98, 0]]);
  // janelas acesas — a cidade é destruída, mas não é o fim
  ctx.fillStyle = p.destaque;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(8, -44, 6, 8);
  ctx.fillRect(80, -36, 6, 8);
  ctx.globalAlpha = 1;
  end(ctx);
}

/** Portão Estreito: arco estreito entre dois pilares. */
export function gate(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  ret(ctx, p.silhueta, 0, -96, 22, 96);
  ret(ctx, p.silhueta, 74, -96, 22, 96);
  // arco ogival — a "estreiteza" é a mensagem visual
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.quadraticCurveTo(48, -128, 96, -96);
  ctx.lineTo(96, -88);
  ctx.quadraticCurveTo(48, -116, 0, -88);
  ctx.closePath();
  ctx.fillStyle = p.silhueta;
  ctx.fill();
  // luz vindo do outro lado da porta
  poly(ctx, p.clara, [[40, 0], [40, -78], [48, -92], [56, -78], [56, 0]]);
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
  end(ctx);
}

/** Casa do Intérprete: casinha + livro aberto num suporte. */
export function house(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  ret(ctx, p.silhueta, 8, -54, 60, 54);
  poly(ctx, p.silhueta, [[2, -54], [38, -88], [74, -54]]);
  // livro aberto: duas páginas em V
  ctx.beginPath();
  ctx.moveTo(84, 0);
  ctx.lineTo(84, -26);
  ctx.quadraticCurveTo(96, -34, 106, -26);
  ctx.lineTo(106, 0);
  ctx.quadraticCurveTo(96, -8, 84, 0);
  ctx.closePath();
  ctx.fillStyle = p.clara;
  ctx.fill();
  contorno(ctx, p.silhueta, 2.5);
  // janela acesa
  ctx.fillStyle = p.destaque;
  ctx.fillRect(30, -44, 14, 16);
  end(ctx);
}

/** Colina da Dificuldade: paredão de degraus íngremes. */
export function cliff(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const degraus = 7;
  for (let i = 0; i < degraus; i++) {
    const x = (110 / degraus) * (i + 1);
    const y = -14 * (i + 1);
    ctx.lineTo(x - 110 / degraus, y);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(110, -14 * degraus);
  ctx.lineTo(110, 0);
  ctx.closePath();
  ctx.fillStyle = p.silhueta;
  ctx.fill();
  // marca do topo: a meta da subida
  circ(ctx, p.destaque, 110, -14 * degraus - 6, 5);
  end(ctx);
}

/** Casa Bela: casa com quatro janelas acesas e chaminé com fumaça. */
export function hearth(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  ret(ctx, p.silhueta, 6, -50, 76, 50);
  poly(ctx, p.silhueta, [[0, -50], [44, -84], [88, -50]]);
  ret(ctx, p.silhueta, 62, -96, 12, 18);
  // quatro janelas = os quatro companheiros
  ctx.fillStyle = p.destaque;
  for (let i = 0; i < 4; i++) ctx.fillRect(14 + i * 17, -40, 11, 13);
  // fumaça em três bolhas que sobem
  ctx.globalAlpha = 0.35;
  circ(ctx, p.clara, 68, -102, 6);
  circ(ctx, p.clara, 74, -114, 8);
  circ(ctx, p.clara, 66, -126, 10);
  ctx.globalAlpha = 1;
  end(ctx);
}

/** Vale da Sombra: garganta escura, espinhos e dossel de sombra. */
export function gloom(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  // dossel
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.quadraticCurveTo(46, -96, 120, -34);
  ctx.lineTo(120, -20);
  ctx.quadraticCurveTo(52, -74, -4, -14);
  ctx.closePath();
  ctx.fillStyle = p.silhueta;
  ctx.fill();
  // pontas de rocha subindo do fundo do vale
  for (const [x, h] of [[10, 26], [38, 40], [70, 30], [96, 44]] as [number, number][]) {
    poly(ctx, p.silhueta, [[x, 0], [x + 9, -h], [x + 18, 0]]);
  }
  ctx.globalAlpha = 0.55;
  circ(ctx, p.clara, 56, -20, 7);
  ctx.globalAlpha = 1;
  end(ctx);
}

/**
 * Feira das Vaidades — o cartão-postal que o dono pediu: barracas de lona
 * listrada, balões amarrados e mercadoria sobre as mesas. Tudo em silhueta com
 * detalhes coloridos, para ficar óbvio que aqui é "comprar coisas".
 */
export function market(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  const barracas: [number, number, number][] = [
    [0, 0, 1],
    [46, -6, 0.82],
    [88, -2, 0.9],
  ];
  for (const [bx, by, bs] of barracas) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(bs, bs);
    // lona listrada
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? p.destaque : p.clara;
      ctx.fillRect(i * 7, -34, 7, 14);
    }
    // toldo em arco
    ctx.beginPath();
    ctx.moveTo(-4, -34);
    ctx.quadraticCurveTo(14, -52, 32, -34);
    ctx.closePath();
    ctx.fillStyle = p.silhueta;
    ctx.fill();
    // haste + mesa
    ret(ctx, p.silhueta, 0, -34, 3, 34);
    ret(ctx, p.silhueta, 27, -34, 3, 34);
    ret(ctx, p.silhueta, -2, -20, 33, 4);
    // mercadoria sobre a mesa (as vaidades)
    circ(ctx, p.clara, 6, -24, 4);
    ret(ctx, p.clara, 15, -28, 6, 8);
    circ(ctx, p.destaque, 26, -23, 3);
    ctx.restore();
  }
  // balões amarrados
  const baloes: [number, number, number][] = [
    [20, -66, 6],
    [30, -78, 5],
    [66, -62, 6],
    [104, -70, 5],
  ];
  ctx.strokeStyle = p.silhueta;
  ctx.lineWidth = 1.5;
  for (const [bx, by, br] of baloes) {
    ctx.beginPath();
    ctx.moveTo(bx, by + br);
    ctx.lineTo(bx + 2, 0);
    ctx.stroke();
    circ(ctx, p.destaque, bx, by, br);
  }
  end(ctx);
}

/** Castelo da Dúvida: torres com telhados cônicos e bandeiras. */
export function castle(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  ret(ctx, p.silhueta, 0, -60, 120, 60);
  // ameias
  for (let i = 0; i < 8; i++) ret(ctx, p.silhueta, i * 16, -68, 9, 9);
  // torres laterais
  for (const tx of [4, 92]) {
    ret(ctx, p.silhueta, tx, -92, 24, 92);
    poly(ctx, p.silhueta, [[tx - 4, -92], [tx + 12, -122], [tx + 28, -92]]);
    // bandeira
    ctx.strokeStyle = p.silhueta;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx + 12, -122);
    ctx.lineTo(tx + 12, -140);
    ctx.stroke();
    poly(ctx, p.destaque, [[tx + 12, -140], [tx + 28, -134], [tx + 12, -128]]);
  }
  // portão do castelo
  ctx.beginPath();
  ctx.arc(60, -30, 16, Math.PI, 0);
  ctx.lineTo(76, 0);
  ctx.lineTo(44, 0);
  ctx.closePath();
  ctx.fillStyle = p.silhueta;
  ctx.fill();
  end(ctx);
}

/** Montanhas Deliciosas: picos com neve e um pastor com cajado. */
export function mountains(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  poly(ctx, p.silhueta, [[0, 0], [44, -84], [88, 0]]);
  poly(ctx, p.silhueta, [[62, 0], [102, -66], [142, 0]]);
  // capas de neve
  poly(ctx, p.clara, [[44, -84], [32, -68], [40, -70], [46, -62], [52, -70], [58, -66]]);
  poly(ctx, p.clara, [[102, -66], [93, -53], [99, -55], [104, -49], [110, -55], [114, -52]]);
  // pastor
  circ(ctx, p.silhueta, 20, -26, 7);
  ctx.strokeStyle = p.silhueta;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, -19);
  ctx.lineTo(18, 0);
  ctx.moveTo(18, -14);
  ctx.lineTo(34, -20);
  ctx.stroke();
  end(ctx);
}

/** Terreno Encantado: árvores com fruto brilhante e faíscas. */
export function enchanted(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  for (const [tx, ts] of [[10, 1], [46, 0.78], [80, 0.92]] as [number, number][]) {
    ctx.save();
    ctx.translate(tx, 0);
    ctx.scale(ts, ts);
    ret(ctx, p.silhueta, 8, -26, 6, 26);
    circ(ctx, p.silhueta, 11, -36, 16);
    // frutos acesos
    circ(ctx, p.clara, 4, -44, 4);
    circ(ctx, p.clara, 18, -40, 4);
    circ(ctx, p.destaque, 11, -52, 4);
    ctx.restore();
  }
  // faíscas flutuantes (o "encanto")
  ctx.globalAlpha = 0.8;
  circ(ctx, p.clara, 34, -70, 3);
  circ(ctx, p.clara, 68, -60, 3);
  circ(ctx, p.clara, 52, -80, 3);
  ctx.globalAlpha = 1;
  end(ctx);
}

/** Rio da Morte: água ondulante e o barco da travessia. */
export function river(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  // barco
  poly(ctx, p.silhueta, [[26, -6], [74, -6], [66, 4], [34, 4]]);
  circ(ctx, p.silhueta, 50, -20, 6);
  ret(ctx, p.silhueta, 48, -15, 4, 9);
  // onda
  ctx.strokeStyle = p.destaque;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const y = -2 + i * 4;
    ctx.moveTo(0, y);
    for (let x = 0; x <= 100; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.3 + i) * 2);
    ctx.stroke();
  }
  // margem
  ret(ctx, p.silhueta, 0, -12, 14, 12);
  end(ctx);
}

/** Cidade Celeste: muralha dourada com portão de luz e raios. */
export function celestial(ctx: CanvasRenderingContext2D, p: Paleta) {
  stamp(ctx, 0, 0, 1);
  // halo de luz atrás do portão
  const halo = ctx.createRadialGradient(64, -44, 4, 64, -44, 74);
  halo.addColorStop(0, p.clara);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = halo;
  ctx.fillRect(-10, -118, 148, 122);
  ctx.globalAlpha = 1;
  // muralha
  ret(ctx, p.silhueta, 0, -52, 128, 52);
  for (let i = 0; i < 9; i++) ret(ctx, p.silhueta, i * 15, -60, 8, 9);
  // portão de luz
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(42, -40);
  ctx.quadraticCurveTo(64, -66, 86, -40);
  ctx.lineTo(86, 0);
  ctx.closePath();
  ctx.fillStyle = p.destaque;
  ctx.fill();
  contorno(ctx, p.silhueta, 3);
  end(ctx);
}

/** Mapa id → desenho. */
export const CENARIOS: Record<string, (ctx: CanvasRenderingContext2D, p: Paleta) => void> = {
  ruins,
  gate,
  house,
  cliff,
  hearth,
  gloom,
  market,
  castle,
  mountains,
  enchanted,
  river,
  celestial,
};