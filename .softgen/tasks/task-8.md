<![CDATA[---
title: Fix schema cache - total cache cleanup
status: done
priority: urgent
type: bug
tags:
  - database
  - leads
  - cache
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Limpieza TOTAL de caché - .next, node_modules/.cache, PM2 reiniciado desde cero.

## Checklist
- [x] Verificar columnas en database.types.ts
- [x] Detener y eliminar todos los procesos PM2
- [x] Iniciar PM2 desde cero
- [x] Borrar caché de Next.js (.next)
- [x] Borrar caché de node_modules
- [x] Reiniciar servidor (restart #120)

## Acceptance
- ✅ PM2 reiniciado completamente
- ✅ Todo el caché eliminado
- ✅ Servidor funcionando (restart #120)
- [ ] Usuario prueba con navegador NUEVO o modo incógnito
</file_contents>
</code_editor_tab>

</code_editor_workspace>