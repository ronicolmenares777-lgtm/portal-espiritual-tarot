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
COMPLETADO: Se modificó la creación del canal en ChatMaestro.tsx para usar `Date.now()` en el nombre del canal, evitando así colisiones en el caché interno de Supabase cuando React Strict Mode monta el componente dos veces.

## Checklist
- [x] Modificar el `useEffect` en `src/components/ChatMaestro.tsx`
- [x] Cambiar el nombre del canal a una cadena única usando `Date.now()`
- [x] Reiniciar el servidor
- [x] Verificar que el chat abre sin errores en consola

## Acceptance
- ✅ El chat abre correctamente sin arrojar errores de realtime en la consola.
- ✅ La suscripción en tiempo real funciona para recibir mensajes.
