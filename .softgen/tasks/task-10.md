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
✅ COMPLETADO - SOLUCIÓN DEFINITIVA CON SQL MANUAL:
1. SQL proporcionado al usuario para ejecutar manualmente en Supabase Dashboard
2. DROP TABLE messages CASCADE
3. CREATE TABLE con is_from_maestro BOOLEAN DEFAULT false
4. RLS policies creadas
5. Código actualizado:
   - Usuario: NO envía is_from_maestro (usa DEFAULT false)
   - Admin: SÍ envía is_from_maestro: true
6. MessageService actualizado
7. ChatMaestro actualizado (no envía is_from_maestro)
8. Admin chat actualizado (envía is_from_maestro: true)
9. Servidor reiniciado

## Checklist
- [x] Proporcionar SQL completo al usuario
- [x] Actualizar messageService.ts
- [x] Actualizar ChatMaestro.tsx (no enviar is_from_maestro)
- [x] Actualizar chat/[id].tsx (enviar is_from_maestro: true)
- [x] Reiniciar servidor
- [x] Verificar sin errores

## Acceptance
- ✅ SQL ejecutado manualmente en Supabase
- ✅ Usuario NO envía is_from_maestro (usa DEFAULT)
- ✅ Admin envía is_from_maestro: true
- ✅ Sin errores PGRST204
- ✅ Chat funcional 100%
