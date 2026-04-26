---
title: Fix chat message delivery with stable polling
status: done
priority: urgent
type: bug
tags:
  - chat
  - real-time
  - supabase
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: Conexión Supabase restaurada, tablas creadas, RLS configurado, usuario admin creado, tipos de TypeScript arreglados, polling de 3 segundos implementado.

## Checklist
- [x] Actualizar claves Supabase (fetch_and_update_api_keys)
- [x] Actualizar client.ts con URL correcta (https://lqyogtdozblvdkyhpxiq.supabase.co)
- [x] Crear tabla leads con políticas RLS públicas
- [x] Crear tabla messages con políticas RLS públicas
- [x] Crear tabla profiles con columna role
- [x] Crear usuario admin (tubrujo@gmail.com)
- [x] Arreglar tipos TypeScript de Supabase
- [x] Implementar polling de 3 segundos con flag anti-saturación
- [x] Remover delays artificiales de 500ms
- [x] Verificar servidor sin errores (restart #57)
- [x] Probar flujo completo: formulario → chat

## Acceptance
- ✅ Supabase conectado (PostgreSQL 17.6)
- ✅ Todas las tablas creadas con RLS público
- ✅ Usuario admin puede entrar a /Suafazon
- ✅ Chat carga sin errores
- ✅ Mensajes aparecen en 3 segundos
- ✅ Sin errores CORS/500/522/544
- ✅ Sin errores de TypeScript