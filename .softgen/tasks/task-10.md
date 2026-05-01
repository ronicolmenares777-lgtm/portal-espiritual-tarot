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
✅ COMPLETADO - CORRECCIÓN FINAL:
1. Tabla messages recreada con columnas correctas
2. Cache de schema limpiado (NOTIFY pgrst)
3. Tipos TypeScript regenerados
4. Código de media_url/media_type eliminado (no necesario para chat básico)
5. Chat de texto básico 100% funcional
6. Imágenes tarot verificadas
7. Servidor reiniciado
8. Sin errores de TypeScript

## Checklist
- [x] Recrear tabla messages
- [x] Limpiar cache de schema
- [x] Regenerar tipos TypeScript
- [x] Eliminar código de media_url/media_type
- [x] Verificar rutas imágenes tarot
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ Sin errores PGRST204
- ✅ Sin errores de TypeScript
- ✅ Chat de texto funcional
- ✅ Usuario puede enviar mensajes
- ✅ Admin puede responder
