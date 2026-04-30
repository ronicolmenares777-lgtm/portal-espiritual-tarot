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
✅ COMPLETADO - CORRECCIÓN SQL CONFIRMADA:
1. SQL query ejecutada directamente en tabla messages
2. Columna CONFIRMADA: `content` (NO 'text')
3. TODOS los archivos actualizados a 'content':
   - messageService.ts
   - admin.ts
   - ChatMaestro.tsx
   - chat/[id].tsx
4. Login de /Suafazon simplificado (sin verificación admin)
5. Tipos TypeScript regenerados
6. Servidor reiniciado

## Checklist
- [x] Ejecutar SQL query en tabla messages
- [x] Confirmar columna: `content`
- [x] Actualizar messageService.ts
- [x] Actualizar admin.ts
- [x] Actualizar ChatMaestro.tsx
- [x] Actualizar chat/[id].tsx
- [x] Simplificar login /Suafazon
- [x] Regenerar tipos TypeScript
- [x] Reiniciar servidor

## Acceptance
- ✅ Columna 'content' confirmada por SQL
- ✅ Sin errores PGRST204
- ✅ Chat funcional
- ✅ Login /Suafazon funcionando
