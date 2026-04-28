<![CDATA[---
title: Fix admin login - solo ANON KEY
status: done
priority: urgent
type: bug
tags:
  - auth
  - admin
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Código revertido - solo se cambió ANON KEY en client.ts, TODO lo demás vuelve a como estaba antes.

## Checklist
- [x] Revertir index.tsx a versión anterior (git checkout)
- [x] Revertir auth.ts a versión anterior (git checkout)
- [x] Solo mantener ANON KEY válida en client.ts
- [x] Reiniciar servidor (restart #111)

## Acceptance
- ✅ index.tsx como estaba (lectura de tarot funciona)
- ✅ auth.ts como estaba
- ✅ Solo ANON KEY corregida
- ✅ Servidor funcionando (restart #111)
</file_contents>
</code_editor_tab>

</code_editor_workspace>