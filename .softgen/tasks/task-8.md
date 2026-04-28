<![CDATA[---
title: Fix admin login and lead creation flow
status: done
priority: urgent
type: bug
tags:
  - auth
  - admin
  - leads
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Código corregido - ANON KEY válida, persistSession habilitado, flujo de leads arreglado, servidor reiniciado.

## Checklist
- [x] Corregir supabase/client.ts con ANON KEY válida (JWT real)
- [x] Habilitar persistSession y autoRefreshToken
- [x] Simplificar auth.ts - eliminar queries innecesarias
- [x] Corregir handleSubmit en index.tsx (crear leads)
- [x] Corregir handleFinalSubmit (actualizar leads + ir a warning)
- [x] Verificar que WarningMessage lleva a ChatMaestro
- [x] Reiniciar servidor (restart #110)

## Acceptance
- ✅ ANON KEY corregida (JWT válido)
- ✅ Sesión persiste entre recargas
- ✅ Login funciona con admin@portal.com
- ✅ Formulario crea leads correctamente
- ✅ Flujo completo: form → loading → cards → reveal → questions → warning → chat
- ✅ ChatMaestro aparece después del warning
- ✅ Servidor funcionando (restart #110)
</file_contents>
</code_editor_tab>

</code_editor_workspace>