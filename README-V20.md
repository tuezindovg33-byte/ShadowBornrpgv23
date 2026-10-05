# ShadowBorn RPG V20

Atualização completa do jogo solo. Leia primeiro `ATUALIZAR_V20.txt`.

A V20 usa a imagem da própria fase no carregamento. Para fases com gradiente,
usa as cores da fase. O nome é obtido do mapa selecionado, sem texto fixo.
A barra acompanha as etapas existentes de carregamento e confirmação da entrada;
a preparação do equipamento e da raid continuam sendo verificadas antes do combate.

A patente no início fica somente no perfil superior. As 100 imagens de emblema
foram normalizadas com margem e centro consistentes, mantendo os nomes e níveis.

A HUD pode usar analógico ou setas. O editor permite arrastar cada botão,
redimensionar, ajustar transparência, salvar, cancelar e restaurar. Guarda o layout
em armazenamento local do aparelho (`shadowborn_mobile_hud_v20`), sem alterar contas
ou planilha. O analógico controla o movimento horizontal do jogo; pulo é separado.
Toques de movimento e ação podem acontecer simultaneamente. Ao cancelar um toque,
perder foco ou sair da partida, os comandos são liberados para evitar movimento preso.

Editor: Configurações > Personalizar controles; ou Pausar > Personalizar HUD.
Prévia das telas em `PREVIAS-V20/`. Capturas com dados de teste.

Arquivos novos: `ui-v20.css`, `js/ui-v20.js` e `assets/ui-v20/`.
Integrações: `index.html`, `js/game.js`, `js/controls.js`, `js/ui-v19.js`.
Código do servidor preservado da V19. Nenhum Supabase ou multiplayer incluído.

Validação local: sintaxe de todos os scripts, HTML sem IDs duplicados, assets,
fluxos principais, posição dos controles, modo de movimento, edição e persistência.
API simulada; publicação e Android físico não verificados nesta entrega.
