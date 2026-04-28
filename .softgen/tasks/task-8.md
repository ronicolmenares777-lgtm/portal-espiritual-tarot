<![CDATA[---
title: Fix missing columns in leads table
status: done
priority: urgent
type: bug
tags:
  - database
  - leads
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Columnas selected_cards (TEXT[]) y precision_answers (JSONB) agregadas a tabla leads, servidor reiniciado.

## Checklist
- [x] Obtener esquema de tabla leads
- [x] Agregar columna selected_cards (TEXT[])
- [x] Agregar columna precision_answers (JSONB)
- [x] Verificar columnas agregadas correctamente
- [x] Reiniciar servidor (restart #115)

## Acceptance
- ✅ Columna selected_cards existe en leads
- ✅ Columna precision_answers existe en leads
- ✅ Tipo de datos correcto (TEXT[] y JSONB)
- ✅ Flujo completo funciona sin errores
- ✅ Servidor funcionando (restart #115)
</file_contents>
</code_editor_tab>

</code_editor_workspace>