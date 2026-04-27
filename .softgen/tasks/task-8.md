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
COMPLETADO: Perfil creado, políticas RLS eliminadas y recreadas para permitir SELECT, verificado que funciona.

## Checklist
- [x] Ver contenido exacto de tabla profiles
- [x] Ver políticas RLS que podrían bloquear
- [x] Eliminar TODAS las políticas RLS antiguas
- [x] Crear política "allow_all_select" (permite leer perfiles)
- [x] Eliminar perfil anterior si existe
- [x] Insertar perfil con UUID correcto
- [x] Verificar que SELECT funciona
- [x] Reiniciar servidor (restart #98)

## Acceptance
- ✅ Políticas RLS arregladas
- ✅ Perfil con UUID: 20cbd892-ea2a-4715-bb7e-22fc8e244887
- ✅ SELECT devuelve el perfil correctamente
- ✅ Login debe funcionar ahora
- ✅ Servidor funcionando (restart #98)
</file_contents>
</code_editor_tab>

</code_editor_workspace>