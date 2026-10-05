# ShadowBorn RPG V21

Leia `ATUALIZAR_V21.txt` para publicar. Projeto completo, solo.

Correção do perfil: personagem equipado volta à imagem principal. A patente
fica em seu próprio espaço ao lado, com altura alinhada ao retrato.
O card de eventos do início fica alinhado ao destaque do boss, sem sobrepor
os atalhos. O banner usado na partida mantém o comportamento anterior.

O guardião usa uma imagem preparada em um canvas pequeno e reaproveitado.
Antes, o desenho de cada quadro filtrava e aplicava brilho à imagem original,
que pode ser grande. Agora o filtro acontece no carregamento, sem leitura de
pixels nem exportação da imagem. A imagem é estática durante a sala; a direção
continua acompanhando o alvo. O cache tem somente uma entrada.

Também foram retirados do loop por quadro a geração do SVG da sombra, a busca
de seu cadastro e configuração e as duas listas de seleção de inimigos.
A seleção de alvo é revista a cada 120 ms e invalidada se ele morrer ou sair
 do alcance do jogador. A HUD do guardião é atualizada a cada 200 ms ou ao
morrer; textos iguais não provocam reescritas no DOM. Movimento e verificações
de alcance dos golpes continuam no loop do jogo. Custos e chances do servidor
não mudaram.

Testes em Chromium: navegação, economia com API simulada, roleta, raids, Admin,
HUD e toques simultâneos, além de ataque normal/ultimate, dano, morte e retorno
do guardião. Em 81 chamadas do desenho do guardião, nenhum filtro foi aplicado
no canvas principal. Nenhuma promessa de FPS para Android físico: essa medição
precisa ser feita no aparelho. Prévia com dados de teste em `PREVIAS-V21/`.
