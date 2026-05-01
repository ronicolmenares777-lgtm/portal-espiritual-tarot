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
1. SQL query confirmó columna: `text`
2. MessageService actualizado con 'text'
3. Tipo Message actualizado con 'text'
4. ChatMaestro actualizado con 'text'
5. Admin chat actualizado con 'text'
6. Eliminada llamada a MessageService.markAsRead (no existía)
7. Servidor reiniciado
8. Sin errores de compilación

## Checklist
- [x] Verificar columna con SQL query directa
- [x] Confirmar: columna es 'text'
- [x] Actualizar messageService.ts
- [x] Actualizar admin.ts
- [x] Actualizar ChatMaestro.tsx
- [x] Actualizar chat/[id].tsx
- [x] Eliminar llamada a markAsRead inexistente
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Columna 'text' confirmada por SQL
- ✅ Código usando 'text' consistentemente
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Sin llamadas a métodos inexistentes
- ✅ Chat funcional entre usuario y admin
