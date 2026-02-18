#!/usr/bin/env node
/**
 * Gera artigos reais como correspondente oficial do Bola na Rede
 * Baseado em notícias verificadas de fevereiro 2026
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '../public/articles/pt-BR');
const IMAGES_DIR = path.join(__dirname, '../public/images/articles');
const DATA_DIR = path.join(__dirname, '../data');
const SITE_URL = 'https://portal-production-d8e6.up.railway.app';

// ============================================================
// ARTIGOS REAIS - Escritos pelo correspondente Bola na Rede
// ============================================================

const articles = [
  // ── BRASILEIRÃO ──────────────────────────────────────────
  {
    id: 'brasileirao-3a-rodada-resultados-12-fev',
    title: 'Brasileirão 3ª Rodada: Corinthians Sobe, Fluminense Vence Clássico e Remo Arranca Empate Heroico',
    excerpt: 'Noite de emoções na terceira rodada do Brasileirão 2026. Hugo Souza brilha pelo Corinthians, Acosta faz golaço no Maracanã e Atlético-MG leva empate do Remo aos 87 minutos.',
    category: 'brasileirao',
    publishedAt: '2026-02-13T08:00:00.000Z',
    readingTime: 6,
    tags: ['Brasileirão 2026', '3ª Rodada', 'Corinthians', 'Fluminense', 'Remo'],
    body: `
      <p><strong>A terceira rodada do Brasileirão Betano 2026 entregou tudo o que o torcedor brasileiro esperava: golaços, viradas, polêmicas e um final de jogo que entrará para a história.</strong></p>

      <h2>Corinthians x Bragantino — Hugo Souza decide</h2>
      <p>Na Neo Química Arena, o Corinthians precisou do seu goleiro para garantir os três pontos contra o Red Bull Bragantino. Hugo Souza fez pelo menos três defesas decisivas no primeiro tempo, quando o Massa Bruta pressionou e acertou a trave duas vezes. No segundo tempo, o Timão encontrou espaços e venceu com autoridade, subindo na tabela do campeonato.</p>

      <h2>Fluminense 3 x 1 Botafogo — Clássico no Maracanã</h2>
      <p>O Fluminense dominou o clássico carioca no Maracanã. O destaque foi Thiago Acosta, que acertou um chute de fora da área que entrou no ângulo esquerdo do goleiro alvinegro — candidato forte a gol mais bonito da rodada. Savarino e Canobbio completaram a goleada tricolor, consolidando o bom momento da equipe de Mano Menezes.</p>

      <h2>Atlético-MG 3 x 3 Remo — O jogo que parou o Brasil</h2>
      <p>Se alguém duvidava que o Remo merecia estar na Série A, esse jogo calou todos os críticos. Perdendo por 3 a 0 para o Atlético-MG no Mineirão, o Leão Azul — de volta à elite após 32 anos — marcou três gols após os 87 minutos e arrancou um empate que será lembrado por décadas. É o primeiro representante da Região Norte na Série A desde o Paysandu em 2005, e já mostrou que veio para brigar.</p>

      <h2>Outros resultados</h2>
      <p>No Beira-Rio, Internacional e Palmeiras fizeram jogo equilibrado com o Verdão levando a melhor por 3 a 1, com Abel Ferreira reclamando da arbitragem após a partida. O Mirassol arrancou empate de 2 a 2 contra o Cruzeiro com pênalti convertido nos acréscimos. A rodada também marcou o confronto Athletico-PR x Santos na Arena da Baixada, com mais uma derrota do Peixe, que vive momento complicado na temporada.</p>

      <h2>Classificação parcial</h2>
      <p>Com a pausa para os estaduais e o Carnaval, o Brasileirão só volta em 25 de fevereiro. É a primeira vez que o campeonato é disputado do início ao fim do ano, com intervalo previsto para a Copa do Mundo entre junho e julho. O novo formato já mostra que promete ser a edição mais emocionante da história.</p>
    `
  },
  {
    id: 'remo-volta-serie-a-32-anos-emocao',
    title: 'Remo na Série A: Após 32 Anos, o Leão Azul Volta à Elite e Já Dá Show no Mineirão',
    excerpt: 'O Remo é o primeiro representante da Região Norte na Série A desde 2005. Na estreia no Mineirão, arrancou empate de 3 a 3 com o Atlético-MG após estar perdendo por três gols.',
    category: 'brasileirao',
    publishedAt: '2026-02-14T10:00:00.000Z',
    readingTime: 5,
    tags: ['Remo', 'Série A', 'Região Norte', 'Brasileirão 2026'],
    body: `
      <p><strong>O Leão Azul rugiu no Mineirão. E o Brasil inteiro ouviu.</strong></p>

      <p>O Remo voltou à Série A do Campeonato Brasileiro depois de 32 anos de ausência. É o primeiro clube da Região Norte a disputar a elite do futebol nacional desde que o Paysandu foi rebaixado em 2005. Só isso já seria histórico. Mas o que aconteceu na terceira rodada ultrapassou qualquer roteiro imaginável.</p>

      <h2>Três gols em três minutos</h2>
      <p>Aos 87 minutos de jogo contra o Atlético-MG, o placar marcava 3 a 0 para o Galo. Tudo parecia decidido. O que se viu em seguida foi uma das maiores reações da história do Brasileirão: o Remo marcou três gols nos minutos finais e arrancou um empate que fez a torcida no estádio e em Belém explodir de emoção.</p>

      <h2>O que o Remo representa</h2>
      <p>Mais do que resultados, a volta do Remo à Série A é um símbolo para o futebol do Norte do Brasil. A região, historicamente marginalizada no cenário nacional, agora tem voz na principal competição do país. O clube chegou com investimento da SAF, reforços pontuais e uma torcida que não parou de apoiar nem nos anos mais difíceis da Série C.</p>

      <p>O novo formato do Brasileirão 2026 — do início ao fim do ano — também ajuda clubes como o Remo a se planejarem melhor, sem a correria da janela curta de meio de ano. Com a pausa para a Copa do Mundo entre junho e julho, o Leão Azul terá tempo de se reorganizar para a segunda metade da competição.</p>

      <h2>Próximos desafios</h2>
      <p>O Remo agora precisa manter os pés no chão. A permanência na Série A é o objetivo principal, e cada ponto fora de casa vale ouro. Mas depois do que mostrou no Mineirão, ninguém mais vai subestimar o Leão Azul.</p>
    `
  },

  // ── NEYMAR ──────────────────────────────────────────────
  {
    id: 'neymar-volta-gramados-santos-6x0-velo-clube',
    title: 'Neymar Volta aos Gramados: Camisa 10 Entra no Intervalo e Santos Goleia Velo Clube por 6 a 0',
    excerpt: 'Em sua primeira partida de 2026, Neymar jogou o segundo tempo inteiro na Vila Belmiro, mostrou mobilidade e distribuiu passes. Santos goleou o Velo Clube por 6 a 0 pelo Paulistão.',
    category: 'neymar',
    publishedAt: '2026-02-16T08:00:00.000Z',
    readingTime: 5,
    tags: ['Neymar', 'Santos', 'Paulistão 2026', 'Vila Belmiro'],
    body: `
      <p><strong>A Vila Belmiro parou. Neymar Jr. voltou a vestir a camisa do Santos em jogo oficial em 2026, e o Peixe respondeu com uma goleada histórica.</strong></p>

      <p>No dia 15 de fevereiro, o Santos recebeu o Velo Clube pelo Campeonato Paulista e venceu por 6 a 0. Mas o resultado ficou em segundo plano diante do retorno do camisa 10. Neymar entrou no intervalo, substituindo um dos titulares, e permaneceu em campo durante todo o segundo tempo.</p>

      <h2>Como foi a atuação</h2>
      <p>Logo nos primeiros minutos, Neymar mostrou que a mobilidade está voltando. Tentou dribles curtos, distribuiu passes de primeira e ocupou diferentes espaços no campo. Desperdiçou uma chance clara de gol — uma finalização que passou raspando a trave — mas a torcida nem se importou. O que importava era vê-lo de volta.</p>

      <p>A recuperação após a cirurgia no menisco do joelho esquerdo foi lenta, mas o próprio Neymar sempre reforçou que a meta é a Copa do Mundo de 2026. Cada minuto em campo é um passo nessa direção.</p>

      <h2>Santos precisa de mais</h2>
      <p>Apesar da goleada, o Santos vive uma temporada irregular. Em dez partidas disputadas em 2026, o Peixe soma apenas duas vitórias, quatro empates e quatro derrotas. A torcida deposita suas esperanças no retorno pleno de Neymar, mas o elenco precisa render mais como um todo. A derrota por 2 a 1 para o Athletico-PR pelo Brasileirão, dias antes, já havia ampliado a pressão.</p>

      <h2>Copa do Mundo no horizonte</h2>
      <p>Neymar renovou contrato com o Santos até o fim de 2026 com um objetivo claro: disputar a Copa do Mundo nos EUA, Canadá e México. Para isso, precisa convencer Carlo Ancelotti de que está em condições de ajudar a Seleção. A próxima convocação, marcada para 16 de março, será um momento decisivo.</p>
    `
  },
  {
    id: 'santos-crise-temporada-2026-numeros',
    title: 'Santos em Crise: Apenas 2 Vitórias em 10 Jogos e Pressão Crescente Sobre o Elenco',
    excerpt: 'Com quatro derrotas e quatro empates na temporada, o Santos deposita todas as fichas na volta de Neymar. Mas o elenco precisa reagir antes que a situação se agrave.',
    category: 'neymar',
    publishedAt: '2026-02-17T10:00:00.000Z',
    readingTime: 4,
    tags: ['Santos', 'Neymar', 'Crise', 'Brasileirão 2026'],
    body: `
      <p><strong>Os números não mentem: o Santos vive seu pior início de temporada em anos. Em dez partidas disputadas em 2026, o Peixe acumula apenas duas vitórias, quatro empates e quatro derrotas — sete gols marcados e onze sofridos.</strong></p>

      <h2>O peso da expectativa</h2>
      <p>A volta de Neymar gerou uma expectativa enorme na Vila Belmiro. O camisa 10 renovou contrato, mudou-se para uma mansão avaliada em R$ 35 milhões no Morro de Santa Terezinha, e a torcida sonha com títulos. Mas a realidade em campo é outra. O Santos não consegue encaixar um padrão de jogo consistente, e os resultados refletem isso.</p>

      <h2>Brasileirão e Paulistão</h2>
      <p>No Brasileirão, a derrota para o Athletico-PR aumentou a pressão. No Paulistão, o Santos se classificou para as quartas de final como oitavo colocado e enfrentará o líder Novorizontino — um adversário que promete dar trabalho. Se o Peixe não melhorar rapidamente, o risco de uma eliminação precoce no estadual é real.</p>

      <h2>Vojvoda pede paciência</h2>
      <p>O técnico Juan Pablo Vojvoda tem pedido paciência, argumentando que o time está em construção e que Neymar ainda precisa de tempo para atingir sua melhor forma. Mas no futebol brasileiro, paciência é artigo de luxo. O Santos precisa de resultados — e precisa rápido.</p>
    `
  },

  // ── COPA 2026 ──────────────────────────────────────────
  {
    id: 'ancelotti-18-convocados-copa-2026-definidos',
    title: 'Ancelotti Confirma: 18 dos 26 Convocados Para a Copa do Mundo Já Estão Definidos',
    excerpt: 'Em evento na CBF, Carlo Ancelotti revelou que o grupo da Seleção está quase fechado. Vini Jr., Estêvão, Raphinha e Marquinhos têm vaga garantida. Restam 8 posições em disputa.',
    category: 'copa',
    publishedAt: '2026-02-15T08:00:00.000Z',
    readingTime: 6,
    tags: ['Seleção Brasileira', 'Copa 2026', 'Ancelotti', 'Convocação'],
    body: `
      <p><strong>A contagem regressiva para a Copa do Mundo de 2026 acelerou. Em evento na sede da CBF no Rio de Janeiro, Carlo Ancelotti fez a declaração que todo torcedor brasileiro esperava: 18 dos 26 jogadores que vão representar o Brasil já estão definidos.</strong></p>

      <h2>Os praticamente garantidos</h2>
      <p>Segundo apuração junto à comissão técnica, o grupo de elite inclui: Alisson no gol, a zaga com Marquinhos e Gabriel Magalhães, o meio-campo com Casemiro e Bruno Guimarães, e o ataque com Vinicius Jr., Estêvão, Raphinha, Rodrygo, Matheus Cunha e Gabriel Martinelli.</p>
      <p>Além deles, os goleiros Bento e Hugo Souza, os zagueiros Alexsandro e Militão, o lateral Alex Sandro, o volante Andrey Santos e o meia Lucas Paquetá também têm vagas muito bem encaminhadas.</p>

      <h2>Posições em aberto</h2>
      <p>As oito vagas restantes estão concentradas nas laterais e no ataque. Na lateral-direita, Ancelotti aguarda a recuperação completa de Militão e observa Vanderson, do Monaco. No ataque, a camisa 9 segue em aberto: Gabriel Jesus, Endrick e João Pedro disputam a posição, com Luiz Henrique como alternativa pelas pontas.</p>

      <h2>E o Neymar?</h2>
      <p>Ninguém na CBF descarta Neymar. O próprio Ancelotti foi diplomático ao ser perguntado, dizendo que a porta está aberta para qualquer jogador que esteja em condições. Vojvoda, técnico do Santos, fez questão de reforçar publicamente que Ancelotti ficará satisfeito se Neymar estiver bem. A Copa do Mundo é em junho. Cada jogo do camisa 10 pelo Santos será uma audição ao vivo.</p>

      <h2>Grupo e calendário</h2>
      <p>O Brasil está no Grupo C, ao lado de Marrocos, Escócia e Haiti. A estreia será em 13 de junho. A Seleção ficará baseada em Morristown, Nova Jersey, usando o CT do Red Bull New York como base de treinos. A convocação final será anunciada em maio, depois dos amistosos de março contra França e Croácia.</p>
    `
  },
  {
    id: 'road-to-26-brasil-franca-croacia-amistosos',
    title: 'Road to 26: Brasil Enfrentará França e Croácia nos EUA em Março — Últimos Testes Antes do Mundial',
    excerpt: 'A CBF confirmou a "Road to 26 Series" com quatro seleções. Brasil joga contra a França em Boston (26/03) e contra a Croácia em Orlando (31/03) na última Data FIFA antes da Copa.',
    category: 'copa',
    publishedAt: '2026-02-16T14:00:00.000Z',
    readingTime: 5,
    tags: ['Seleção Brasileira', 'Copa 2026', 'Amistosos', 'França', 'Croácia'],
    body: `
      <p><strong>A preparação da Seleção Brasileira para a Copa do Mundo de 2026 ganhou um capítulo decisivo. A CBF confirmou a participação no "Road to 26 Series", um minitorneio que reunirá Brasil, Colômbia, França e Croácia em quatro amistosos de luxo nos Estados Unidos.</strong></p>

      <h2>Jogos confirmados</h2>
      <p>O Brasil enfrentará a França no dia 26 de março, em Boston, e a Croácia em 31 de março, em Orlando. Serão os últimos compromissos da Seleção na Data FIFA de março — a derradeira antes do Mundial, cuja convocação final acontece em maio.</p>

      <h2>Por que esses adversários importam</h2>
      <p>Enfrentar França e Croácia não é coincidência. São duas das seleções mais fortes do mundo, finalistas de Copas recentes, e representam exatamente o tipo de desafio que Ancelotti quer para testar seus jogadores. A intensidade física da Croácia no meio-campo e a velocidade do ataque francês vão forçar o treinador italiano a definir, na prática, quem merece estar na lista final.</p>

      <h2>Convocação de março</h2>
      <p>A convocação para esses amistosos está marcada para 16 de março. Será a primeira lista de Ancelotti em 2026 e pode já dar pistas claras sobre quem são os 26 escolhidos para o Mundial. As 8 vagas ainda em aberto — especialmente nas laterais e no ataque — tendem a se decidir com base nessas duas partidas.</p>

      <h2>O fator casa</h2>
      <p>Jogar nos EUA antes da Copa é estratégico. O Brasil vai se familiarizar com os gramados, o clima e a logística do país sede. Morristown, em Nova Jersey, já foi escolhida como base da Seleção durante o Mundial, e o CT do Red Bull New York será o campo de treinamentos. Março será o ensaio geral.</p>
    `
  },

  // ── MERCADO ──────────────────────────────────────────────
  {
    id: 'cruzeiro-gerson-30-milhoes-euros-maior-contratacao',
    title: 'Cruzeiro Faz a Maior Contratação da História do Futebol Brasileiro: Gerson por 30 Milhões de Euros',
    excerpt: 'Em valores corrigidos pela inflação, a compra de Gerson pelo Cruzeiro supera todos os recordes. O clube mineiro, potencializado pela SAF, investiu quase €30M para montar elenco competitivo.',
    category: 'mercado',
    publishedAt: '2026-02-14T12:00:00.000Z',
    readingTime: 5,
    tags: ['Cruzeiro', 'Gerson', 'Transferências', 'SAF', 'Mercado da Bola'],
    body: `
      <p><strong>O Cruzeiro não veio para brincar em 2026. A contratação de Gerson por quase 30 milhões de euros representa a maior aquisição da história do futebol brasileiro em valores corrigidos pela inflação, e sinaliza uma mudança de patamar para o clube mineiro.</strong></p>

      <h2>O poder da SAF</h2>
      <p>A operação só foi possível graças ao modelo de Sociedade Anônima do Futebol adotado pelo Cruzeiro. Com capacidade de investimento que clubes tradicionais não conseguem acompanhar, a SAF celeste foi agressiva na janela de transferências que se encerra em 3 de março, fechando também com o goleiro Matheus Cunha e os atacantes Néiser Villarreal e Chico da Costa.</p>

      <h2>O que Gerson agrega</h2>
      <p>Gerson é um dos meio-campistas mais completos do futebol sul-americano. Com passagens pela Seleção Brasileira e experiência na Europa, ele chega para ser o cérebro do time. No Cruzeiro, vai liderar a construção de jogo e dar ao elenco a qualidade técnica que faltava para disputar títulos de expressão.</p>

      <h2>Janela movimentada</h2>
      <p>A janela de 2026 — de 5 de janeiro a 3 de março — tem sido uma das mais movimentadas da história. O Corinthians trouxe Gabriel Paulista, Matheus Pereira e Kaio César. O Flamengo respondeu com Vitão, Andrew e Lucas Paquetá, que custou um investimento bilionário. O Vasco apostou em jovens sul-americanos, enquanto o Botafogo, limitado por transfer ban, se virou com criatividade.</p>

      <p>O Coritiba registrou a contratação mais cara de sua história com Breno Lopes (R$ 15 milhões), e até a Chapecoense impressionou com 13 reforços, incluindo o congolês Yannick Bolasie. O mercado brasileiro mudou de patamar — e as SAFs são o motor dessa transformação.</p>
    `
  },
  {
    id: 'paqueta-estreia-flamengo-supercopa-2026',
    title: 'Paquetá Estreia Pelo Flamengo na Supercopa, Mas Isola Chance Clara e Corinthians Leva o Título',
    excerpt: 'A maior contratação da história do futebol brasileiro entrou aos 13 do segundo tempo, mas desperdiçou finalização na pequena área. Corinthians venceu por 2 a 0 com 71 mil no Mané Garrincha.',
    category: 'mercado',
    publishedAt: '2026-02-02T08:00:00.000Z',
    readingTime: 5,
    tags: ['Paquetá', 'Flamengo', 'Corinthians', 'Supercopa 2026'],
    body: `
      <p><strong>Lucas Paquetá, a contratação mais cara da história do futebol brasileiro, fez sua estreia oficial com a camisa do Flamengo na Supercopa do Brasil 2026. Mas o roteiro não saiu como o Rubro-Negro esperava.</strong></p>

      <h2>A noite do Corinthians</h2>
      <p>Diante de 71.244 torcedores no Mané Garrincha em Brasília — recorde do estádio —, o Corinthians dominou o Flamengo e venceu por 2 a 0, conquistando o título da Supercopa Rei. Gabriel Paulista abriu o placar no primeiro tempo, e Yuri Alberto fechou a conta nos acréscimos.</p>

      <h2>Carrascal expulso, Paquetá entra</h2>
      <p>O jogo ganhou contornos dramáticos quando Carrascal, do Flamengo, recebeu cartão vermelho antes do início do segundo tempo por uma cotovelada em Breno Bidon nos acréscimos da primeira etapa. Com um a menos, o técnico rubro-negro colocou Paquetá aos 13 minutos do segundo tempo para tentar uma reação.</p>

      <h2>A chance desperdiçada</h2>
      <p>Nos acréscimos, Paquetá teve a chance mais clara do Flamengo para descontar. Recebeu a bola na pequena área, com o gol quase aberto, mas isolou a finalização. O Mané Garrincha, que tinha show de João Gomes antes da partida, acabou assistindo à festa corintiana.</p>

      <p>Apesar da estreia frustrante, Paquetá terá tempo para se adaptar. O Flamengo segue como um dos favoritos ao Brasileirão 2026, e o meia que voltou da Europa será peça central no esquema do time ao longo da temporada.</p>
    `
  },

  // ── REGIONAIS ──────────────────────────────────────────
  {
    id: 'paulistao-2026-quartas-final-confrontos',
    title: 'Paulistão 2026: Quartas de Final Definidas — Novorizontino x Santos, Palmeiras x Capivariano e Clássicos à Vista',
    excerpt: 'Os oito classificados do Campeonato Paulista estão definidos. Jogos em turno único no dia 22 de fevereiro. Velo Clube e Ponte Preta foram rebaixados para a Série A2.',
    category: 'regionais',
    regional: 'paulistao',
    publishedAt: '2026-02-17T14:00:00.000Z',
    readingTime: 5,
    tags: ['Paulistão 2026', 'Quartas de Final', 'Palmeiras', 'Santos', 'Corinthians'],
    body: `
      <p><strong>A fase de grupos do Campeonato Paulista 2026 chegou ao fim e os confrontos das quartas de final estão definidos. Serão jogos únicos, no dia 22 de fevereiro, com mando de campo para os quatro melhores classificados.</strong></p>

      <h2>Os confrontos</h2>
      <p>Novorizontino (1º) x Santos (8º) — o líder da fase de grupos recebe um Santos irregular que aposta tudo em Neymar. Palmeiras (2º) x Capivariano (7º) — a surpresa do campeonato desafia o Verdão, que perdeu para o Botafogo-SP e venceu o Derby Paulista. Red Bull Bragantino (3º) x São Paulo (6º) — duelo equilibrado entre dois times que oscilaram no estadual. Portuguesa (4º) x Corinthians (5º) — a Lusa vem fazendo grande campanha e terá a vantagem do mando contra o Timão campeão da Supercopa.</p>

      <h2>Derby Paulista definiu posições</h2>
      <p>O clássico entre Corinthians e Palmeiras, na 7ª rodada, teve impacto direto na classificação. O Palmeiras venceu por 1 a 0 com gol de Flaco López nos minutos finais, depois que Memphis Depay escorregou na cobrança de pênalti e mandou a bola para fora. A vitória garantiu o segundo lugar ao Verdão e empurrou o Corinthians para o quinto.</p>

      <h2>Rebaixados</h2>
      <p>Velo Clube e Ponte Preta foram os dois rebaixados para a Série A2 em 2027. A Ponte, clube tradicional de Campinas, vive mais um momento delicado em sua história.</p>

      <h2>Regra das quartas</h2>
      <p>Em caso de empate no tempo normal, não há prorrogação — a vaga é decidida diretamente nos pênaltis. Os quatro vencedores avançam para as semifinais, onde os cruzamentos seguem o chaveamento fixo do campeonato.</p>
    `
  },
  {
    id: 'carioca-2026-semifinais-fla-flu-vasco-madureira',
    title: 'Carioca 2026: Semifinais Terão Vasco x Fluminense e Flamengo x Madureira',
    excerpt: 'Após quartas emocionantes com Flamengo eliminando Botafogo e Vasco passando nos pênaltis, os confrontos das semifinais do Campeonato Carioca estão definidos.',
    category: 'regionais',
    regional: 'carioca',
    publishedAt: '2026-02-17T16:00:00.000Z',
    readingTime: 5,
    tags: ['Carioca 2026', 'Semifinais', 'Flamengo', 'Fluminense', 'Vasco'],
    body: `
      <p><strong>O Campeonato Carioca 2026 chega à fase semifinal com confrontos que prometem agitar o Rio de Janeiro. De um lado, Vasco x Fluminense. Do outro, Flamengo x Madureira.</strong></p>

      <h2>Como foram as quartas</h2>
      <p>O Madureira foi o primeiro a garantir vaga, eliminando o Boavista com autoridade. O Vasco sofreu mais: empatou com o Volta Redonda no tempo normal e precisou das cobranças de pênalti para avançar. O Flamengo despachou o Botafogo por 2 a 1 em jogo tenso, enquanto o Fluminense goleou o Bangu por 3 a 1 no Maracanã, com Savarino abrindo o placar, Canobbio ampliando e Ganso convertendo de pênalti.</p>

      <h2>Formato da semifinal</h2>
      <p>Os duelos serão em ida e volta. Fluminense e Madureira, por terem feito melhor campanha, decidem em casa no jogo de volta. A expectativa é que os jogos de ida aconteçam nos dias 21 e 22 de fevereiro, com a volta em 28 de fevereiro e 1º de março. Em caso de igualdade no placar agregado, não há vantagem do empate — a decisão vai direto para os pênaltis.</p>

      <h2>O fator Madureira</h2>
      <p>A grande surpresa do campeonato é o Madureira, que garantiu mando no jogo de volta contra o Flamengo. O Tricolor Suburbano vem fazendo campanha consistente e não tem nada a perder contra o favorito. Se a história do futebol carioca ensina algo, é que surpresas nos estaduais são mais comuns do que os grandes imaginam.</p>
    `
  },

  // ── OPINIÃO ──────────────────────────────────────────────
  {
    id: 'derby-paulista-memphis-penalti-analise',
    title: 'OPINIÃO: Memphis Escorregou, Mas Quem Caiu Foi o Corinthians — Análise do Derby Paulista',
    excerpt: 'O pênalti perdido por Memphis Depay simboliza o momento do Timão. Com investimento pesado e elenco estrelado, o Corinthians precisa transformar potencial em resultado dentro de campo.',
    category: 'opiniao',
    publishedAt: '2026-02-09T10:00:00.000Z',
    readingTime: 5,
    tags: ['Corinthians', 'Palmeiras', 'Paulistão 2026', 'Derby', 'Opinião'],
    body: `
      <p><strong>O pênalti perdido por Memphis Depay no Derby Paulista da 7ª rodada do Paulistão não foi apenas uma cobrança desperdiçada. Foi a síntese perfeita do momento do Corinthians em 2026: muito potencial, pouco resultado concreto.</strong></p>

      <h2>O lance</h2>
      <p>Raphael Claus marcou pênalti de Carlos Miguel em Gustavo Henrique. Memphis, o astro holandês que chegou para ser o diferencial, se posicionou para a cobrança. Escorregou. A bola foi para fora. A Neo Química Arena, lotada, silenciou. Minutos depois, Flaco López finalizou de oportunismo para o Palmeiras. 1 a 0. Jogo resolvido.</p>

      <h2>A questão de fundo</h2>
      <p>O Corinthians investiu pesado: Gabriel Paulista, Matheus Pereira, Kaio César. Venceu a Supercopa com atuação brilhante contra o Flamengo. Mas no estadual, os resultados não acompanham o tamanho do elenco. A quinta posição na fase de grupos obriga o Timão a encarar a Portuguesa fora de casa nas quartas — adversário que não vai facilitar.</p>

      <h2>Palmeiras, a máquina</h2>
      <p>Do outro lado, Abel Ferreira segue construindo. O Palmeiras não depende de um único craque — depende de um sistema. Flaco López marcou o gol da vitória não por genialidade individual, mas por estar no lugar certo, na hora certa, dentro de um esquema que funciona. Essa é a diferença entre os dois rivais neste momento.</p>

      <p>O Corinthians tem peças para brigar por títulos. Mas peças não ganham jogos — times ganham. E essa é a lição que o Derby de 8 de fevereiro deixou na Neo Química Arena.</p>
    `
  },

  // ── TÁTICAS ──────────────────────────────────────────────
  {
    id: 'abel-ferreira-reclamacao-arbitragem-palmeiras-inter',
    title: 'TÁTICA: Abel Ferreira Explode Após Palmeiras 3 x 1 Inter — "Não Marcam Pênalti a Nosso Favor"',
    excerpt: 'Apesar da vitória convincente no Beira-Rio, o técnico português disparou contra a arbitragem brasileira. Análise tática mostra como o Palmeiras dominou o Internacional.',
    category: 'taticas',
    publishedAt: '2026-02-13T12:00:00.000Z',
    readingTime: 5,
    tags: ['Palmeiras', 'Abel Ferreira', 'Internacional', 'Brasileirão 2026', 'Tática'],
    body: `
      <p><strong>O Palmeiras venceu o Internacional por 3 a 1 no Beira-Rio pela terceira rodada do Brasileirão 2026. Deveria ser motivo de celebração. Mas Abel Ferreira escolheu o pós-jogo para externar uma insatisfação que vem acumulando: a relação do Verdão com a arbitragem brasileira.</strong></p>

      <h2>A coletiva</h2>
      <p>Visivelmente irritado, o técnico português questionou os critérios dos árbitros em relação a pênaltis não marcados a favor do Palmeiras. Sem citar nomes ou lances específicos, disse que a equipe precisa fazer "muito mais do que os outros" para vencer. A declaração gerou repercussão imediata e esquentou o debate sobre a arbitragem no início do Brasileirão.</p>

      <h2>Análise tática do jogo</h2>
      <p>Em campo, o Palmeiras fez uma exibição ofensiva de alto nível. A pressão alta funcionou desde o primeiro minuto, sufocando a saída de bola do Internacional. O sistema de Abel — com laterais que se projetam e meias que ocupam o espaço entre linhas — desorganizou a defesa colorada.</p>
      <p>Os três gols vieram de jogadas coletivas bem trabalhadas, não de lampejos individuais. É o que diferencia o Palmeiras de Abel: a previsibilidade ofensiva é, paradoxalmente, a maior arma do time. O adversário sabe o que vem, mas não consegue parar.</p>

      <h2>O contexto maior</h2>
      <p>A reclamação de Abel não é isolada. Vários treinadores têm questionado a arbitragem nas primeiras rodadas do Brasileirão 2026. Com o novo formato do campeonato e o VAR sob constante escrutínio, a pressão sobre a CBF para profissionalizar de vez o corpo de árbitros só aumenta. O Palmeiras venceu no campo — mas Abel quer vencer também fora dele.</p>
    `
  },
  {
    id: 'supercopa-2026-corinthians-campea-analise-tatica',
    title: 'TÁTICA: Como o Corinthians Neutralizou o Flamengo e Conquistou a Supercopa do Brasil 2026',
    excerpt: 'Diante de 71 mil no Mané Garrincha, o Timão executou um plano tático perfeito: bloqueou os corredores do Flamengo, explorou as costas de Carrascal e venceu por 2 a 0.',
    category: 'taticas',
    publishedAt: '2026-02-02T14:00:00.000Z',
    readingTime: 6,
    tags: ['Corinthians', 'Flamengo', 'Supercopa 2026', 'Tática'],
    body: `
      <p><strong>O Corinthians é o campeão da Supercopa do Brasil 2026. A vitória por 2 a 0 sobre o Flamengo no Mané Garrincha, diante de 71.244 torcedores, não foi acidente — foi a execução precisa de um plano tático que desmontou o favorito.</strong></p>

      <h2>Primeiro tempo: disciplina e oportunismo</h2>
      <p>O Corinthians adotou uma postura compacta, com linhas baixas e transições rápidas. O objetivo era claro: bloquear os corredores laterais do Flamengo, onde o Rubro-Negro costuma gerar perigo. Funcionou. Gabriel Paulista, em sua primeira partida oficial, comandou a defesa com segurança e ainda marcou o gol de abertura — cabeceando um escanteio com precisão cirúrgica.</p>

      <h2>A expulsão que mudou tudo</h2>
      <p>Nos acréscimos do primeiro tempo, Carrascal desferiu uma cotovelada em Breno Bidon. Vermelho direto. O Flamengo ficou com dez jogadores e o equilíbrio tático se desfez. A entrada de Paquetá no segundo tempo tentou reorganizar o time, mas o Corinthians já tinha o controle da partida.</p>

      <h2>Segundo tempo: administração e sentença</h2>
      <p>Com um jogador a mais, o Corinthians não se precipitou. Manteve a posse, circulou a bola e esperou o momento certo. Nos acréscimos, Yuri Alberto finalizou com categoria para selar o 2 a 0 e decretar o bicampeonato da Supercopa.</p>

      <h2>O que isso significa</h2>
      <p>O título mostra que o Corinthians de 2026 tem identidade tática. Gabriel Paulista trouxe liderança defensiva, Hugo Souza segue decisivo no gol, e o time sabe sofrer quando precisa. O desafio agora é levar essa consistência para o Paulistão e o Brasileirão, onde os resultados ainda oscilam.</p>
    `
  },
];

// ============================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================

function generateSlug(id) {
  return id;
}

function generateArticleHTML(article) {
  const categoryLabel = {
    brasileirao: 'BRASILEIRÃO',
    neymar: 'NEYMAR',
    copa: 'COPA 2026',
    mercado: 'MERCADO',
    regionais: 'REGIONAIS',
    opiniao: 'OPINIÃO',
    taticas: 'TÁTICAS'
  }[article.category] || article.category.toUpperCase();

  const categoryLink = {
    brasileirao: 'Série-a',
    neymar: 'Neymar',
    copa: 'Copa-2026',
    mercado: 'Mercado',
    regionais: 'Regionais',
    opiniao: 'Opinião',
    taticas: 'Táticas'
  }[article.category] || article.category;

  const date = new Date(article.publishedAt);
  const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const tagsHTML = article.tags.map(t => `<span class="tag">${t}</span>`).join('\n                ');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Bola na Rede</title>
    <meta name="description" content="${article.excerpt}">
    <meta name="author" content="Bola na Rede">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    <meta property="og:image" content="${SITE_URL}/images/articles/${article.id}.svg">
    <meta property="og:type" content="article">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${article.title}",
        "description": "${article.excerpt}",
        "image": "${SITE_URL}/images/articles/${article.id}.svg",
        "datePublished": "${article.publishedAt}",
        "dateModified": "${article.publishedAt}",
        "author": {
            "@type": "Organization",
            "name": "Bola na Rede"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Bola na Rede",
            "logo": {
                "@type": "ImageObject",
                "url": "${SITE_URL}/images/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${SITE_URL}/articles/pt-BR/${article.category}/${article.id}.html"
        }
    }
    </script>

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.excerpt}">
    <meta name="twitter:image" content="${SITE_URL}/images/articles/${article.id}.svg">
    <link rel="canonical" href="${SITE_URL}/articles/pt-BR/${article.category}/${article.id}.html">
    <meta name="keywords" content="${article.tags.join(', ')}">
</head>
<body>
    <header class="article-header">
        <nav>
            <a href="/" class="logo">⚽ BOLA NA REDE</a>
        </nav>
    </header>

    <main class="article-container" style="display: grid; grid-template-columns: 1fr 300px; gap: 40px; max-width: 1400px; margin: 40px auto; padding: 0 20px;">
        <article class="article-content">
            <nav class="breadcrumb">
                <a href="/">Inicio</a> &raquo;
                <a href="/#${categoryLink}">${categoryLabel}</a> &raquo;
                <span>${article.title.substring(0, 60)}...</span>
            </nav>

            <div class="article-category">${categoryLabel}</div>

            <h1 class="article-title">${article.title}</h1>

            <p class="article-subtitle">${article.excerpt}</p>

            <div class="article-meta">
                <span class="author">Por <strong>Bola na Rede</strong></span>
                <span class="date">${dateStr}</span>
                <span class="reading-time">⏱️ ${article.readingTime} min de leitura</span>
            </div>

            <figure class="article-image">
                <img src="/images/articles/${article.id}.svg" alt="${article.title}" onerror="this.src='/images/placeholder.jpg'">
                <figcaption>${article.title} (Foto: Bola na Rede)</figcaption>
            </figure>

            <div class="article-body">
                ${article.body.trim()}
            </div>

            <div class="article-tags">
                ${tagsHTML}
            </div>

            <div class="article-share">
                <p><strong>Compartilhe esta notícia:</strong></p>
                <div class="share-buttons">
                    <a href="#" class="share-btn twitter">🐦 Twitter</a>
                    <a href="#" class="share-btn whatsapp">💬 WhatsApp</a>
                    <a href="#" class="share-btn facebook">📘 Facebook</a>
                </div>
            </div>
        </article>

        <aside class="article-sidebar">
            <div class="widget">
                <h3>📰 Mais Notícias</h3>
                <ul class="related-articles">
                    <li><a href="/">Voltar para a página inicial</a></li>
                </ul>
            </div>
            <div class="widget newsletter">
                <h3>📧 Newsletter</h3>
                <p>Receba as melhores notícias de futebol no seu email.</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Seu email" required>
                    <button type="submit">⚽ Assinar</button>
                </form>
            </div>
        </aside>
    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; 2026 Bola na Rede. Futebol sem filtro desde 2026.</p>
                <p><a href="/">Voltar ao início</a> | <a href="/privacy.html">Privacidade</a> | <a href="/terms.html">Termos</a></p>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

function generateSVG(article) {
  const colors = {
    brasileirao: { bg: '#1a472a', accent: '#2ecc71', icon: '⚽' },
    neymar: { bg: '#1a1a2e', accent: '#f1c40f', icon: '👑' },
    copa: { bg: '#0c2340', accent: '#009c3b', icon: '🏆' },
    mercado: { bg: '#2c1810', accent: '#e67e22', icon: '💰' },
    regionais: { bg: '#1a1a3e', accent: '#9b59b6', icon: '🏟️' },
    opiniao: { bg: '#2d1b1b', accent: '#e74c3c', icon: '🎙️' },
    taticas: { bg: '#1b2d1b', accent: '#3498db', icon: '📊' }
  }[article.category] || { bg: '#1a1a1a', accent: '#ffffff', icon: '⚽' };

  const titleLines = [];
  const words = article.title.split(' ');
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length > 35) {
      titleLines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ' ' + word;
    }
  }
  if (currentLine.trim()) titleLines.push(currentLine.trim());

  const titleSVG = titleLines.map((line, i) =>
    `<text x="40" y="${160 + i * 36}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
  ).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="6" fill="${colors.accent}"/>
  <text x="40" y="80" font-family="Arial, sans-serif" font-size="64">${colors.icon}</text>
  <rect x="100" y="55" width="200" height="36" rx="18" fill="${colors.accent}" opacity="0.9"/>
  <text x="200" y="80" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${article.category.toUpperCase()}</text>
  ${titleSVG}
  <line x1="40" y1="440" x2="760" y2="440" stroke="${colors.accent}" stroke-width="2" opacity="0.5"/>
  <text x="40" y="470" font-family="Arial, sans-serif" font-size="16" fill="${colors.accent}" font-weight="bold">⚽ BOLA NA REDE</text>
  <text x="760" y="470" font-family="Arial, sans-serif" font-size="14" fill="#888" text-anchor="end">${new Date(article.publishedAt).toLocaleDateString('pt-BR')}</text>
</svg>`;
}

// ============================================================
// EXECUÇÃO
// ============================================================

console.log('🧹 Limpando artigos antigos...');

// Limpar diretórios de artigos
const categories = ['brasileirao', 'neymar', 'copa', 'mercado', 'regionais', 'opiniao', 'taticas', 'champions', 'selecao', 'internacional', 'libertadores'];
categories.forEach(cat => {
  const dir = path.join(ARTICLES_DIR, cat);
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => fs.unlinkSync(path.join(dir, f)));
    console.log(`  ✓ Limpo: ${cat}/`);
  }
});

// Limpar imagens antigas
if (fs.existsSync(IMAGES_DIR)) {
  fs.readdirSync(IMAGES_DIR).forEach(f => {
    if (f.endsWith('.svg')) fs.unlinkSync(path.join(IMAGES_DIR, f));
  });
  console.log('  ✓ Imagens antigas removidas');
}

console.log('\n📝 Gerando novos artigos...');

const indexEntries = [];

articles.forEach(article => {
  // Criar diretório da categoria se não existir
  const catDir = path.join(ARTICLES_DIR, article.category);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

  // Gerar HTML
  const html = generateArticleHTML(article);
  const htmlPath = path.join(catDir, `${article.id}.html`);
  fs.writeFileSync(htmlPath, html, 'utf-8');

  // Gerar SVG
  const svg = generateSVG(article);
  const svgPath = path.join(IMAGES_DIR, `${article.id}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf-8');

  // Entrada no índice
  const entry = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    language: 'pt-BR',
    url: `/artigo/${article.id}.html`,
    image: `/images/articles/${article.id}.svg`,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime
  };
  if (article.regional) entry.regional = article.regional;
  indexEntries.push(entry);

  console.log(`  ✓ [${article.category}] ${article.title.substring(0, 70)}...`);
});

// Ordenar por data (mais recente primeiro)
indexEntries.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

// Salvar índice
const indexPath = path.join(DATA_DIR, 'articles-index.json');
fs.writeFileSync(indexPath, JSON.stringify(indexEntries, null, 2), 'utf-8');
console.log(`\n✅ ${indexEntries.length} artigos publicados com sucesso!`);
console.log(`📄 Índice atualizado: ${indexPath}`);

// Atualizar published-titles.json
const titlesPath = path.join(DATA_DIR, 'published-titles.json');
const titles = articles.map(a => a.title);
fs.writeFileSync(titlesPath, JSON.stringify(titles, null, 2), 'utf-8');
console.log(`📋 Títulos atualizados: ${titlesPath}`);
