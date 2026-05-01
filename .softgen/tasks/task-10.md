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
✅ COMPLETADO - CORRECCIÓN COMPLETA:
1. Schema verificado - columna 'is_from_maestro' NO existía
2. Columna 'is_from_maestro' agregada a tabla messages
3. Cache de schema de Supabase limpiado (NOTIFY pgrst, 'reload schema')
4. Tipos TypeScript regenerados
5. MessageService actualizado
6. ChatMaestro actualizado (is_from_maestro: false)
7. Admin chat actualizado (is_from_maestro: true)
8. Servidor reiniciado
9. Sin errores de compilación

## Checklist
- [x] Verificar schema de tabla messages
- [x] Agregar columna is_from_maestro BOOLEAN DEFAULT false
- [x] Limpiar cache de schema (NOTIFY pgrst)
- [x] Regenerar tipos TypeScript
- [x] Actualizar messageService.ts
- [x] Actualizar ChatMaestro.tsx
- [x] Actualizar chat/[id].tsx
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Columna 'is_from_maestro' existe en tabla messages
- ✅ Cache de schema limpiado
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Chat funcional - usuario puede enviar mensajes
- ✅ Admin puede responder mensajes
