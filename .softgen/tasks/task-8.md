<![CDATA[---
title: Fix invalid API key error
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
COMPLETADO: ANON KEY corregida en client.ts (cambio de prefijo inválido a JWT válido), servidor reiniciado.

## Checklist
- [x] Abrir client.ts
- [x] Cambiar ANON KEY de "sb_publishable_..." a JWT válido
- [x] Mantener TODO lo demás igual (persistSession, autoRefreshToken)
- [x] Reiniciar servidor (restart #113)

## Acceptance
- ✅ ANON KEY válida (JWT real de Supabase)
- ✅ Lectura de tarot funciona
- ✅ Login admin funciona
- ✅ Servidor funcionando (restart #113)
</file_contents>
</code_editor_tab>

</code_editor_workspace>