# ShadowBorn RPG V19 — Minimal Escuro

Atualização visual e funcional construída sobre a V18 completa. O tema acompanha as prévias aprovadas: castelo em chamas, superfícies escuras, destaques laranja, navegação lateral, cards de catálogo e painéis de detalhes. Os componentes são HTML/CSS/JavaScript: a arte de fundo não substitui botões e campos.

Leia `ATUALIZAR_V19.txt` para publicar e atualizar a implantação do Google Apps Script.

## Sistemas preservados

Contas e progresso original, campanha dos 10 bosses, exploração e editor de mapas, NPCs/bosses por imagem ou pixel art, IA/ultimates, itens e drops, catálogo de personagens/cortes/ultimates/equipamentos, cores RGB e três cores, eventos, raids globais, captura e upgrade de Guardiões, roleta horizontal animada e patentes.

## Novo painel Admin

Visão geral com dados atuais do catálogo e do servidor, atalhos para editores existentes e gerenciamento de jogador. `APLICAR SALDOS` define os saldos totais de moedas e diamantes, não soma os valores. `CONCEDER` envia o item/equipamento ou Guardião selecionado à conta do jogador. Quantidade serve para itens empilháveis; equipamentos e Guardiões continuam únicos conforme as regras da V18.

O endpoint `ajustarSaldosV19` exige sessão válida, autorização de administrador e inteiros entre 0 e 10.000.000; usa o bloqueio de escrita existente. O novo código do Apps Script precisa ser implantado para essa ação funcionar. Nenhuma migração para Supabase e nenhum servidor multiplayer são necessários.

## Recursos visuais

`assets/ui-v19/background.webp` é a nova arte temática. `assets/ui-v19/*.svg` são ícones vetoriais de interface e cortes. Os novos itens têm sprites com transparência, integrados também nos caminhos existentes de `assets/icons`, preservando IDs e configurações de catálogo. As fontes WOFF estão incluídas.

Os personagens jogáveis continuam usando suas spritesheets reais. Os bosses/Guardiões e mapas vêm das imagens cadastradas. Valores e conteúdo seguem o catálogo: as ilustrações de prévia não criaram preços, personagens ou raids fictícios no banco.

## Layout e acessibilidade

O palco de menus usa composição 1440 × 810 e escala para caber na janela. Listas maiores podem ser roladas dentro da área de conteúdo. Mantenha o celular na horizontal para melhor leitura. Há estados de foco, nomes de botões e mensagens de status; os ícones não dependem de emojis. A aparência da fonte pode variar ligeiramente entre renderizadores.

## Verificação

Testes em Chromium com respostas simuladas: abertura de todos os menus, busca/filtro de loja, compra e equipar, roleta com giro e centralização do prêmio, raids/início de combate, ranking por nível/diamantes, busca/paginação, Guardiões/Eventos, Admin/abas/saldos/concessões e viewport 800 × 450. Sem exceções JavaScript nem imagens/fontes faltando nos fluxos exercitados. Sintaxe de todos os JavaScripts e Code.gs, IDs HTML e validação de autorização/saldos também conferidos.

As imagens em `PREVIAS-V19/` são capturas da interface funcionando com dados simulados. Os dados de demonstração e as credenciais de teste não estão no jogo entregue.

Não houve publicação real, acesso à sua planilha nem teste em aparelho Android físico. A atualização web aparece no APK existente somente depois de publicar na URL que ele abre e atualizar o conteúdo/cache. Este pacote não inclui um APK recompilado.
