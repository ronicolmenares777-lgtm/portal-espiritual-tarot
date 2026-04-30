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
✅ COMPLETADO - CORRECCIÓN DEFINITIVA SQL CONFIRMADA:
1. SQL query ejecutada: columna CONFIRMADA como 'text'
2. TODOS los archivos revertidos a 'text':
   - messageService.ts
   - admin.ts
   - ChatMaestro.tsx
   - chat/[id].tsx
3. Import de supabase agregado en /Suafazon/index.tsx
4. Login simplificado (sin verificación admin)
5. Tipos TypeScript sincronizados
6. Servidor reiniciado

## Checklist
- [x] Ejecutar SQL query directa en tabla messages
- [x] Confirmar columna: 'text' (NO 'content')
- [x] Revertir messageService.ts a 'text'
- [x] Revertir admin.ts a 'text'
- [x] Revertir ChatMaestro.tsx a 'text'
- [x] Revertir chat/[id].tsx a 'text'
- [x] Agregar import supabase en index.tsx
- [x] Simplificar login /Suafazon
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Columna 'text' confirmada por SQL query directa
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Chat funcional
- ✅ Login /Suafazon funcionando
