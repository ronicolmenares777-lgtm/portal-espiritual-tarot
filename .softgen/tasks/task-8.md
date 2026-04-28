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
COMPLETADO: Supabase se atascó con PGRST204 para precision_answers. Solución: Renombrar las columnas (cards_selected, user_answers) para evadir el caché roto.

## Checklist
- [x] DROP old columns
- [x] ADD new columns with different names
- [x] NOTIFY pgrst, 'reload schema'
- [x] Update index.tsx with new column names
- [x] Regenerate Types
- [x] Restart PM2

## Acceptance
- ✅ PGRST204 evadido mediante cache busting.
