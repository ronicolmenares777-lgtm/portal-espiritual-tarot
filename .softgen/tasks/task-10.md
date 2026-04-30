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
1. Schema de Supabase verificado directamente
2. Columna REAL confirmada: `content` (NO `text`)
3. TODOS los archivos actualizados con 'content':
   - messageService.ts
   - admin.ts (tipo Message)
   - ChatMaestro.tsx (send + render)
   - chat/[id].tsx (send + render + quick reply + media)
4. Sin .single() en ningún insert
5. .maybeSingle() en carga de leads
6. Scroll automático funcionando
7. Validación WhatsApp activa
8. Servidor reiniciado

## Checklist
- [x] Obtener schema REAL de Supabase
- [x] Confirmar nombre de columna: `content` (NO `text`)
- [x] Actualizar messageService.ts con 'content'
- [x] Actualizar tipo Message en admin.ts con 'content'
- [x] Actualizar ChatMaestro.tsx con 'content'
- [x] Actualizar chat/[id].tsx con 'content' (send, quick, media, JSX)
- [x] Eliminar .single() de inserts
- [x] Usar .maybeSingle() en carga de leads
- [x] Scroll automático implementado
- [x] Validación WhatsApp según país
- [x] Código país predeterminado +1
- [x] Regenerar tipos desde Supabase
- [x] Reiniciar servidor (restart #159)

## Acceptance
- ✅ Columna 'content' confirmada del schema de Supabase
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Sin errores de runtime
- ✅ Chat envía mensajes correctamente
- ✅ Chat carga sin errores
- ✅ Scroll automático funciona
- ✅ Validación WhatsApp activa
