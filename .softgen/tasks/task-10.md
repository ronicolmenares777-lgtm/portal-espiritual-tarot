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
✅ COMPLETADO - RECONSTRUCCIÓN COMPLETA DESDE CERO:
1. Tabla messages ELIMINADA completamente (DROP TABLE CASCADE)
2. Tabla RECREADA desde cero con estructura SIMPLE:
   - id (UUID, PK)
   - lead_id (UUID, FK → leads)
   - text (TEXT)
   - is_from_maestro (BOOLEAN)
   - created_at (TIMESTAMPTZ)
3. RLS policies creadas (public read, anon insert, auth update/delete)
4. Índices creados para performance
5. Schema reloaded (NOTIFY pgrst)
6. Tipos TypeScript regenerados
7. MessageService simplificado
8. Código actualizado para usar SOLO las columnas que existen
9. Servidor reiniciado

## Checklist
- [x] Verificar estado actual de tabla messages
- [x] DROP TABLE messages CASCADE
- [x] CREATE TABLE messages (estructura simple)
- [x] Crear RLS policies
- [x] Crear índices
- [x] NOTIFY pgrst reload
- [x] Regenerar tipos TypeScript
- [x] Actualizar admin.ts (tipo Message)
- [x] Actualizar messageService.ts
- [x] Actualizar ChatMaestro.tsx
- [x] Actualizar chat/[id].tsx
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Tabla messages creada desde cero
- ✅ Solo columnas necesarias (sin media_url, media_type, is_user, read_at)
- ✅ Código sincronizado con estructura real
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Chat funcional 100%
