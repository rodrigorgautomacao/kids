# GAME_DESIGN — Platformer bíblico (proposta de Game Design)

> **Documento de ETAPA 1 (base teológica).** Nenhuma linha de código foi escrita.
> Status: **aguardando aprovação do dono** para seguir para a ETAPA 2 (mecânica).
> Autor: consultoria de `jogos-biblicos` + `jogos-game-design` + `jogos-visual`,
> sobre as fontes em `~/.config/opencode/brain-jogos/`.
> Licença bíblica: NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do
> Brasil. Usada com permissão.

---

## 0. Correção factual + nota de escopo (leia antes de tudo)

1. **Super Mario Bros. 1-1 é de NES (1985), não de Super Nintendo.** O jogo de
   Super Nintendo com essa jogabilidade é *Super Mario World* (1990). Isso muda
   nada no pedido — a referência de sensação é a mesma —, mas fica registrado
   para não aparecer errado em documento ou conversa.
2. **Nenhuma marca da Nintendo será usada.** O jogo será **original**: nome,
   personagens, arte, tiles, sons e código próprios. Ver §7 (Conformidade/IP).
3. A especificação técnica original pedia "HTML5 Canvas + JavaScript puro". O
   repo é **React + Vite + TypeScript**. Resolução proposta em §6.1: **motor em
   Canvas 2D com timestep fixo, isolado do React**, escrito em TypeScript, sem
   framework e sem dependências novas. Nenhum arquivo `index.html` novo.
4. 🆕 **Inspiração pedida pelo dono: *O Peregrino*, de John Bunyan (1678).**
   Isso reorienta o eixo do jogo inteiro. influência está descrita em §1.4 — inclusive os
   limites da Queue.

---

## 1. Tema central e passagem de referência

### 1.1 Tema escolhido

> ## 🌿 **"A Grande Jornada — O Peregrino"**
> ### do Jardim à Cidade Celeste

**Uma campanha, doze etapas.** Espinha de *O Peregrino* (Bunyan) sobre o
arcabouço dos 4 atos da cosmovisão. A criança **camina, corre e atravessa**.

| Ato | Etapas | Bioma (o "chão" do jogo) | Marco de Bunyan |
|---|---|---|---|
| **1 · Criação** | 1–3 | **O Jardim** — grama macia, água correndo, bichinhos que fogem | Cidade da Destruição · **Portão Estreito** · Casa do Intérprete |
| **2 · Queda** | 4–6 | **A Terra com Espinhos** — o mesmo jardim, agora duro | **Colina da Dificuldade** · Casa Bela · **Vale da Sombra** |
| **3 · Redenção** | 7–10 | **A Feira, o Castelo e as Montanhas** | **Feira das Vaidades** · Castelo da Dúvida · Montanhas Deliciosas · Terreno Encantado |
| **4 · Consumação** | 11–12 | **O Rio e a Cidade** — sem inimigo | **Rio da Morte** · **Cidade Celeste** |

**Nome aprovado pelo dono:** *A Grande Jornada*.

**Por que este tema:**

- É o único tema do brain que dá **terreno de jogo** (os outros dois dão
  *inventário*, não *lugar para correr*). A progressão de dificuldade do gênero
  **exige** um mundo que endurece — e "o chão que endureceu" é a Queda lida
  como paisagem, não como monstro.
- *O Peregrino* é uma **paisagem de jornada**, não uma lista de mandamentos:
  cada capítulo é um lugar que se atravessa. Isso é exatamente o que um
  platformer precisa.
- Não repete nenhum dos 28 jogos. `A Estrada da Luz` é *decisão moral estática*;
  `A Aventura na Bíblia` é *estação + cena*. Aqui a mecânica central é
  **locomoção**, que o catálogo não tem.
- Cobre os 4 atos **sem forçar**: nenhum ato vira "castigo".

### 1.2 Passagens-âncora

**Apocalipse 22.1-2 (NAA)** — a recompensa final: o rio e a árvore da vida.

**Gálatas 5.22-23 (NAA)** — os 9 frutos, que já constam literalmente no brain
(`teologia/batista-protestante.md` §Temas).

**Efésios 6.10-18 (NAA)** — a camada de *equipamento* do Ato 3, **sem espada**
(ver §5, Risco 4).

**Salmos 119.105 + João 8.12 (NAA)** — 🆕 **o eixo da mecânica das sementes.**
A Palavra é luz; a luz revela. Ver §2.4, que é o coração novo deste design.

### 1.3 Mapa de referência: onde cada coisa do livro vira mecânica

| No jogo | No *O Peregrino* (Bunyan, 1678) | Ref NAA |
|---|---|---|
| A cidade ao fundo, no 1º frame | **Cidade da Destruição** — de onde o peregrino sai | Rm 5.12 · Rm 3.23 |
| O Portão no fim do Ato 1 | **Portão Estreito**, guardado por Boa Vontade | Jo 10.9 · Mt 7.13-14 · Jo 14.6 |
| Um salão que mostra o caminho | **Casa do Intérprete** (ele *mostra*, não explica) | 1Co 2.13-14 · Jo 5.39 |
| A subida mais difícil | **Colina da Dificuldade** | Hb 12.1-2 |
| Os 4 Companionheiros que recebem a criança | **Casa Bela** — Discrição, Piedade, Prudência, Caridade | Gl 5.22-23 |
| A fase mais escura (luz = mecânica) | **Vale da Sombra da Morte** | Sl 23.4 · Sl 91.1-2 |
| O bloco quebrável por **canto** | **Muro de Jericó** (Bunyan usa o grito) | Jos 6.4-5 |
| A feira com coisas bonitas à venda | **Feira das Vaidades** | 1Jo 2.15-17 · Mt 6.24-25 |
| A fortaleza que prende no escuro | **Castelo da Dúvida** | 1Co 10.13 · Jo 8.31 |
| O **companheiro** que marca o caminho | **Fiel → Esperança** → **Grande Coração** | Jo 8.31 · Rm 15.13 · Hb 13.8 |
| O chão que engana | **Terreno Encantado** | 1Co 3.18-20 · 2Co 11.3 |
| **A Cancelinha** (§2.4) | **o desvio lateral** — a trilha que sai da estrada e leva ao lado errado | Pv 14.12 · Mt 6.23 |
| A travessia final | **Rio da Morte** ("sinto o fundo, e ele é bom") | Lm 3.22-23 · Fp 1.6 |
| A chegada | **Cidade Celeste**, com os Dois Seres Brilhantes no portão | Ap 21.3-5 · Ap 22.1-2 · Sl 122.1-2 |

### 1.4 🟡 Limites da influência de Bunyan — **isto precisa ser aprovado**

**1. *O Peregrino* é ALEGORIA DE AUTOR HUMANO. Não é Escritura.**

- 🔒 **Regra de ouro inegociável:** nenhuma tela pode apresentar conteúdo de
  Bunyan como se fosse versículo. **Toda** lição, placa e tela de fim de etapa
  **continua exibindo uma referência NAA**. Bunyan é citado como **autor e
  fonte de inspiração**, nunca como autoridade paralela à Bíblia.
- ✅ Isso é coerente com a regra da casa (`jogos-biblicos` §3): *toda lição cita
  a Bíblia*. Bunyan não substitui a referência; ilumina ela.

**2. O livro é confessionista. A vertical é genérica (ADR-001).**

Bunyan escreve de um calvinismo não-conformista, e parte de sua biografia é
**polemica confessional** — ele trata o Papa e o paganismo como gigantes
hostis, e tem figuras como Apolião e Belzebu, com peso assustador. Para uma vertical
**interdenominacional** isso é problema, não detalhe.

- 🟡 **Recomendação:** usar **os lugares e a estrutura da jornada** (que são
  neutros e já biblicamente richos), e **não usar** os gigantes confessionais
  nomeados. Especificamente:
  - ❌ **Apolião** → no jogo é **"A Sombra do Vale"**, que não é uma criatura: é
    **a própria escuridão do vale**. Nenhuma cara, nenhum olho, nenhum rugido.
    (Ver §5, Riscos 3 e 8.)
  - ❌ **Belzebu**, **Papa**, **Pagão** → não entram.
  - ✅ **Grandes genéricos** (Desespero, Preconceito, Fanfarronice, Ignorância,
    Volubilidade, Presunção, Perversidade) entram **depurados**: sem caricatura
    de nenhuma pessoa ou igreja. São **armadilhas do caminho**, não personas.

**3. Domínio público — confirmado.** Bunyan morreu em 1688; o texto de 1678 é
**domínio público** e não exige licença.

- ⚠️ **Mas atenção:** as **traduções brasileiras modernas** do livro são
  **direitos autorais de terceiros**. 🔒 **Não vamos copiar frase de nenhuma
  tradução.** Todo texto das telas é **escrito por nós**, em PT-BR próprio, em
  linguagem infantil. Citar o livro é seguro; **copiar tradução alheia, não**.

**4. A tensão que este tema cria (e como foi resolvida).**

Bunyan termina em "chegar à Cidade Celeste", e isso pode soar como
**salvação por esforço de caminhada**. Isso contradiz `Jo 3.16` e `Cl 1.13`, que
a vertical já ensina como obra de Deus.

- ✅ **Resolução já embutida no design:** no livro, **o fardo cai na Cruz**,
  antes de a jornada ficar difícil — e o **Portão é guardado por Boa Vontade**
  (que Bunyan revela ser Jesus). O jogo **não** põe a criança a limpar o caminho
  para ser salva: ela **chega** a um lugar onde **Deus já fez tudo**
  (see a etapa 12, §2.6). O verbo é sempre **recebido, não conquistado**.

### 1.5 Hipóteses assumidas (pedem validação do dono)

| # | Hipótese | Por quê |
|---|---|---|
| H1 | A composição em camadas (campanha + Ef 6 + Gl 5) | É do agente teológico, não das fontes |
| H2 | ~~O nome~~ → ✅ **aprovado: "A Grande Jornada"** | dono, 1ª rodada |
| H3 | 12 etapas como estrutura | As fontes não dizem nada sobre número de fases |
| H4 | "O Pastor" carrega a criança no trecho final | Protege contra pelagianismo (§5, Risco 6) |
| H6 | Manter **Êxodo 17** e deixar **Números 20** fora | evita a dissonância da repreensão a Moisés |
| H7 | Manter **Êxodo 33-34** fora | o texto do rosto de Deus é delicado para uso como mascote |
| H8 | "Capacete da salvação" (`Ef 6.17`) entra como item | 🟡 sensível em tradições batistas — tua decisão |
| H9 | **Inspirar em Bunyan com os filtros de §1.4** | 🟡 pedido do dono — precisa de aval |
| H10 | **Faixa única `7-9` + Modo Pequeninos** | corre + pulo com precisão exige leitura de padrão |
| H11 | **A Cancelinha** como "outro lado" da mecanic das sementes | leitura minha do jogo pedido — precisa de aval |

---

## 2. Mapeamento mecânica → conceito bíblico

### 2.1 Regra estrutural que governa todo o mapa

> **Não existe vilão com nome próprio.** O adversário é **o terreno e a
> necessidade** (sede, espinho, tempestade) — coisas que a criança **atravessa**,
> não coisas que ela **mata**. E o "pisar em cima" (*stomp*) **não mata**:
> **transforma**.

Essa única regra resolve metade do risco teológico do gênero (ver §5, Risco 1).

### 2.2 Inimigos e perigos

| Elemento SMB | Nome no jogo | Marco de Bunyan / conceito | Ref (NAA) | Comportamento |
|---|---|---|---|---|
| 🐢 tartaruga andando | **Espinho** | a terra passou a produzir espinhos e cardos | Gn 3.17-19 | Patrulha lento. **Stomp → vira flor.** Não persegue, não tem rosto de mau |
| 🐛 goomba (caminha) | **Bichinho do Pomar** | a criação que Deus achou *muito boa* e que geme esperando ser libertada | Gn 1.10-12; Rm 8.19-22 🟡 | ⚠️ **Único** inimigo do Ato 1. **Foge** quando a criança chega perto — não machuca, não persegue. Stomp **não mata**: vira **figurinha** para o `CollectionBook` |
| 🦇 morcego voador | ❌ **NÃO** | — | — | Voador em tela pequena é o pior caso de hitbox para criança. Se aparecer, é **plataforma suspensa**, não inimigo |
| 🐍 cobra do deserto | **Serpente da Haste** | a serpente que *foi erguida* e deu vida a quem olhou | Nm 21.4-9 | **Pula por cima. Não causa dano.** No nível dela o objetivo é **olhar para cima** (a haste = Marco) |
| 🌑 escuridão que avança | **A Sombra do Vale** 🆕 | o **Vale da Sombra da Morte**. ⚠️ **Não é uma criatura:** é a própria escuridão que avança no chão. Sem rosto, sem olho, sem rugido | Sl 23.4; Sl 91.1-2 | Avança devagar. **Recua diante da luz** — ou seja, o número de sementes é literalmente a defesa aqui |
| 🌫️ neblina que muda o chão | **A Sombra do Desejo** 🆕 | o **Terreno Encantado**, que faz o viajante acreditar num caminho falso | 1Co 3.18-20; 2Co 11.3 | Faz um trecho do chão "parecer" mais fácil. Descobre-se ao pisar. Nunca machuca: só engana |
| 🧱 coisa grande que senta no caminho | **O Grande Desespero** 🟡 | o gigante do **Castelo da Dúvida**. Não persegue: ele **senta na estrada** e cresce enquanto a criança tenta passar | 1Co 10.13; Jo 8.31 | A criança **não o vence com força**. Passa por cima usando o **Escudo da Fé** + uma semente — e a mensagem é *"quase parou, mas não parou"* |
| 🕳️ buraco / queda no vazio | **Vala de Sombra** | o custo de se afastar do caminho | — | Devolve ao último Marco. Sem dano, sem perda |
| 🌪️ chefe de fase | **A Tempestade** | Deus acalma a tempestade — e é **Ele** que acalma | Mc 4.35-41 | A criança **atravessa**; nunca é derrotada "pela força" da criança |
| 🐟 peixe | ❌ **PROIBIDO** | — | — | O grande peixe já é a história `Jonas 1.17` da Aventura; em formato de boss-divertido trivializaria o texto |
| 😈 demônio · Apolião · Belzebu | ❌ **PROIBIDO** | ver §1.4, item 2 | — | Vertical **genérica** (ADR-001) + regra do tom: sem medo como mecânica |
| 🏰 castelo que prende | ❌ **não é castelo.** É uma **noite fechada** | o Castelo da Dúvida, *depurado* | 1Co 10.13 | Sem prisão, sem chave, sem escuro fechado. A criança **volta ao Marco** — não fica presa |

⚠️ **Ponto em aberto (H5):** no SMB, o inimigo "bater na parede e morrer" é a
ameaça nº1 de uma criança pequena. O brain proíbe medo como mecânica, mas
também exige desafio. **Proposta:** o inimigo que **vence** a criança é **sempre
um obstáculo neutro** (espinho, pedra, sede), nunca uma criatura com intenção.
Se a criança for atingida por um espinho, ele **fica parado e dorme** (não
explode, não faz barulho, não "morre").

### 2.3 Blocos interativos

| Bloco SMB | Nome no jogo | Marco de Bunyan / conceito | Ref (NAA) | Regra |
|---|---|---|---|---|
| 🟨 bloco "?" | **A Rocha que Responde** | Deus deu água da rocha no deserto | Êx 17.1-7; Mt 6.32; Dt 8.15 | Dá **exatamente o que falta** para o próximo obstáculo. **Uma vez só.** Nunca sorteio, nunca caixa surpresa (anti-cassino, §4 do `jogos-game-design`) |
| 🟦 bloco "usado" | **Rocha aberta** | a mesma, já respondida | — | cinza, com marca |
| 🟩 bloco quebrável | **Muro de Espinhos** | o chão da Queda | Gn 3.17-19; Rm 8.19-22 | **Não quebra com força.** Rompe quando a **semente cresce** ou quando **passa a luz** |
| 🧱 bloco que cai com o grito 🆕 | **O Muro que Cai** | **Jericó** — cai com o **canto**, não com a força | Jos 6.4-5 | É o único bloco do jogo que cede a um som. ⚠️ **Nunca** a "dizer o nome de Jesus" como feitiço — ver §5, Risco 5 |
| 🟨🟦 blocos flutuantes | **A Nuvem que Guia** | a coluna que ia **à frente** do povo | Êx 13.21-22; Êx 14.19-20 | Plataforma que **se move junto com a criança** — é a "voz" que diz por onde ir |
| 🟩 hard block | **A Rocha do Marco** | pedra de memória: Jacó pôs uma pedra e chamou o lugar | Gn 28.18-22 | Sólida. Marca os checkpoints, à vista |

### 2.4 🆕 O COLETÁVEL — **A Semente da Palavra**, e a mecânica do "outro lado"

> Esta é a decisão do dono e o **coração novo** deste design. Ela reescreve o
> papel do coletável — e por isso mesmo exige o guarda-chuva de §2.4.3.

#### 2.4.1 O que a semente faz (o ganho)

Cada **Semente da Palavra** coletada dá, permanentemente dentro da etapa:

| Ganho | Efeito mecânico | Ref (NAA) |
|---|---|---|
| **Mais LUZ** 🟡 | O raio de visão à frente cresce: a criança enxerga mais longe **e as armadilhas que estavam escondidas** | **Sl 119.105**; **Jo 8.12** |
| **Mais FORÇA** 🟡 | Quebra mais Muros de Espinhos, chega mais alto, corre um pouco mais | Hb 12.1-2 |
| **Mais MARCA** | Cada semente deixa uma **pegada luminosa** no chão | Jo 8.11 |

> 💡 **A metáfora é a da luz, não a da bagagem.** A semente não é "peso" que
> atrapalha — é **lampeiro**. Essa escolha é o que mantém o jogo dentro da
> doutrina. (Ver §5, **Risco 9** — o risco mais perigoso deste projeto.)

#### 2.4.2 O que a semente cobra (o preço) — **"o outro lado"**

Aqui está o teu pedido, e ele está certo **desde que** o preço seja
**revelação**, nunca **culpa**:

- 🟡 **A Luz revela as Cancelinhas.** Cada 2 sementes, uma **Cancelinha** — a
  trilha estreita que sai da estrada reta e parece mais fácil e mais brilhante.
  Antes da luz, ela era invisível (e inofensiva). **Com** a luz, ela aparece —
  e agora pode ser escolhida.
- ⚠️ **O que acontece ao entrar na Cancelinha:** a criança sai da estrada, o
  cenário fica bonito e cheio de sementes, e o **Portão some de vista**. Ela
  pode até andar um bom trecho — e então a tela mostra, sem susto:
  > *"Esse caminho termina onde não tem caminho. Volta para a Estrada — e leva
  > suas sementes junto."* 🟡
- 🔒 **Voltar é sempre permitido, imediato e sem custo.** Ela **não perde** nada:
  nem semente, nem selo, nem estrela. `1Co 10.13` — Deus não deixa a prova ser
  maior do que a pessoa suporta.

| Referência do "outro lado" | Ref (NAA) |
|---|---|
| O caminho torto que parece mais fácil | Pv 14.12 |
| Os dois caminhos, e qual leva à vida | Mt 6.23 |
| O coração divided que é caminho duplo | Js 1.8 |
| De onde ninguém volta para contar | Pv 14.12 |

#### 2.4.3 🔒 O GUARDA-CHUVA — três regras inegociáveis

**O risco nº1 deste design:** se o jogo deixar a criança pensar que *juntar
muito da Palavra a faz cair*, o jogo vira **antiteatro da Bíblia**.

1. 🔒 **Nunca existe mensagem do tipo** "você juntou sementes demais", "pare de
   ler a Palavra", "a luz está te atrapalhando" ou "você está longe demais".
   **O custo é sempre `revelar`, nunca `preencher`.**
2. 🔒 **A semente nunca é perdida** — nem por queda, nem por Cancelinha, nem
   por fim de etapa. `Rm 8.38-39` 🟡 · `Fp 3.12-13`.
3. 🔒 **A graça vem sempre junto.** Toda vez que a luz cresce, **alguma coisa
   boa acontece visível ao mesmo tempo** (mais uma sementepillar revelada, uma
   plataforma, uma marca no chão, o Escudo da Fé). A criança **nunca** fica
   mais forte *e* mais sozinha. É essa a única leitura de "mais luz, mais
  aperto": **mais capacidade E mais companhia.**

#### 2.4.4 A companheira — **Esperança** 🟡

Do livro de Bunyan: **Esperança** (*Hopeful*) é quem acompanha Cristão depois da
Feira, quem discorda da Ignorância sobre a estrada do Rei, e quem no Rio diz
*"eu sinto o fundo, e ele é bom"*. Ela é exatamente a função anti-deriva que
esta mecânica precisa.

| Traço | Como funciona no jogo |
|---|---|
| **Marca o caminho** | Ela caminha alguns passos à frente e deixa **pegadas luminosas** no chão certo. Não se teletransporta, não "conserta" nada |
| **Nunca cobra** | Se a criança sai da estrada, Esperança **fala e espera** — não puxa, não grita, não tira a criança do controle |
| **Fala de grace** 🟡 | *"Eu também tropeço às vezes. Mas o fundo é bom."* (eco do Rio, sem ser citação) |

🔒 **Limite importante:** Esperança **não é auto-complete**. Ela **marca** o
caminho; a criança **escolhe**. Sem isso, o jogo treina obediência, não fé.

#### 2.4.5 Tabela dos itens (versão final)

| Item SMB | Nome no jogo | Conceito | Ref (NAA) | Efeito |
|---|---|---|---|---|
| 🪙 moeda | **Semente da Palavra** | a Palavra como luz | Sl 119.105; Jo 8.12 | **Luz + Força** (§2.4.1) |
| 🍄 cogumelo | **Escudo da Fé** | "o escudo da fé" | **Ef 6.16** | Anula **1** golpe. **Único** item defensivo |
| 🍒 cereja | **Água da Rocha** | a rocha que *acompanhava* o povo | Êx 17.1-7; 1Co 10.1-4 | Enche o medidor de Sede |
| ⭐ estrela | **A Nuvem que Guia** | a coluna à frente do povo | Êx 13.21-20 | Revela o mapa, marca o Marco. **Não causa dano** |
| 🪙 ×9 | **Os 9 Frutos do Coração** | os frutos do Espírito | **Gl 5.22-23** | Selos/figurinhas, **sem bônus de poder** |
| 🏁 bandeirinha | **O Portão** | a porta que se abre | Jo 10.9; Ap 22.1-2 | Fim de etapa |
| 🛤️ trilha lateral 🆕 | **A Cancelinha** | o caminho torto | Pv 14.12; Mt 6.23 | Entrar **é permitido** (e nunca punido); sair é **sempre** possível |
| — | **A Palavra do Dia** | a Palavra é o manancial | Sl 119.105 | Aparece **depois** da etapa, junto da referência |

#### 2.4.6 Resposta ao ponto levantado na review

> **"Semente da Vida" era acúmulo; agora é revelação.**

Motivo: com acúmulo, a recompensa é **quantidade** — e quantidade vira
comparação entre crianças ("quem juntou mais?") e vira *performance*. Com
**luz**, a recompensa é **visão** — e visão é o oposto de performance: ela te
mostra o que ainda precisa de cuidado. Isso casa com a missão do repo
(`jogos-game-design` §3: "erro nunca pune") e com a doutrina (graça, não
mérito). A "Semente da Vida" continua existindo — mas como **o jardim que
cresce no fim** (§2.6, etapa 12), não como contador.

#### 2.4.7 🆕 **A ORAÇÃO — como se enxerga o que é invisível**

> Pedido do dono: *"ele terá que clicar para orar de tempos em tempos, para
> fortalecer a comunhão com Deus e assim aparecerem as armadilhas do inimigo e ter
> auxílios. Se não, ele não verá os buracos e cairá / se machucará e perderá os
> botões de auxílio de Deus."*
>
> Esta seção é a **segunda perna** da mecânica de §2.4.1. Semente dá **luz
> acumulada**; oração dá **luz que se mantém acesa**.

##### O laço de jogo (o "outro lado" agora tem duas causas)

```
        ORAÇÃO (1 toque)  ──►  a luz acende  ──►  você VÊ:
                                              · os buracos (a Vala)
                                              · as armadilhas (a Cancelinha)
                                              · as Sementes da Palavra no chão
                                              · o Anjo que te guarda
                                              · os Selos da Palavra
                    │
                    └─ ao não orar: a luz APAGUE devagar
                          · o que sumiu continua lá — e agora é cego
                          · você cai, se machuca, perde força
                          · os auxílios não somem (ver 🔒 abaixo), ficam APAGADOS
```

**Um toque = luz cheia.** Nunca "quanto mais cliques, mais poder" (ver §5,
**Risco 10**). A oração é um **estado**, não uma **moeda**.

##### ⚠️ A correão obrigatória: "perder os auxílios" ≠ "Deus te abandonou"

O pedido original diz que a criança **perde os botões de auxílio de Deus** se não
orar. Escrito ao pé da letra, isso ensina **a coisa mais proibida da vertical**:
*"Deus abandona quem não ora"* — proibido em `batista-protestante.md` §5
("'Deus fica bravo/abandona'").

✅ **Enquadramento adotado — e ele é mais bonito que o original:**

> **Os auxílios nunca são retirados. Eles ficam apagados.**
>
> O anjo **continua ali, do lado da criança, o tempo todo**. O que acontece é que
> **a criança para de enxergar que ele está ali.** Não é Deus withdrawing —
> é a **criança distracting-se**.
>
> 🟡 *"O anjo não vai embora. A sua atenção é que foi embora um pouco. Vamos
> olhar de novo?"* (Nenhum texto pode dizer "Deus te abandonou". 🔒)

**Três regras que travam isso:**

| # | Regra |
|---|---|
| 1 | 🔒 **Nenhum texto, som ou animação pode sugerir abandono, castigo, xr inconcebível punição por não orar.** |
| 2 | 🔒 **Um único toque** reacende tudo. **Custo zero, espera zero, sem lives, sem perder semente, selo, estrela ou posição.** `1Co 10.13` |
| 3 | 🔒 A oração é **sempre visível** no HUD e **nunca some**. Ela não é um recurso escasso — é um hábito. |

##### O medidor

| Elemento | Regra |
|---|---|
| Nome no HUD | **Comunhão** 🟡 (não "barra de oração", não "fé") |
| Enche | **100% com um toque.** Sem mash. Sem acumula. |
| Esvazia | **lentamente**, ~20 s sem tocar 🟡 |
| Ao cair | **volta a 100%** (a graça restaura; `Lm 3.22-23` 🟡) |
| Acessibilidade | 🔒 **Modo Pequeninos: esvazia 3× mais devagar e mostra um aviso visual "toque aqui para orar"** antes de qualquer consequência |

##### O inimigo invisível — 🟡 **"O Sono do Coração"** (a peça que sugava)

O dono pediu um desafio **invisível** que **sugue alma/sangue**. Aqui está a
decisão mais delicada do projeto, porque a escolha da metáfora muda tudo:

| | Descrição |
|---|---|
| **Nome** | **O Sono do Coração** 🟡 (de Bunyan: *Sin-drowsiness*, o sono que cai sobre o peregrino e o faz **não ver o buraco à frente**) |
| **O que faz** | Não morde. **Apaga a luz**: a tela vai ficando **sem contraste** e os buracos somem. Se a criança não orar, ela **cai** |
| **"Suga alma/sangue"** | É **o dreno visual**, não o dreno de sangue. A criança sente que "algo puxou a energia dela" — sem sangue, sem cena, sem susto |
| **Não é** | ❌ demônio · ❌ possessão · ❌ possessão · ❌ "o pecado dentro de mim que me pune" |
| **Ref** | **`1 Ts 5.6-8`** — "vigiai", não durmam como os outros, o sentinela · **`Lc 18.1`** — "é preciso orar sempre" · **`Ef 6.18`** — "vigiando em oração" 🟡 |

> 🔴 **Por que NÃO "o pecado dentro de mim":** se o dreno for o pecado
> personally, o jogo diz que **orar mais é lessen o pecado** — e a criança
> entende "eu consigo ser melhor". Isso é **o legalismo do §5, Risco 6**, e
> **contradiz `Rm 8.38-39`** direto. O Sono do Coração é **descuido**, não PECADO:
o erro **escurece** (tom de graça da casa), mas **não suja**.

##### Os Selos da Palavra — o que a oração faz aparecer 🆕

Quando a criança ora, os **Selos da Palavra** **aparecem no ar**, com brilho,
e ficam **flutuando** até ela encostar:

| Selo | Ref (NAA) | Ao encostar |
|---|---|---|
| ✦ **Selo da Luz** | Sl 119.105 · Jo 8.12 | +1 Semente da Palavra (luz) |
| ✦ **Selo do Escudo** | **Ef 6.16** | Recarga do Escudo da Fé |
| ✦ **Selo do Guarda** | Sl 91.11 | **Chama o Anjo que Guarda** por uma travessia |
| ✦ **Selo do Caminho** | Êx 13.21-22 · Gn 28.15 | Revela o próximo trecho (inclusive a Cancelinha) |

🔒 **Regra dura:** o selo **nunca** exige precisão. É o **maior alvo de toque
do jogo inteiro** (≥ 64 px 🟡), com **ímã** de atração — a regra §2 do
`jogos-game-design` já pede isso para coleta.

##### 🆕 Os auxílios de Deus — **anjos de verdade**, não texto

O dono foi claro: *"Deus enviará anjos... não pode ser só um texto, tem que ter
som e tudo"*. ✅ **Concordo. Nenhum auxílio é um cartaz.**

| Auxílio | Ref (NAA) | O que FAZ (mecânica real) |
|---|---|---|
| 👼 **O Anjo que Guarda** | **Sl 91.11** · Gn 28.15 | Aparece **quando a criança ia cair** num buraco: **segura e leva de volta ao chão**, uma vez. Visível, com sombra, com som |
| 👼 **A Voz que Orienta** | Êx 3.6 🟡 | Fala **a direção** em voz alta (Piper), e um **rastro de luz** aparece no chão por 4 s 🟡 |
| ☁️ **A Nuvem que Guia** | Êx 13.21-22 · Sl 78.14 | Plataforma que aparece só depois da oração, e **move junto com a criança** |
| 🛡️ **O Escudo da Fé** | **Ef 6.16** | Bloqueia **1** golpe |

🔒 **Os anjos nunca matam, nunca atacam, nunca castigam.** Eles **sustentam,
mostram e acompanham.** É o mesmo verbo de `Hb 1.14` — anjos são *ministérios*
(a serviço). 🟡 Nenhum anjo tem rosto de ameaça: são **luzes com asas**,
estilo as colunas de `Êx 13.21`.

#### 2.4.8 🔊 **Som** — exigência explícita do dono

*"tem que ter som e tudo"* — ✅ **todo evento deste §2.4.7 tem áudio próprio**,
usando o que já existe em `games/src/lib/audio/`:

| Evento | Som (a criar) | Camada |
|---|---|---|
| Oração | **fôlego + um tom quente subindo** — não um "ding" profano | `sfx.orar()` 🆕 |
| Luz acende | *whoosh* curto + **o tema ganha uma camada** | `music.layer('luz')` 🟡 |
| Selo aparece | *ping* de cristal ascendente | `sfx.selo()` 🆕 |
| Selo coletado | *ping* + **número voando** | `sfx.collect()` + `fx.flyNumber` |
| Anjo que Guarda | **acorde de 2 notas** + luz dourada + sombra de contato | `sfx.anjos()` 🆕 |
| Alerta de "algo sumiu" | **um baque suave e grave**, **nunca um grito** | `sfx.aviso()` 🟡 |
| Queda | poeira + *pop* de aterrissagem (nada triste) | já existe |

🔒 **Três travas de áudio (regra da casa, `jogos-audio`):**
1. **Nada toca antes do primeiro gesto** da criança (iOS/Safari).
2. **Nada toca se o mudo do Hub estiver ligado.**
3. 🔒 **Nenhum som de terror** — o "algo sumiu" é um baque morno, **não** um
   grito, **não** um sussurro, **não** heartbeat de tensão.

🗣️ **Voz:** os avisos do Anjo são **narração Piper pré-gerada** (`pt_BR-faber-medium`),
pelo pipeline que já existe (`scripts/gen-voice.mjs` + `public/voice/manifest.json`,
hash FNV-1A em `lib/audio/hash.ts`). 🔒 **O mesmo tom humano do repo** — a voz
fala **com** a criança, nunca **para** ela.

### 2.5 Vidas, checkpoints e pontuação

| Item SMB | Proposta para este jogo | Justificativa |
|---|---|---|
| ❤️ ×3 vidas | ❌ **Não existem.** Coração único que **se regenera** | `jogos-game-design` §3: "erro não é game over" |
| Morrer = perde tudo | ❌ Ao cair, a criança **volta ao último Marco** **sem perder** semente, selo ou estrela | `Fp 3.12-13` (avançar, não recuar) 🟡 · "a graça não devolve o que já deu" (Rm 8.38-39) 🟡 |
| Bandeira de checkpoint | **A Rocha do Marco** — pedra com marca + a Nuvem como marcador visível | Gn 28.18-22 |
| Tela de "GAME OVER" | ❌ **Não existe.** A queda é narrada como *"volta um pouquinho e tenta de novo, sem pressa"* 🟡 | Proibido medo/culpa como mecânica |
| ⭐ estrelas | ⭐ 1-3 por etapa, **guardando sempre a melhor**, com **legenda** do motivo (`LevelDone` já faz) | padrão do repo |
| Cronômetro | **Tempo = bônus, nunca derrota** | §3 do game-design |
| Placar / ranking | ❌ **Nenhum.** Sem leaderboard | sem conta e sem analytics (ADR-001) |
| 💾 save | Autosave em **cada** Marco 🟡 | "Deus não te faz começar do zero" 🟡 |

### 2.6 As doze etapas — o mapa do Peregrino

Cada etapa **declara seu marco do livro** e sua **referência NAA**.

| # | Etapa | Ato | Marco de Bunyan | Ref (NAA) | Ganho de tela |
|---|---|---|---|---|---|
| 1 | **A Cidade de Escuridão** | 1 | Cidade da Destruição — de onde ele saiu | Rm 5.12; Rm 3.23 | Cidade **ao fundo**, ele vira as costas. Nunca é uma fase |
| 2 | **O Portão Estreito** | 1 | Portão Estreito / Boa Vontade | Jo 10.9; Mt 7.13-14; Jo 14.6 | Porta estreita; o único jeito de entrar |
| 3 | **A Casa do Intérprete** | 1 | Casa do Intérprete | 1Co 2.13-14; Jo 5.39 | Três telas que **mostram** sem explicar |
| 4 | **A Colina da Dificuldade** | 2 | Subida até o monte | Hb 12.1-2 | Subida íngreme; as **4 marcas** (Gl 5.22-23) nas portas de saída |
| 5 | **A Casa Bela** | 2 | Casa Bela — Discrição, Piedade, Prudência, Caridade | Gl 5.22-23 | Leões dormem; os 4 Companionheiros acendem **4 luzes** |
| 6 | **O Vale da Sombra** | 2 | Vale da Sombra da Morte | Sl 23.4; Sl 91.1-2 | 🌑 **Etapa-lua:** sua luz é a defesa. A mais bonita, não a mais assustadora |
| 7 | **A Feira das Vaidades** | 3 | Feira das Vaidades | 1Jo 2.15-17; Mt 6.24-25 | Prateleiras com coisas brilhantes. Nenhuma compra, nenhum preço |
| 8 | **O Castelo da Dúvida** | 3 | Castelo da Dúvida / Grande Desespero | 1Co 10.13; Jo 8.31 | 🟡 **Noturno, aberto.** Ele **senta na estrada**; a criança passa por cima |
| 9 | **As Montanhas Deliciosas** | 3 | Montanhas Deliciosas — 4 Pastores | Jo 10.11-15; Hb 13.8 | Topo de morro, 4 luzentes, o **Portão à vista** pela primeira vez |
| 10 | **O Terreno Encantado** | 3 | Terreno Encantado | 1Co 3.18-20; 2Co 11.3 | O chão muda de cor. A **Cancelinha** aparece aqui pela 1ª vez |
| 11 | **O Rio da Morte** | 4 | Travessia do Rio | Lm 3.22-23 🟡; Fp 1.6 | Água até o peito, não até a boca.🟡 **Esperança vai na frente** |
| 12 | **A Cidade Celeste** | 4 | A chegada | Ap 21.3-5; Ap 22.1-2; Sl 122.1-2 | **Sem inimigo.** Os **Dois Seres Brilhantes** no portão. O jardim com todas as sementes |

> ⚠️ **Etapa 12 — o fim, escrito com cuidado (§5, Riscos 6 e 7).** O texto final
> diz que **Deus** fez isso, e a última frase é **a missão de amanhã**
> (`Mt 28.19`; `1 Pe 4.10`) — não "você venceu". E o jardim final é o sinal da
> **criação restaurada**, não da conquista da criança.

### 2.6.1 🆕 Os ENCONTROS — o coração de *O Peregrino* (implementado)

> **Lacuna corrigida:** o livro não é um traversal, é uma sequência de
> encontros. Cada personagem de Bunyan para o Peregrino na estrada e **propõe
> uma escolha**. O jogo tinha mecânica (pular, semente, escudo, oração) sem
> essa alma. Agora **cada uma das 12 etapas tem um NPC com 2–3 escolhas**.

| # | Etapa | NPC (o que ele é no livro) | A escolha |
|---|---|---|---|
| 1 | Cidade da Escuridão | **O Evangelista** — acordou o Peregrino e apontou o caminho | O que te fez sair: o Chamado, o cansaço ou a curiosidade? |
| 2 | O Portão Estreito | **A Boa Vontade** — o guarda que pergunta o motivo de cada um | O que te traz ao Portão? |
| 3 | A Casa do Intérprete | **O Intérprete** — mostrou a lanterna e a espada | Para que serve a luz que Ele deu? |
| 4 | A Colina da Dificuldade | **Pliável** — o companheiro que achou a subida apertada e voltou | Segue, volta ou sobe sozinho? |
| 5 | A Casa Bela | **As Quatro Companheiras** — Discrição, Piedade, Prudência, Caridade | O que sustenta o coração cansado? |
| 6 | O Vale da Sombra | **A Voz que Orienta** — no vale, foi a voz que mandou seguir | Escuro: o que você faz agora? |
| 7 | A Feira das Vaidades | **O Mercador da Feira** — todos queriam comprar brilho | A alegria dele está à venda? |
| 8 | O Castelo da Dúvida | **O Grande Desespero** — sentou na estrada para desistir | Senta com ele ou levanta? |
| 9 | As Montanhas Deliciosas | **A Ignorância** — achava que chegaria só com boas maneiras | Chegar é por mérito ou por Ele? |
| 10 | O Terreno Encantado | **O Senhor do Mundo** — conhecia um atalho bonito | Aceita o atalho ou fica na estrada? |
| 11 | O Rio da Morte | **A Esperança** — entrou no rio com o Peregrino | Confia, se poura ou nada sozinho? |
| 12 | A Cidade Celeste | **Os Dois Seres Brilhantes** — anunciaram a obra do portão | Chegou: e agora? |

**Regras da tela do encontro** (travas da casa, `ADR-010` + `jogos-biblicos`):

- **Bunyan é inspiração, não autoridade**: toda fala é original, **zero citação**
  de tradução; Jesus nunca é portrayal (a Voz que Orienta e a Boa Vontade cobrem
  esse papel), e nenhum confessional aparece.
- **Erro não pune**: a opção errada é riscada e **corrigida com doçura pela
  própria personagem**; a criança escolhe de novo. Sem game over, sem perder
  semente, selo ou estrela. A escolha certa dá uma **bênção** (2 sementes, o
  Escudo, a luz ou a comunhão) — nunca "nota" ou "recompensa" por mérito
  (§5, Risco 6).
- **A referência NAA vem DEPOIS do acerto** (regra de ouro), com a fala do NPC.
- **Modo Pequeninos**: o NPC e cada opção são falados em voz alta (`🔊`).
- Gatilho **posicional** (fração da largura da estrada) — funciona nos mapas
  procedurais; teste garante que **nenhum NPC fica para trás do Portão**.

### 2.7 Chefes e Consumação

> ❌ **Nenhum chefe em lugar nenhum.** A "grande prova" de cada ato é **o terreno
> que endurece**, **a subida**, **a travessia** — coisas que se **atravessam**.
>
> E o **Ato 4 não tem inimigo nenhum**. Não é falta de conteúdo: é coerência.
> `Ap 21.4-6` descreve um mundo em que **não há mais choro nem grito**. Um
> chefe final ali seria um contranarrativo bíblico.
>
> O fim do jogo não é "você venceu o mal". É **"você chegou onde o mal já
> tinha sido vencido"** (Ap 21.5).

### 2.8 Resumo do mapa em uma linha

| SMB | Aqui |
|---|---|
| andar/correr/pular | ✅ igual, física de ponta definida na ETAPA 2 |
| 🪙 moeda | **Semente da Palavra** — dá **luz** (enxerga as armadilhas) e **força** |
| 🆕 trilha lateral | **A Cancelinha** — o "outro lado": mais bonita, sem saída |
| 🆕 o que segura a deriva | **Esperança**, que marca o caminho · **Escudo da Fé** |
| 🐢 🐛 🌑 | **Espinho** (vira flor) · **Bichinho do Pomar** (foge) · **A Sombra do Vale** (recua da luz) |
| 🟨 bloco "?" | **A Rocha que Responde** |
| 🟩 bloco quebrável | **Muro de Espinhos** (rompe com semente/luz, **não com força**) |
| 🧱 muro que cai | **O Muro que Cai** (Jericó — **canto**, não feitiço) |
| 🍄 cogumelo | **Escudo da Fé** |
| ⭐ estrela | **A Nuvem que Guia** |
| 🏁 bandeirinha | **O Portão** |
| 🌍 mundo 1-1 | **Ato 1 · Etapa 2** — com a **referência bíblica** no lugar do código |
| ❤️ vidas | **nenhuma** — volta ao Marco, sem perder nada |
| ✝️ botão de oração | **Comunhão** (1 toque = 100%) — acende a luz e faz aparecer os Selos |
| 👻 desafio invisível | **O Sono do Coração** — apaga o contraste, esconde os buracos. **Não é demônio** |
| 👼 auxílios | **O Anjo que Guarda** (`Sl 91.11`) segura a criança; **A Voz que Orienta** fala o caminho — com som, luz e sombra |

---

## 3. Textos e versículos — com referência e versão

### 3.1 Política de citação (regra adotada)

- **Versão: NAA** (Sociedade Bíblica do Brasil, 2017) — decisão travada no
  ADR-001. Formato no código: `Livro cap.vers (NAA)`.
- 🔒 **Nenhum texto de versículo entra no código por minha conta.** Cada
  conceito entra apenas com a **referência** (campo `ref`, exatamente como já
  existe em `GameEstradaDaLuz.tsx`, `GameHeroisDaBiblia.tsx` e
  `GameAventuraBiblia.tsx`). **O texto da NAA é preenchido por uma pessoa
  conferindo a fonte impressa da SBB.** Isso elimina a possibilidade de eu
  introduzir um erro de citação.
- **A explicação de termo difícil vai em separado**, em linguagem infantil, como
  manda o método do DNA Kids (citar na NAA e explicar embaixo). Nunca
  reescrever o texto bíblico e apresentá-lo como Escritura.
- **A referência aparece DEPOIS da ação, como prêmio** — nunca antes, como
  instrução de uso. (Já é a regra da casa.)
- Crédito obrigatório no rodapé:
  `NAA — Nova Almeida Atualizada® © 2017 Sociedade Bíblica do Brasil. Usada com permissão.`

### 3.2 Referências ✅ seguras (conceito biblicamente certo e já no padrão do repo)

| Conceito | Ref (NAA) |
|---|---|
| Os 9 frutos do Espírito | **Gl 5.22-23** |
| De onde eu vim / fui criado com valor | Gn 1.1 · Gn 1.27 |
| O mal entrou no mundo | Rm 5.12 |
| A Queda em forma de terreno hostil | Gn 3.17-19 |
| Deus amou · Jesus resgatou das trevas | Jo 3.16 · Cl 1.13 |
| Consumação: faz novas todas as coisas | Ap 21.3-5 · Ap 21.5 |
| Muro de Jericó cai com o grito | Jos 6.4-5 |
| Águas divididas | Êx 14.21-22 |
| Coluna de nuvem e de fogo | Êx 13.21-22 · Êx 14.19-20 |
| Dependência diária (maná) | Êx 16.1-4 · Êx 16.31-36 |
| Água da rocha | Êx 17.1-7 · 1Co 10.1-4 |
| Serpente erguida = vida para quem olha | Nm 21.4-9 |
| Deserto sem água | Nm 20.1-18 · Nm 21.10-20 |
| Escudo da fé | **Ef 6.16** |
| A porta | Jo 10.9 |
| O bom pastor · a ovelha achada | Jo 10.11-15 · Lc 15.4-7 |
| Avançar, não recuar | Fp 3.12-13 |
| Árvore da vida · rio da vida | Gn 2.7 · Ap 22.1-2 · Ap 22.14 |
| Libertação da criação | Rm 8.19-22 · Rm 8.21 |
| 🆕 **A Palavra é a minha luz** | **Sl 119.105** |
| 🆕 **A luz do mundo** (Jesus é a luz) | **Jo 8.12** |
| 🆕 Conhecerá a verdade | Jo 8.32 |
| 🆕 O caminho restrito e estreito | Mt 7.13-14 |
| 🆕 "Eu sou o caminho" | Jo 14.6 |
| 🆕 A prova não será maior que vós | 1Co 10.13 |
| 🆕 Permanecer na fé | Jo 8.31 |
| 🆕 Deus é refúgio e fortaleza | Sl 91.1-2 |
| 🆕 Nada nos separa do amor de Deus | Rm 8.38-39 |
| 🆕 A alegria do Senhor é a vossa força | Ne 8.10 |
| 🆕 Os 4 companheiros da Casa Bela | **Gl 5.22-23** (o mesmo texto dos frutos) |

### 3.3 🟡 Referências que exigem conferência na NAA impressa antes de virar texto

**Regra para estas: só a referência entra no código; o texto só depois de
conferido por uma pessoa.**

| Conceito | Ref | O que conferir |
|---|---|---|
| A Palavra é a minha luz | Sl 119.105 | NAA pode render "a minha luz" ou "meu lampião" |
| O Pai sabe do que você precisa | Mt 6.32 · Fil 4.19 | redação |
| A criação que geme / espera | Rm 8.19-22 | "geme" vs "sofre" varia entre versões |
| Misericórdias que se renovam | Lm 3.22-23 | "se renovam" vs "não se esgotam" |
| Escorpião e serpente ardente | Dt 8.15 | quais bichos aparecem |
| Dependência diária (verbo) | Dt 8.3 | verbo exato |
| Tempestade acalmada | Mc 4.35-41 · Sl 107.23-29 | o **fato** é certo; redação a conferir |
| Tarefa do homem no jardim | Gn 2.15 | "cuidar"/"administrar"/"trabalhar" |
| Árvore plantada junto de águas | Sl 1.3 | metáfora certa; redação a conferir |
| 🆕 **A cidade de Deus** (etapa 12) | **Sl 122.1-2** | divisão de versículos; o **fato** (casa de Deus) é certo |
| 🆕 **Avançar para o que está à frente** (etapa 11) | **Fp 1.6** | 🟡 **atenção:** pode soar a autoajuda. Conferir redação e o uso no contexto |
| 🆕 **A fonte das águas da vida** (etapa 11) | **Jo 4.10-14** · **7.37-38** | redação a conferir |
| 🆕 **Fé sem obras** (a Feira das Vaidades) | **Js 2.14-20** | 🟡 uso cuidado: a Feira é **ganância** (1Jo 2.15-17), não "obras". Não usar para sugerir que "a fé exige obras" |

⚠️ **Decisão pastoral 🟡 (levar ao dono):** `Nm 20.1-18` traz uma **repreensão a
Moisés** depois de ele bater na rocha. Se o jogo ensina "bati na rocha → saiu
água" e a criança (ou o pai no grupo) abrir `Nm 20`, aparece dissonância.
**Proposta:** mecanizar **Êxodo 17** (água sem repreensão) e deixar `Nm 20` fora
do jogo. Não é dogma — é curadoria de material. **Precisa de aval do dono.**

⚠️ **Não usar:** `Êx 33-34` (o rosto de Deus na tenda) como "mascote". É lindo e
tentador, mas o texto tem a tensão da pele/cabelo e uma proibição provisória.
🟡 Recomendação do agente teológico: deixar de fora.

### 3.4 Textos de tela (rascunho, sem versículo embutido)

| Tela | Texto |
|---|---|
| Abertura do Ato 1 | *"No princípio, Deus criou os céus e a terra."* — Gn 1.1 (NAA) |
| Erro / queda | *"O caminho ficou difficultoso. Volta um pouquinho e tenta de novo — sem pressa."* 🟡 |
| Fim de etapa | *"Você chegou. Deus preparou este caminho."* + `ref` da etapa + ⭐ 1-3 |
| Fim do jogo | *"Eis que faço novas todas as coisas."* — Ap 21.5 (NAA) + **"Deus cuidou de cada passo. Agora é hora de cuidar dos outros."** 🟡 (mesma ponte que `Meu Propósito` já faz) |
| Acerto no item | *"A rocha respondeu! Agora você tem água."* 🟡 |

> Todos os 🟡 precisam de leitura do dono antes de virarem tela.

---

## 4. Onde este jogo **desvia** das regras vigentes (e por quê)

| Regra vigente | Desvio | Justificativa | Precisa de ADR? |
|---|---|---|---|
| `jogos-game-design` §9.1: "reusar um dos 6 motores, **não** criar categoria nova" | Platformer é a **1ª categoria fora dos motores** | Nenhum dos 6 (`Choice`/`Puzzle`/`Count`/`Hidden`/`Connect`/`Sort`) tem locomoção contínua | **SIM** — ADR-010 |
| ADR-002 D1: em retrato, mostrar aviso "vire o aparelho" | Mantido, mas o aviso precisa cobrir **canvas** | o mundo é largo e contínuo | Não (herda D1) |
| ADR-002 D3: sprites WebP em `public/sprites/` | **Mantido como destino final.** Na ETAPA 2 vira pixel art placeholder desenhada em Canvas (retângulos coloridos) | ADR-002 já tem emenda SVG inline; para Canvas a via é WebP ou atlas | Não (só registrar) |
| §3 do game-design: "1 gesto por decisão", sem precisão | **Desviado no Ato 3**: correr e pular com precisão exige leitura de padrão | é o que faz ser platformer | **SIM** — ADR-010 |
| `MIN_LEVELS = 5` | 12 etapas — excede | — | Não |
| `data/games.test.ts` exige `faixa` + `tipo` | `faixa: '7-9'`, `tipo: 'at-nt'` | ver §6.2 | Não |

---

## 5. Onze riscos de trivializar o sagrado — e como cada um é resolvido

> Um platformer é um jogo de "eliminar obstáculos". Em um ministério infantil,
> isso precisa de freio explícito. Não é escoro; é parte do design.
> Os riscos 8 e 9 foram acrescentados com a adoção de *O Peregrino* e da
> mecânica das sementes.

### ⚠️ Risco 1 — O jogo ensina "pessoas são obstáculos que se eliminam por vantagem"

**Onde dói:** `pisar em cima → o monstro morre → +100 pontos` ensina, em três
anos de prática, que o outro é um alvo.

**Como resolvido:**
1. **Stomp = transformar, não eliminar.** O espinho pisado vira flor; a semente
   pisada revela um selo. 🟡
2. **Nenhum inimigo tem intenção maligna.** Não persegue, não trama, não tem
   rosto de mau.
3. **O Ato 2 não tem vilão: o adversário é o chão.** Leitura direta de
   `Gn 3.17-19`, e é a maior vitória de tom do projeto.

### ⚠️ Risco 2 — "Game over" ensina que errar = ser descartada

**Onde dói:** a criança que aperta "Recomeçar" e volta ao zero aprende que
errar é ser descartada. Em ministério infantil, esse é o planting mais caro que
existe.

**Como resolvido:** corações não zeram, nada coletado se perde, a queda é
narrada como "volta um pouquinho e tenta de novo, sem pressa" 🟡. **Não existe
tela de "FIM DE JOGO".** A única consequência é a câmera voltando mais devagar.

### ⚠️ Risco 3 — O medo como dificuldade

**Onde dói:** fase escura, som de grito, inimigo que surge de repente. O susto
vira "motivo para não errar" — isso é educação por medo, proibido pela vertical.

**Como resolvido:**
- A **noite é um bioma seguro e bonito** (ceu estrelado + Coluna de Fogo) — nunca
  um nível assustador.
- **Zero SFX de terror** em `lib/audio/`.
- Nada de tela escura com "algo se aproxima". Nada de contador regressivo.

### ⚠️ Risco 4 — "Armadura de Deus" lida como aparelho de combate

**Onde dói:** `Ef 6` é a passagem mais citada fora de contexto do Novo
Testamento. Desenhar a espada, dar dano com a armadura e chamar a Fé de "poder
de ataque" ensina que **fé é violência santa**.

**Como resolvido:**
- A lista inteira (`Ef 6.10-18`) é a progressão de equipamento do Ato 3 🟡, mas:
- 🔒 **a espada nunca é desenhada.** O item da "Palavra" é uma **lanterna** que
  revela o caminho (ancorado em `Sl 119.105`, **não** em `Jo 8.12` — que já é a
  referência central de `A Estrada da Luz`);
- 🔒 **o único item defensivo é o escudo** (`Ef 6.16`);
- a armadura **não machuca** ninguém.
- 🟡 **"capacete da salvação"**: mantido (está no texto), mas a cobertura de
  cabeça é tema sensível em tradições batistas — **decisão do dono**.

### ⚠️ Risco 5 — O nome de Deus como feitiço *(o risco mais subestimado do gênero)*

**Onde dói:** é natural, num platformer, o bloco quebrar com "grita o nome de
Jesus". Isso **vira magia** — e é a forma mais rápida de profanar o sagrado num
jogo de ação. É também o que uma criança de 5 anos leva para a sala de aula.

**Como resolvido:**
1. 🔒 **Nada quebra por nome.** A rocha abre por **água**, o muro de Jericó cai
   por **canto** (`Jos 6.4-5` — a própria narrativa), o muro de espinhos abre por
   **semente/luz**.
2. Se houver um "grito" mecânico, ele é explicitamente **louvor** 🟡 — nunca
   "palavra mágica".
3. 🔒 **Proibido "fazer o sinal da cruz para pular"** 🟡.

### ⚠️ Risco 6 — Legalismo e meritocracia ("bom = venceu a fase")

**Onde dói:** ⭐ 3/3 + "perfeito" + "você é um bom cristão". A criança internaliza
performance como espiritualidade. É o erro clássico de todo game-based
discipleship.

**Como resolvido:**
- 🟡 **Quem muda o mundo é Deus, não a criança.** O que muda o cenário é a
  *intervenção* dele (água, semente, nuvem), não a habilidade da criança
  (`Jo 10.11-15`; `Lc 15.4-7`).
- **O progresso é dom, não vitória.** A mensagem final tem **verbo passivo /
  empresarial divino**, não "você conseguiu".
- 🔒 **Nunca "acerte as tentações" como minigame.** É moralismo, humilha quem
  falha e cria a ideia de pureza por performance. ⭐ é souvenir, não veredito.

### ⚠️ Risco 7 — "Consumação" como final feliz de jogo (quietismo)

**Onde dói:** `Ap 21` é **promessa de Deus**, não conquista do jogador. E o
oposto também é erro: um mundo sem conflito é fantasia de fuga, não salvação.

**Como resolvido:**
- O Ato 4 é a única fase sem inimigo (coerente com `Ap 21.4-6`), mas a tela
  final diz que **Deus** fez isso, e termina com **a missão de amanhã**:
  `Mt 28.19` · `1 Pe 4.10` 🟡 — mesma ponte que `Meu Propósito` (7-9) já faz, para
  o catálogo ficar coerente.

### ⚠️ Risco 8 🆕 — *O Peregrino* virar **Bíblia paralela**

**Onde dói:** *O Peregrino* é o segundo livro mais lido da história cristã depois
da Bíblia. Uma criança de 7 anos vai citar "o Portão" e "o Castelo da Dúvida"
**com a mesma autoridade** com que cita `Jo 3.16`. E o livro traz coisas que a
Bíblia não diz — inclusive detalhes que **não são verdade**.

**Como resolvido:**
- 🔒 **Toda** tela, placa e fala carrega uma **referência NAA visível**. Bunyan
  nunca aparece como fonte de um ensino, só como a história que ilustra.
- 🔒 Nos créditos: *"Inspirado em *O Peregrino*, de John Bunyan (1678) — obra
  em domínio público. Texto e arte próprios."* Bunyan é **autor humano**.
- 🔒 **Nenhuma citação de tradução.** Nenhuma frase de traduções brasileiras
  recentes (direitos autorais). Todo texto é nosso (ver §7.1).
- 🔒 **Nenhum gigante confessional** entra: sem Papa, sem Pagão, sem Belzebu, sem
  Apolião (ver §1.4, item 2). A vertical é **genérica** (ADR-001).

### ⚠️ Risco 9 🆕 — **A mecânica das sementes virando "ler a Biblia te faz cair"**

**Este é o risco nº1 do projeto inteiro.** A ideia pedida — *"quanto mais
sementes, mais forte, mas mais fácil desviar para o lado mal"* — é boa **na
intenção** e perigosa **na letra**: lida literalmente, ensina que **a Palavra
de Deus afasta de Deus**.

**Por que é o risco nº1:** é a única parte do design que pode ensinar algo
**oposto** ao que a casa inteira ensina (`Sl 119.105`, `Jo 8.12`).

**Como resolvido (as três travas de §2.4.3, resumidas):**
1. 🔒 **O preço é `revelar`, nunca `preencher`.** Mais semente = mais luz = você
   enxerga **as armadilhas que já estavam ali**. A luz não cria o perigo; ela
   mostra. Isso é o oposto de "a Palavra te faz cair": é "a luz te mostra o que
   já precisava ser mostrado".
2. 🔒 **Proibido todo texto de "carga excessiva".** Nenhuma voz, placar, dica ou
   animação pode sugerir "você juntou demais", "está longe", "pare de ler".
3. 🔒 **Mais força = mais companhia, nunca mais solidão.** Cada vez que a luz
   cresce, **algo bom aparece junto** (pegadas, plataformas, o Escudo). E
   **Esperança** (§2.4.4) nunca sai de cena — é ela quem marca a estrada.
4. 🔒 **A semente nunca é perdida** — `1Co 10.13`.

> **Teste de aceitação (obrigatório antes de aprovar):** uma criança de 8 anos
> jogando deve sair dizendo *"quando eu leio mais, eu enxergo mais coisa"*.
> Se sair dizendo *"não devia ter lido tanto"*, **o design está errado** e
> volta para a ETAPA 1.

### ⚠️ Risco 10 🆕 — **"Orar" virar métrica de desempenho** (o legalismo que nasce da sua ideia)

**Onde dói:** a mecânica pedida tem duas armadilhas que viram doutrina
errada com muita facilidade:

1. **"Orar mais = mais pontos"** → a criança aprende que a oração é
   **performance religiosa**, e que Deus responde conforme a frequência do
   botão. Isso é exatamente o oposto de `Jo 3.16` e da graça da casa.
2. **"Não orar = Deus tira o auxílio"** → ensina que **Deus é condicional e
   reage à criança**. Proibido em `batista-protestante.md` §5.

**Como resolvido:**

| Armadilha | Trava aplicada |
|---|---|
| Orar = ganhar | 🔒 **Um toque = 100%.** Sem mash, sem bônus de quantidade, sem pontuação. O prêmio da oração é **INFORMAÇÃO** (ver o que é invisível), nunca número |
| Orar = desbloquear poder | 🔒 Os auxílios **já estão no mundo**. Oração não **concede** — ela **faz perceber**. Ver §2.4.7 |
| Não orar = castigo | 🔒 A luz **apaga**, não "some". O anjo **fica**, a criança é quem **não vê**. 🟡 *"o anjo não vai embora, a sua atenção é que foi"* |
| Recarga cara | 🔒 **Um toque, custo zero, instantâneo**, sempre. Nunca tira semente, selo, estrela ou posição |
| Punição acumulada | 🔒 `1Co 10.13` — a prova nunca é maior que a pessoa |
| Sozinho | 🔒 A oração **sempre tem companhia**: Esperança marca o caminho (§2.4.4) e a voz do Anjo fala em voz alta |

**Modo Pequeninos (3-4) 🔒 obrigatório:** a oração é **automática**. A criança
não pode ser punida por não entender o botão. O "toque para orar" vira um
**ícone grande e pulsante**, e o-catalogo esvazia 3× mais devagar (§2.4.7).

> **Teste de aceitação:** a criança deve sair dizendo *"quando eu rezo, eu
> enxergo o que estava escondido"*. Se sair dizendo *"Deus bravo comigo"*,
> **o design está errado** e volta para a ETAPA 1.

### ⚠️ Risco 11 🆕 — **A oração virar "palavra mágica"**

**Onde dói:** é a mesma armadilha do §5 Risco 5, agora com um botão. Um clique
=Feitiço é herança direta dos jogos de plataforma e **profana** na mesma hora.

**Como resolvido:**
- 🔒 **O botão não diz o nome de ninguém.** Ele é o **ícone universal de oração**
  (mãos juntas / luz que acende) — sem texto, sem sílaba, sem fórmula.
- 🔒 **A oração não quebra bloco nenhum.** Blocos caem com **luz**, com
  **semente** ou com **canto** (Jericó) — **nunca** com oração.
- 🔒 **Quem reza não ganha poder.** Ganha **visão**. (§5, Risco 10)
- 🔒 A "Palavra" que aparece não é formulada nem ditada: é **a Palavra de Deus
  revelada**, e a criança **a recebe**, não a invoca.

---

## 6. Decisões de engenharia que precisam do teu aval

### 6.1 Stack (resolvendo o conflito da tua especificação)

Tua spec: *"HTML5 Canvas + JavaScript puro, em index.html + /src"*.
Repo: **React + Vite + TypeScript**, 1 `index.html`, `src/` já cheia.

**Proposta:**

| Item | Decisão |
|---|---|
| Render | **Canvas 2D** ✅ |
| Loop | **timestep fixo 60 FPS** com acumulador ✅ |
| Colisão | **AABB separada por eixo** (X, depois Y) ✅ |
| Mapa | **tiles em array 2D** ✅ |
| Câmera | scroll horizontal ✅ |
| Linguagem | **TypeScript** (não JS puro) — o repo é `tsc` + vitest; JS puro quebraria o gate |
| Isolamento | Motor **fora do React**: um `useRef` para o `canvas`, estado do mundo **dentro do loop**, nunca em `useState` por frame (é o bug já corrigido na Fase 1) |
| Dependências | **zero** novas |
| Arquivos | `src/lib/platformer/` (motor) + `src/components/games/GameAGrandeJornada.tsx` (casca React) |

### 6.2 Classificação no catálogo

| Campo | Valor | Razão |
|---|---|---|
| `faixa` | **`'7-9'`** | correr + pular com precisão exige leitura de padrão, que 3-4 não tem |
| `tipo` | **`'at-nt'`** | Gn/Êx/Nm no Ato 1-3; Ap no Ato 4 |
| `status` | `'pronto'` ao final | — |
| Modo Pequeninos | **obrigatório** — `isSmallKidsMode()` de `lib/prefs.ts`: **auto-pulo** + Nuvem guiando + placa maior | o `isSmallKidsMode()` já existe e todo jogo novo **deve** respeitar |

### 6.3 Skill nova (autorizada por ti)

Vou criar **`jogos-platformer`** antes de escrever código, com o que **não** está
em `jogos-game-design`:

- constantes de física de feel SMB (aceleração, atrito, altura variável de pulo,
  *coyote time*, *jump buffer*, *apex hang*, *screen shake* no aterrissagem);
- convenção de tiles e camada de colisão;
- padrões de inimigo (patrulha, *stomp*, não-matar);
- checklist de perf de Canvas em celular (`jogos-mobile` §5: `dvh`, safe area,
  `imageSmoothingEnabled = false`, atlas, teto de partículas);
- **os 4 desvios** deste jogo (§4) registrados como regra da skill, para que o
  próximo platformer já nasça com eles.

### 6.4 Perguntas que precisam de resposta

**Respondidas na 2ª rodada:**

| # | Pergunta | Resposta |
|---|---|---|
| ✅ Q1 | Nome do jogo | **"A Grande Jornada"** |
| ✅ Q2 | Coletável | **"Semente"** — e a mecânica da §2.4 (luz + força, com a Cancelinha) |
| ✅ Q3 | Tema | **Inspirado em *O Peregrino*, de Bunyan** |

**Ainda abertas:**

| # | Pergunta | Recomendação |
|---|---|---|
| **Q4** | **Aceita o enquadramento da §2.4?** A semente dá **luz** (vê as armadilhas) e **força**, e a **Cancelinha** é o "outro lado" — sem nunca sugerir "juntou demais" | ✅ |
| **Q5** | **Aceita Esperança como companheira** que marca o caminho com pegadas, sem auto-complete? | ✅ |
| **Q6** | **Aceita os filtros do Bunyan** (§1.4): sem Apolião, sem Belzebu, sem Papa/Pagão, e sem polarização de igreja? | ✅ |
| **Q7** | **Aceita a "Sombra do Vale"** (escuridão que avança, sem rosto) como inimigo da etapa 6? | ✅ |
| **Q8** | **H5:** inimigo que acerta a criança **dorme** em vez de explodir? | ✅ aprovar |
| **Q9** | Manter **Êxodo 17** e deixar **Números 20** fora? | ✅ aprovar |
| **Q10** | Manter **Êxodo 33-34** fora (rosto de Deus)? | ✅ aprovar |
| **Q11** | "Capacete da salvação" (`Ef 6.17`) entra como item? | 🟡 tua decisão |
| **Q12** | Escrever o **ADR-010** antes de codar? | ✅ recomendo |
| **Q13** | Faixa única `7-9` + Modo Pequeninos? | ✅ |
| **Q14** 🆕 | **Aceita "a oração acende a luz e os auxílios ficam apagados"** em vez de "a oração ganha/retrai os auxílios"? (§2.4.7 — evita "Deus te abandonou") | ✅ **essencial** |
| **Q15** 🆕 | **Aceita "O Sono do Coração"** como o dreno invisível — em vez de demônio ou do "pecado dentro de mim"? (§2.4.7) | ✅ **essencial** |
| **Q16** 🆕 | **Aceita os 4 Selos da Palavra** (Selo da Luz / do Escudo / do Guarda / do Caminho) que aparecem **quando se ora**? | ✅ |
| **Q17** 🆕 | **Aceita um toque = 100% da Comunhão** (sem mash, sem pontuação por orar)? | ✅ **essencial** |
| **Q18** 🆕 | **O botão de oração é só ícone**, sem palavra — e **nenhum bloco quebra por oração**? (§5, Risco 11) | ✅ |
| **Q19** 🆕 | **Anjos de verdade, com som e sombra** (`Sl 91.11`) — nunca cartaz nem texto? | ✅ |
| **Q20** 🆕 | No **Modo Pequeninos**, a oração é **automática** (3-4 não pode ser punida por não entender)? | ✅ |

---

## 7. Conformidade

### 7.1 Propriedade intelectual — Nintendo / Mario

**Não há o que licenciar.** "Andar, correr, pular, bloco, inimigo, coletável,
fim de fase" é **gênero**, não obra autoral. A `Lei 9.610/98`, art. 2º, §1º,
XI, não protege "ideias, métodos, processos, sistemas e técnicas"; no direito
internacional, TRIPS art. 33 exclui "ideas, methods, concepts".

**O que É protegido é a concretização** — e é aí que a violação acontece na
prática. Checklist de arte, obrigatório:

- ❌ Nada de bloco "?" marrom com cantoneiras pretas (é o tile exato do Mario).
  A **Rocheta que Responde** é outra forma: pedra marcada / barro com pegada.
- ❌ Nada de moeda dourada girando (resolvido: o coletável é **semente/selo**).
- ❌ Nada de cano verde, cogumelo-com-rosto, turtle, castanha, dragão.
- ❌ Nada de silhueta de dinossauro/placa com "4 blocos e nome" (é o mapa de
  fases do Mario). Aqui é **"Ato 1 · Etapa 2"**, com a **referência bíblica** no
  lugar do código.
- ❌ **Zero** ocorrência de "Mario", "Nintendo", "Super", "World",
  "recreate/remake of" em nome, subtitle, `og:`, README ou commit.
- ✅ Declaração de identidade no README: *"jogo original de plataforma, arte e
  código próprios, inspirado no gênero"*.
- ✅ Princípio **clean-room: 0 asset externo**.

### 7.1bis Propriedade intelectual — *O Peregrino* (Bunyan)

| Ponto | Situação |
|---|---|
| **A obra de 1678** | ✅ **Domínio público** (Bunyan morreu em 1688). Não exige licença nem permissão. |
| **As traduções brasileiras modernas** | ⚠️ **Direitos autorais de terceiros.** 🔒 **Não vamos copiar frase de nenhuma tradução** (nem da Edições Evangélica Selecionadas, nem de nenhuma). **Todo texto de tela é escrito do zero por nós**, em PT-BR infantil. |
| **O tema, a estrutura, os lugares** | ✅ Não protegidos — TRIPS art. 33 exclui "ideas, methods, concepts"; `Lei 9.610/98` art. 2º, §1º, XI, idem |
| **A polêmica confessional** | ✅ Sem polêmica confessional: sem Papa, sem Pagão, sem Apolião, sem Belzebu (ver §1.4) |

**Crédito nos créditos do jogo:**
> *Inspirado em "O Peregrino", de John Bunyan (1678) — obra em domínio público.*
> *Todos os textos, arte e código são originais.*

> 🟡 Isto não é parecer jurídico. Se a vertical crescer ou for comercializada,
> vale meia hora de advogado de PI.

### 7.2 Marca e material de igreja

- Vertical **genérica** (ADR-001). Sem nome, logo, identidade nem cor
  institucional de igreja alguma. O material da Lagoinha é referência interna de
  tom e **não vai para o produto**.
- Sem tela de "desenvolvido pela igreja", sem tutorial de "bem-vindo ao
  Ministério X".
- Sem hinos nem letras conhecidas na trilha (direitos autorais!). A trilha é
  **autoral sintetizada** (ADR-002 D6). Se a criança cantar em voz alta, é um
  **canto original**.
- O crédito da SBB é **texto** no rodapé — **não** a logomarca, que é marca
  registrada.

### 7.3 LGPD / criança

- Sem conta, sem login, sem analytics de criança.
- Progresso **só** em `localStorage` (`lib/progress.ts`).
- 🔒 Nada de "envia seu placar para o servidor", nada de ranking global.

---

## 8. Se aprovado, o que acontece

**ETAPA 2 (mecânica):**
1. Criar a skill `jogos-platformer`.
2. Escrever o `ADR-010` no brain-jogos (tema, economia de coletável, tom do
   stomp, Consumação sem chefe).
3. `src/lib/platformer/` — motor: loop 60 FPS fixo, física (aceleração, atrito,
   pulo de altura variável, gravidade), tiles 2D, AABB por eixo, câmera,
   blocos `?`/quebráveis, inimigos com patrulha, HUD, pixel art placeholder.
4. `GameAGrandeJornada.tsx` — casca React (`GameShell`, `PauseOverlay`,
   `LevelMap`, `LevelDone`, Modo Pequeninos, `GameShell` seguro em iPhone).
5. **12 etapas** em formato `GameLevel` (compatível com `lib/levels.ts`).
6. Gate: `bun run typecheck && bun run test && bun run build`.

**ETAPA 3 (integração):** aplicar os nomes/textos/refs deste documento no
código e passar por revisão teológica antes de finalizar.

**Nada disso foi escrito ainda.** Este é o ponto de decisão.
