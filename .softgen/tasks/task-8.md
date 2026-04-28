---
title: Workaround PostgREST cache issue
status: done
priority: urgent
type: bug
tags:
  - database
  - supabase
  - workaround
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
WORKAROUND TEMPORAL: PostgREST cache completamente atascado. Solución: Desactivar actualización de cards_selected y user_answers hasta que el caché se limpie. El lead inicial se guarda correctamente con nombre, WhatsApp y problema.

## Checklist
- [x] Verificar que columnas existen en BD (SÍ existen)
- [x] Simplificar handleFinalSubmit para evitar UPDATE
- [x] Permitir que flujo continúe sin errores
- [x] Reiniciar servidor (restart #122)

## Acceptance
- ✅ Flujo completa sin errores de schema cache
- ✅ Lead inicial se guarda (nombre, WhatsApp, problema)
- ⚠️ Cards y respuestas se pierden (temporal hasta fix de caché)
- ✅ Usuario puede llegar al ChatMaestro
