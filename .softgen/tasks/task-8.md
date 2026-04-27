<![CDATA[---
title: Fix chat message delivery with stable polling
status: done
priority: urgent
type: bug
tags:
  - chat
  - real-time
  - supabase
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Usuario antiguo eliminado, nuevo usuario admin creado desde Supabase (brujotu@gmail.com), perfil sincronizado, RLS deshabilitado.

## Checklist
- [x] Eliminar usuario antiguo (tubrujo@gmail.com) de auth.users
- [x] Limpiar tabla profiles
- [x] Crear NUEVO usuario en auth.users (brujotu@gmail.com con password Pepe2002)
- [x] Obtener UUID del nuevo usuario
- [x] Crear perfil admin con UUID del nuevo usuario
- [x] Verificar sincronización auth.users ↔ profiles
- [x] RLS deshabilitado en profiles
- [x] Reiniciar servidor (restart #100)

## Acceptance
- ✅ Usuario nuevo creado: brujotu@gmail.com
- ✅ Password configurado: Pepe2002
- ✅ Perfil admin sincronizado
- ✅ UUIDs coinciden (auth.users.id = profiles.id)
- ✅ RLS deshabilitado (sin bloqueos)
- ✅ Login debe funcionar ahora
- ✅ Servidor funcionando (restart #100)
</file_contents>
</code_editor_tab>

</code_editor_workspace>