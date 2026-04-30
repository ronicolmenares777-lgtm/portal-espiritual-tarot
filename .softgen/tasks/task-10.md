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
1. Schema de Supabase verificado - columna confirmada: `content`
2. TODOS los archivos actualizados de 'text' a 'content':
   - messageService.ts
   - admin.ts (tipo Message)
   - ChatMaestro.tsx (send + render)
   - chat/[id].tsx (send + quick + media + render)
3. Tipos TypeScript regenerados desde Supabase
4. Servidor reiniciado exitosamente
5. Sin errores PGRST204

## Checklist
- [x] Verificar schema de Supabase
- [x] Confirmar nombre de columna: `content`
- [x] Actualizar messageService.ts
- [x] Actualizar admin.ts
- [x] Actualizar ChatMaestro.tsx
- [x] Actualizar chat/[id].tsx
- [x] Regenerar tipos TypeScript
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Columna 'content' confirmada del schema
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Sin errores de compilación
- ✅ Chat funcional y enviando mensajes
