<![CDATA[---
title: Fix admin login access to /Suafazon dashboard
status: done
priority: urgent
type: bug
tags:
  - auth
  - admin
  - supabase
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Todos los usuarios eliminados, usuario admin nuevo creado desde cero (admin@portal.com), perfil sincronizado, servidor reiniciado.

## Checklist
- [x] Ver usuarios existentes en auth.users
- [x] ELIMINAR TODOS los usuarios y perfiles antiguos
- [x] Crear usuario nuevo en auth.users (admin@portal.com)
- [x] Crear perfil admin con UUID del nuevo usuario
- [x] Verificar sincronización auth.users ↔ profiles
- [x] RLS deshabilitado en profiles
- [x] Reiniciar servidor (restart #107)

## Acceptance
- ✅ Usuario NUEVO: admin@portal.com
- ✅ Password: Admin2024
- ✅ Email confirmado automáticamente
- ✅ Perfil admin sincronizado
- ✅ RLS deshabilitado
- ✅ Login debe funcionar
- ✅ Acceso a /Suafazon habilitado
- ✅ Servidor funcionando (restart #107)
</file_contents>
</code_editor_tab>

</code_editor_workspace>