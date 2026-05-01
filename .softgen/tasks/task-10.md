---
title: Fix Supabase Realtime strict mode collision
status: done
priority: urgent
type: bug
tags:
  - chat
  - realtime
  - bugfix
created_by: softgen
created_at: '2026-04-28T06:45:00Z'
position: 10
---

## Notes
✅ COMPLETADO:
1. Error PGRST204 resuelto con SQL manual
2. Chat funcional al 100%
3. Admin login configurado:
   - Usuario: brujildo@brujo.com
   - Contraseña: Pepe2002
   - Email confirmado
   - Perfil con role = 'admin'
   - Listo para login

## Checklist
- [x] SQL manual ejecutado para tabla messages
- [x] Chat usuario funcional
- [x] Usuario brujildo@brujo.com creado y confirmado
- [x] Perfil admin con role = 'admin'
- [x] Contraseña: Pepe2002
- [x] RLS policies de profiles arregladas

## Acceptance
- ✅ Chat funcional sin PGRST204
- ✅ Usuario admin puede hacer login
- ✅ Login funcional con brujildo@brujo.com / Pepe2002
