---
title: Fix schema cache via column renaming (cache busting)
status: done
priority: urgent
type: bug
tags:
  - database
  - supabase
  - cache
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Renombradas columnas precision_answers → user_answers, selected_cards → cards_selected para evadir caché de Supabase. Todo el código actualizado.

## Checklist
- [x] DROP columnas antiguas
- [x] ADD columnas nuevas (cards_selected, user_answers)
- [x] NOTIFY pgrst reload schema
- [x] Actualizar index.tsx
- [x] Actualizar dashboard.tsx
- [x] Actualizar chat-usuario.tsx
- [x] Regenerar tipos TypeScript
- [x] Reiniciar servidor (restart #121)

## Acceptance
- ✅ Columnas renombradas en BD
- ✅ Todo el código actualizado
- ✅ Sin errores de compilación
- ✅ Servidor funcionando (restart #121)
