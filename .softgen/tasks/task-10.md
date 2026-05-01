---
title: Fix Supabase Realtime strict mode collision
status: done
priority: urgent
type: bug
tags:
  - chat
  - realtime
  - bugfix
  - multimedia
  - features
created_by: softgen
created_at: '2026-04-28T06:45:00Z'
position: 10
---

## Notes
✅ COMPLETADO AL 100%:
1. ✅ Realtime funcionando en ambos chats
2. ✅ Indicador "Escribiendo..." usando Realtime presence
3. ✅ Doble check azul cuando el mensaje sea leído
4. ✅ Categoría favoritos con estrella (no corazón)
5. ✅ Filtro de favoritos en dashboard
6. ✅ Selector de clasificación con categorías correctas (Nuevo, En Chat, Caliente, Listo, Cerrado, Perdido)
7. ✅ Fondo negro en chat de usuario
8. ✅ Nombre real en burbujas
9. ✅ Multimedia funcional
10. ✅ Columna is_favorite agregada

## Checklist
- [x] Indicador "Escribiendo..." implementado
- [x] Doble check azul para mensajes leídos
- [x] Estrella de favoritos en chat de admin
- [x] Filtro de favoritos en dashboard
- [x] Selector de clasificación con categorías correctas
- [x] Clasificación se actualiza en tiempo real
- [x] Sin errores de compilación

## Acceptance
- ✅ Al escribir mensaje, el otro usuario ve "Escribiendo..."
- ✅ Mensajes leídos muestran doble check azul
- ✅ Click en estrella marca/desmarca favorito
- ✅ Filtro de favoritos funciona en dashboard
- ✅ Selector de clasificación con 6 categorías (Nuevo, En Chat, Caliente, Listo, Cerrado, Perdido)
- ✅ Clasificación se actualiza al seleccionar en el dropdown
