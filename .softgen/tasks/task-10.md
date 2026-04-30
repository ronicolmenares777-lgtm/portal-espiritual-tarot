---
title: Fix Supabase Realtime strict mode collision
status: done
priority: urgent
type: bug
tags:
  - chat
  - realtime
  - bugfix
created_by: softgen
created_at: '2026-04-28T06:45:00Z'
position: 10
---

## Notes
✅ COMPLETADO - CORRECCIÓN DEFINITIVA APLICADA:
1. SQL query reveló que la columna se llamaba 'content'
2. Columna RENOMBRADA en DB: `content` → `text`
3. Código ya estaba usando 'text'
4. Servidor reiniciado
5. Chat ahora funcional

## Checklist
- [x] Verificar columnas reales con SQL
- [x] Descubrir que columna era 'content'
- [x] Renombrar columna en DB: content → text
- [x] Código ya usando 'text' (correcto)
- [x] Reiniciar servidor
- [x] Chat funcional

## Acceptance
- ✅ Columna renombrada de 'content' a 'text' en DB
- ✅ Código usando 'text' (correcto)
- ✅ Sin errores PGRST204
- ✅ Chat funcional
- ✅ Login /Suafazon funcionando
