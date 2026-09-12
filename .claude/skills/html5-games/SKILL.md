---
name: html5-games
description: Skill de desenvolvimento de jogos HTML5 utilizando tecnologias modernas.
tools:
  - Read
  - Write
  - Edit
---
# HTML5 Game Development

Desenvolva jogos utilizando APIs nativas do navegador.

## Tecnologias

HTML5
CSS3
JavaScript ES6+

## Estrutura recomendada

index.html
style.css
game.js

Quando o projeto for extremamente pequeno, um único HTML pode ser utilizado.

## Game Loop

Para jogos em tempo real, prefira:

requestAnimationFrame()

Estrutura conceitual:

gameLoop(timestamp)
    update()
    render()
    requestAnimationFrame(gameLoop)

Separe atualização da lógica e renderização sempre que isso melhorar a clareza.

## Estado

Mantenha o estado do jogo explicitamente.

Exemplo:

gameState = {
    score,
    lives,
    player,
    enemies,
    running,
    gameOver
}

Evite espalhar estado global desnecessariamente.