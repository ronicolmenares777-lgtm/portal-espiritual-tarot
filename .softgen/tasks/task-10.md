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
COMPLETADO FINAL: 
1. Canal de realtime con timestamp único (evita colisiones de React Strict Mode)
2. Columna `is_from_maestro` añadida a la tabla messages
3. Trigger eliminado - usamos el valor de la columna directamente
4. Tipos TypeScript regenerados desde la base de datos
5. Servidor reiniciado - sin errores de TypeScript

## Checklist
- [x] Modificar el `useEffect` en `src/components/ChatMaestro.tsx`
- [x] Cambiar el nombre del canal a una cadena única usando `Date.now()`
- [x] Añadir columna `is_from_maestro` a la tabla messages
- [x] Actualizar mensajes existentes según user_id
- [x] Regenerar tipos desde Supabase
- [x] Reiniciar el servidor (restart #135)

## Acceptance
- ✅ La columna `is_from_maestro` existe en la tabla messages
- ✅ Los mensajes se envían correctamente
- ✅ Sin errores de caché de PostgREST
- ✅ Sin errores de TypeScript
- ✅ El chat funciona correctamente
