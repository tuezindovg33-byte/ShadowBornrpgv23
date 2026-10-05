# ShadowBorn RPG V22

Leia primeiro `ATUALIZAR_V22.txt`. O pacote inclui o jogo completo solo,
o sistema de trade entre contas e o painel de personagem no tema dourado.

O trade usa o backend existente do Google Apps Script. Não usa Supabase
nem adiciona partidas multiplayer. Toda mutação exige sessão autenticada;
o servidor define a identidade do solicitante. A lista mostra somente ID,
nome, nível, personagem e presença, sem e-mails ou dados privados de contas.

As propostas e ofertas ficam na aba `Trades`, com participantes, revisão,
confirmações, prazos e histórico. Apenas o destinatário aceita a proposta;
apenas os participantes podem ler, editar, cancelar ou confirmar seu trade.
Uma conta pode participar de uma troca ativa por vez. As ofertas são validadas
contra o saldo e a posse atuais no servidor, com até seis itens por lado.
Equipamentos iniciais e itens equipados ficam bloqueados. Equipamentos e
sombras únicos não são duplicados no destinatário. Sombras conservam o nível.

Salvar uma oferta aumenta sua revisão e limpa ambas as confirmações. Uma
oferta confirmada fica bloqueada na interface; Editar oferta primeiro desfaz
as confirmações no servidor. Na segunda confirmação, o servidor revalida
as duas ofertas e grava os dois perfis e o registro concluído em uma única
chamada do serviço avançado Google Sheets, sob o bloqueio do Apps Script.
Não existe caminho alternativo de conclusão com duas gravações separadas.
Se a resposta de rede se perder, repetir a confirmação de uma troca concluída
só devolve o perfil atual: não transfere novamente.

Cada perfil recebe um epoch após concluir a troca. Saves anteriores a essa
mudança são recusados e recebem o perfil atualizado, evitando que uma aba
antiga restaure os saldos ou itens anteriores. O campo de epoch não é aceito
como parte do perfil arbitrariamente enviado pelo navegador.

Presença: heartbeat de 8s nos menus e até 40s no combate, com estado verde
por 90s após atividade recente. A atualização para quando a página fica
oculta. Google Apps Script usa polling; a presença não é instantânea.
A lista/histórico da interface é limitada aos 30 registros recentes da conta;
a planilha mantém os registros. É adequada para o backend atual, sem pretensão
de ser um servidor de grande escala ou um sistema completo de anticheat.

A tela Personagem mantém as funções existentes de XP e atributos, com cartões,
barra e botões dourados. Foram preservadas as melhorias de carregamento por
mapa, HUD móvel ajustável e cache visual de guardiões das versões anteriores.

## Arquivos

- `Code.gs`: servidor completo, incluindo ações tradePulse/Create/Accept/Cancel/Offer/Confirm.
- `js/trade-v22.js` e `ui-v22.css`: interface, presença, propostas e ofertas.
- Integrações em `index.html`, `js/ui-v19.js`, `js/game.js` e `js/account.js`.
- `PREVIAS-V22`: capturas com dados de teste.

## Ativação

Atualize Code.gs, adicione Google Sheets API v4 em Serviços, execute
`configurarTradeV22` e publique uma nova versão da implantação atual.
Publique os arquivos do site e atualize o cache do navegador/aplicativo.
O ZIP não publica o site nem altera sua planilha automaticamente.

## Validação

Testes locais de autenticação, isolamento dos participantes, revisão,
quantidades, saldos, posse, replay, falha atômica, cancelamento, prazo e epoch.
Dois contextos de navegador validaram envio/aceite, edição, transferência,
persistência, indicador online e composição mobile. Os demais fluxos de
loja/roleta/raid/Admin/HUD e o guardião também foram verificados.
Os testes usam Apps Script/planilha simulados, sem contas ou transferências
reais. Ainda precisa validar a nova implantação no seu servidor e em Android.

## Administração de nível e manutenção
O resumo do Admin exibe o nível de cada conta e permite definir 1 a 100.000,
zerando somente o XP e preservando atributos/pontos/itens. A versão do perfil
é incrementada para impedir que abas antigas restaurem o nível anterior.

A manutenção global usa Script Properties; doPost bloqueia ações públicas
e autenticadas dos jogadores, inclusive cadastro e login, enquanto valida
permissão Admin no servidor. O endpoint público siteStatusV22 informa apenas
estado/mensagem e a autorização da própria sessão. A interface consulta a
cada 8 segundos e retorna ao login. Mensagens são renderizadas como texto.
Trocas ativas são canceladas ao ativar manutenção. A liberação exige login
novamente. Chamadas já em execução e estado local ainda não sincronizado
não são recuperados ao encerrar uma partida.

Testes adicionais: validação de níveis/permissões, preservação do inventário,
proteção contra saves antigos, bloqueio de jogadores/cadastro/login,
acesso Admin durante manutenção e liberação. Navegador com duas sessões
simuladas confirmou controles Admin, redirecionamento e mensagem.
