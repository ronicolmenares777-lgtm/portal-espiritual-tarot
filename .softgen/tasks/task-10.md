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
✅ COMPLETADO - Todos los errores corregidos:
1. Canal de realtime con timestamp único (evita colisiones React Strict Mode)
2. Columna `is_from_maestro` confirmada en tabla messages
3. Código alineado con estructura real de BD (campo `text`, no `content`)
4. Eliminado `user_id` inexistente del código
5. Tipos TypeScript regenerados
6. Sin errores de compilación ni runtime

## Checklist
- [x] Modificar el `useEffect` con timestamp único para canal
- [x] Verificar columna `is_from_maestro` en tabla messages
- [x] Corregir nombre de campos (text, no content)
- [x] Eliminar user_id de inserts (columna no existe)
- [x] Actualizar tipos en messageService.ts y admin.ts
- [x] Regenerar tipos desde Supabase
- [x] Reiniciar servidor (restart #136)

## Acceptance
- ✅ Sin errores de TypeScript
- ✅ Sin errores de runtime
- ✅ Campos coinciden con estructura de BD
- ✅ Chat funcional sin errores de esquema
