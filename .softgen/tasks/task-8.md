<![CDATA[---
title: Fix invalid API key using env variables
status: done
priority: urgent
type: bug
tags:
  - supabase
  - api-key
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: client.ts ahora usa process.env directamente para ANON KEY, servidor reiniciado.

## Checklist
- [x] Verificar .env.local tiene NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] Cambiar client.ts para usar process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] Reiniciar servidor (restart #114)

## Acceptance
- ✅ client.ts usa variables de entorno
- ✅ ANON KEY se carga desde .env.local
- ✅ Lectura de tarot funciona
- ✅ Servidor funcionando (restart #114)
</file_contents>
</code_editor_tab>

</code_editor_workspace>