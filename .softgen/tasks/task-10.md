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
   - Email confirmado en DB
   - Perfil con role = 'admin'
4. Supabase Auth Config actualizada:
   - enable_confirmations: false
   - mailer_autoconfirm: true
   - disable_signup: false
5. Usuario con email_verified: true en metadata

## Checklist
- [x] SQL manual ejecutado para tabla messages
- [x] Chat usuario funcional
- [x] Usuario brujildo@brujo.com creado y confirmado
- [x] Perfil admin con role = 'admin'
- [x] Contraseña: Pepe2002
- [x] Supabase Auth config actualizada
- [x] Email verification deshabilitada

## Acceptance
- ✅ Chat funcional sin PGRST204
- ✅ Supabase Auth no requiere email confirmation
- ✅ Login funcional con brujildo@brujo.com / Pepe2002
