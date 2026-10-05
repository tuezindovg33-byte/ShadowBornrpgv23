# ShadowBorn RPG V23

Leia **ATUALIZAR_V23.txt** antes de publicar. Pacote completo do jogo solo,
com comunidade entre contas, guildas, inventário funcional e início obrigatório
por conta. Preserva o Trade/Admin/manutenção V22 e as otimizações anteriores.

## Implementação

- `Code.gs`: cinco ações V23 autenticadas; identidade obtida da sessão.
- `js/community-v23.js`: chat, guildas, perfil, tutorial e uso de itens.
- `ui-v23.css`: tema escuro/dourado e alinhamento inferior.
- `js/home-v15.js`: novo campo de banner no painel de destaque existente.
- `js/features-v8.js` e `js/items-v10.js`: funções, edição e descrição dos itens.
- Combate integra bônus de guilda/kit, buffs temporários e energia da Ultimate.

Criação da guilda debita o pagamento e grava a guilda na mesma operação
Google Sheets API. Consumo de itens grava inventário/recompensa/perfil numa
operação, com recibos para repetição do pedido. A versão do perfil impede que
um save antigo restaure itens já consumidos ou saldos alterados.

Guildas possuem permissões verificadas no servidor; XP vem dos alvos dos
encontros registrados, com identificação da derrota para impedir repetição
por alvo. O estado de guilda fica na aba Guildas, separado do progresso local.
Fotos e logos aceitam HTTPS; mensagens/nomes são escapados nas interfaces.
Perfil, buffs e kit V23 são preservados pelo servidor ao salvar progresso.

Mensagens e presença são atualizadas por consultas periódicas. O chat retorna
até 80 mensagens; a planilha conserva no máximo 1.000. Presença significa
atividade recente (90 s). Guests simulados são identificados e contam
separadamente. Conversas/recompensas desses personagens não modificam
inventários ou saldos reais.

O cliente ainda executa o combate e parte da progressão do jogo existente.
Esta atualização não adiciona simulação de combate no servidor nem combate
multiplayer. Apps Script tem quotas e latência; não houve teste de carga de
centenas de jogadores reais simultâneos.

## Verificação

Testes locais com servidor simulado e duas sessões de navegador isoladas:
login obrigatório, tutorial persistido, contador real, chat/HTML escapado,
perfil e banner, custo de guilda em ambas as moedas, pedidos/permissões/cargos,
transferência de liderança, XP por alvo, bônus, chave/baú, replay de pedidos,
kit equipado bloqueado no Trade, HP/mana, preservação de V23 em saves antigos.

Regressão de Trade, Admin/manutenção/níveis, loja/roleta, raids, ranking,
carregamento, controles mobile, HUD e Guardião. Não substitui teste após
publicação com a planilha real e um aparelho Android físico.
