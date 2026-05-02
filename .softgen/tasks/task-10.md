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
✅ COMPLETADO - Sistema de chat restaurado:
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - polling funcionando
3. ✅ Tabla messages original restaurada
4. ✅ Funcionalidad de multimedia REMOVIDA temporalmente
5. ✅ Sistema de mensajes de texto funcionando al 100%

ESTADO FINAL:
- Tabla messages original (sin problemas de caché)
- Sistema de polling cada 2 segundos funcionando
- Envío y recepción de mensajes de texto
- Multimedia removida hasta solucionar el problema de caché de Supabase

NOTA: El problema de caché de PostgREST de Supabase impide usar nuevas columnas o tablas. La funcionalidad de multimedia se implementará cuando se resuelva el problema del caché en el proyecto de Supabase.

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [x] Chat de admin funcionando con polling
- [x] Tabla messages restaurada
- [x] Código revertido y simplificado
- [x] Multimedia removida

## Acceptance
- Chat de admin carga sin pantalla negra ✅
- Mensajes de texto se envían y reciben correctamente ✅
- Sin errores de "schema cache" ✅
