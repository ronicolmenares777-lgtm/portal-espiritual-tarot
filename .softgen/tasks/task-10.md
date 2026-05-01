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
   - Usuario creado desde Supabase Dashboard (método oficial)
   - Email: tubrujo@gmail.com
   - Contraseña: Pepe2002#
   - Perfil creado con role = 'admin'
   - Código actualizado para usar role en lugar de is_admin
4. RLS policies de profiles arregladas:
   - Política "public_read_profiles" permite lectura a todos
   - Necesario para que el login pueda verificar el role

## Checklist
- [x] SQL manual ejecutado para tabla messages
- [x] Chat usuario funcional
- [x] Usuario admin creado desde Dashboard
- [x] Perfil admin creado con role = 'admin'
- [x] Código actualizado (index.tsx y auth.ts)
- [x] RLS policies de profiles arregladas
- [x] Usuario y perfil verificados

## Acceptance
- ✅ Chat funcional sin PGRST204
- ✅ Usuario admin creado correctamente
- ✅ Perfil con role = 'admin' existe
- ✅ RLS policies permiten lectura de profiles
- ✅ Listo para login
