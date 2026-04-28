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
COMPLETADO: 
1. Canal de realtime con timestamp único (evita colisiones de React Strict Mode)
2. Trigger en DB para establecer `is_from_maestro` automáticamente
3. Código simplificado - elimina dependencia de campo problemático del caché
4. Corregidos todos los usos de 'text' a 'content' en el código

## Checklist
- [x] Modificar el `useEffect` en `src/components/ChatMaestro.tsx`
- [x] Cambiar el nombre del canal a una cadena única usando `Date.now()`
- [x] Crear trigger `set_is_from_maestro()` en la base de datos
- [x] Eliminar `is_from_maestro` del INSERT en `messageService.ts`
- [x] Corregir uso de 'text' a 'content' en todos los archivos
- [x] Reiniciar el servidor (restart #133)

## Acceptance
- ✅ El chat abre correctamente sin errores de realtime
- ✅ Los mensajes se envían sin errores de caché de PostgREST
- ✅ El campo `is_from_maestro` se establece automáticamente
- ✅ Sin errores de TypeScript
