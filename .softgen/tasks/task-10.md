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
✅ COMPLETADO - CORRECCIÓN FINAL APLICADA:
1. Tipos TypeScript regenerados desde Supabase
2. Confirmado: columna = `text` (NO 'content')
3. TODOS los archivos actualizados a 'text':
   - messageService.ts
   - admin.ts
   - ChatMaestro.tsx
   - chat/[id].tsx
4. Login /Suafazon funcionando
5. Servidor reiniciado
6. Sin errores de compilación

## Checklist
- [x] Regenerar tipos TypeScript desde Supabase
- [x] Confirmar columna del schema: `text`
- [x] Actualizar messageService.ts a 'text'
- [x] Actualizar admin.ts a 'text'
- [x] Actualizar ChatMaestro.tsx a 'text'
- [x] Actualizar chat/[id].tsx a 'text'
- [x] Login /Suafazon funcionando
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Columna 'text' confirmada por tipos TS
- ✅ Todos los archivos usando 'text'
- ✅ Sin errores de TypeScript
- ✅ Sin errores de compilación
- ✅ Chat funcional
- ✅ Login /Suafazon funcionando
