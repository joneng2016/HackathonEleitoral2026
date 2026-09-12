---
name: collision-detection
description: Skill de detecção de colisões para jogos 2D.
tools:
  - Read
  - Write
  - Edit
---

# Collision Detection

Implemente colisões simples e eficientes.

## AABB

Para objetos retangulares:

A.x < B.x + B.width
A.x + A.width > B.x
A.y < B.y + B.height
A.y + A.height > B.y

## Círculos

Utilize distância entre centros.

## Objetivos

Prefira algoritmos simples.

Não implemente sistemas complexos de física quando uma colisão geométrica simples resolver o problema.