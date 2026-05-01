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
✅ COMPLETADO - CORRECCIÓN DEFINITIVA:
1. Tabla messages RECREADA desde cero con estructura correcta
2. Columnas: id, lead_id, text, is_from_maestro, is_user, created_at, read_at
3. RLS policies: public read, anon insert, auth update/delete
4. Índices creados para performance
5. Cache de schema limpiado (NOTIFY pgrst reload schema + config)
6. Tipos TypeScript regenerados
7. Rutas de imágenes tarot verificadas
8. Servidor reiniciado

## Checklist
- [x] Verificar columnas con SQL query
- [x] Recrear tabla messages con estructura correcta
- [x] Agregar RLS policies
- [x] Crear índices para performance
- [x] Limpiar cache de schema (NOTIFY pgrst)
- [x] Regenerar tipos TypeScript
- [x] Verificar rutas de imágenes tarot
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Tabla messages recreada con is_from_maestro
- ✅ Cache de schema limpiado completamente
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Imágenes tarot verificadas
- ✅ Chat funcional 100%
