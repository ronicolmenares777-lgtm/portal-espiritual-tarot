<![CDATA[---
title: Fix schema cache - columns recreated cleanly
status: done
priority: urgent
type: bug
tags:
  - database
  - leads
  - typescript
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Columnas eliminadas y recreadas limpiamente, tipos regenerados, caché Next.js borrado, servidor reiniciado 2 veces.

## Checklist
- [x] Verificar esquema actual de tabla leads
- [x] Eliminar columnas existentes (DROP COLUMN)
- [x] Recrear selected_cards (TEXT[]) y precision_answers (JSONB)
- [x] Verificar creación exitosa
- [x] Regenerar tipos TypeScript desde Supabase
- [x] Borrar caché de Next.js (.next)
- [x] Descomentar precision_answers en handleFinalSubmit
- [x] Reiniciar servidor (restart #118 y #119)

## Acceptance
- ✅ Columnas recreadas limpiamente en BD
- ✅ Tipos TypeScript actualizados
- ✅ Caché Next.js limpio
- ✅ Código actualizado con ambas columnas
- ✅ Servidor funcionando (restart #119)
</file_contents>
</code_editor_tab>

</code_editor_workspace>