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
✅ COMPLETADO - CORRECCIÓN DEFINITIVA APLICADA:
1. Schema de Supabase verificado - columna: `content`
2. TODOS los archivos actualizados a 'content':
   - messageService.ts
   - admin.ts
   - ChatMaestro.tsx
   - chat/[id].tsx
3. Login /Suafazon funcionando (import agregado)
4. Servidor reiniciado exitosamente
5. Sin errores de compilación

## Checklist
- [x] Verificar schema de Supabase
- [x] Confirmar columna: `content` (NO 'text')
- [x] Actualizar messageService.ts a 'content'
- [x] Actualizar admin.ts a 'content'
- [x] Actualizar ChatMaestro.tsx a 'content'
- [x] Actualizar chat/[id].tsx a 'content'
- [x] Agregar import supabase en /Suafazon/index.tsx
- [x] Simplificar login
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Columna 'content' confirmada del schema
- ✅ Todos los archivos usando 'content'
- ✅ Sin errores PGRST204
- ✅ Sin errores de compilación
- ✅ Chat funcional
- ✅ Login /Suafazon funcionando
