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
   - Usuario: tubrujo@gmail.com
   - Contraseña: Pepe2002
   - Email SIN confirmar (recibirá email de confirmación)
   - Perfil con role = 'admin'
4. Supabase Auth Config:
   - Email confirmation requerida (ON)
   - Usuario debe confirmar email desde Gmail

## Checklist
- [x] SQL manual ejecutado para tabla messages
- [x] Chat usuario funcional
- [x] Usuario configurado: tubrujo@gmail.com
- [x] Perfil admin con role = 'admin'
- [x] Contraseña: Pepe2002
- [x] Email sin confirmar (esperando confirmación)

## Acceptance
- ✅ Chat funcional sin PGRST204
- ⏳ Usuario debe confirmar email desde Gmail
- ⏳ Login funcionará después de confirmar email
