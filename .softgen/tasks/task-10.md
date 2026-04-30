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
3. Código alineado con estructura real de BD (campo `text` confirmado del schema)
4. Eliminado `user_id` inexistente del código
5. Eliminado `media_url` del código (NO se usa para enviar mensajes)
6. Eliminado `media_type` del código (NO se usa para enviar mensajes)
7. Tipos TypeScript regenerados desde Supabase
8. Scroll automático implementado en ambos chats
9. Tipo Lead corregido para coincidir con estructura de BD
10. Casts de id a string agregados
11. mockData.ts corregido (countryCode → country_code)
12. Campos opcionales del tipo Lead marcados correctamente
13. Cast agregado para resolver incompatibilidad de tipo status
14. Validación de WhatsApp según código de país implementada
15. Código de país predeterminado cambiado a +1
16. Diseño del selector de país mejorado
17. Eliminado .single() de los inserts (causaba error "Cannot coerce to JSON object")
18. Cambiado .single() por .maybeSingle() en carga de leads
19. Sin errores de compilación ni runtime

## Checklist
- [x] Modificar el `useEffect` con timestamp único para canal
- [x] Verificar columna `is_from_maestro` en tabla messages
- [x] Confirmar nombre de campo desde schema (text, confirmado)
- [x] Eliminar user_id de inserts (columna no existe)
- [x] No enviar media_url ni media_type en mensajes básicos
- [x] Implementar scroll automático con useRef + useEffect
- [x] Corregir tipo Lead en admin.ts
- [x] Agregar casts de id a string
- [x] Corregir mockData.ts (countryCode → country_code)
- [x] Hacer opcionales los campos stage, assigned_to, priority, conversion_date
- [x] Agregar cast as Lead para resolver error de tipo status
- [x] Implementar validación de WhatsApp según código de país
- [x] Cambiar código predeterminado a +1
- [x] Mejorar diseño del selector de país
- [x] Eliminar .single() de inserts para evitar error de coerción
- [x] Usar .maybeSingle() en carga de leads (permite 0 resultados)
- [x] Regenerar tipos desde Supabase
- [x] Reiniciar servidor (restart #156)

## Acceptance
- ✅ Sin errores de TypeScript
- ✅ Sin errores de runtime
- ✅ Sin errores PGRST204
- ✅ Campos coinciden con estructura de BD
- ✅ Chat funcional sin errores de esquema
- ✅ Los mensajes se envían correctamente
- ✅ Scroll automático hacia abajo al recibir mensajes
- ✅ Validación de WhatsApp según país funcionando
- ✅ Chat carga sin error "Cannot coerce"
