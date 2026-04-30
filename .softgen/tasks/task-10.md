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
✅ COMPLETADO - CORRECCIÓN FINAL DEFINITIVA:
1. Schema de Supabase verificado directamente
2. Columna REAL confirmada: `text` (NO `content`)
3. TODOS los archivos revertidos a 'text':
   - messageService.ts
   - admin.ts (tipo Message)
   - ChatMaestro.tsx (send + render)
   - chat/[id].tsx (send + render + quick reply + media)
4. Sin .single() en ningún insert
5. .maybeSingle() en carga de leads
6. Tipos TypeScript regenerados desde Supabase
7. Scroll automático funcionando
8. Validación WhatsApp activa
9. Servidor reiniciado

## Checklist
- [x] Obtener schema REAL de Supabase
- [x] Confirmar nombre de columna: `text` (confirmado del schema)
- [x] Actualizar messageService.ts con 'text'
- [x] Actualizar tipo Message en admin.ts con 'text'
- [x] Actualizar ChatMaestro.tsx con 'text'
- [x] Actualizar chat/[id].tsx con 'text' (send, quick, media, JSX)
- [x] Eliminar .single() de inserts
- [x] Usar .maybeSingle() en carga de leads
- [x] Scroll automático implementado
- [x] Validación WhatsApp según país
- [x] Código país predeterminado +1
- [x] Regenerar tipos desde Supabase
- [x] Reiniciar servidor (restart #160)

## Acceptance
- ✅ Columna 'text' confirmada del schema de Supabase
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Sin errores de runtime
- ✅ Chat envía mensajes correctamente
- ✅ Chat carga sin errores
- ✅ Scroll automático funciona
- ✅ Validación WhatsApp activa
