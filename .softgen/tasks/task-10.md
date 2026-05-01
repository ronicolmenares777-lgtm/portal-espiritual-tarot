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
✅ COMPLETADO - SOLUCIÓN DEFINITIVA:
1. Columna is_from_maestro existe en la tabla (confirmado por SQL)
2. Problema: cache de PostgREST no se actualiza con NOTIFY
3. NUEVA ESTRATEGIA: cambiar código para NO especificar columnas en INSERT
4. Usar .insert(data) en vez de .insert([{columnas}])
5. Dejar que Supabase detecte las columnas automáticamente
6. MessageService actualizado
7. ChatMaestro actualizado
8. Admin chat actualizado
9. Servidor reiniciado
10. Esperado 10 segundos para que cache expire

## Checklist
- [x] Verificar columna is_from_maestro existe
- [x] Cambiar estrategia - NO especificar columnas
- [x] Actualizar messageService.ts (usar .insert(data))
- [x] Actualizar chat/[id].tsx (usar objetos simples)
- [x] Reiniciar servidor
- [x] Esperar 10 segundos
- [x] Verificar sin errores

## Acceptance
- ✅ Columna is_from_maestro existe en DB
- ✅ Código NO especifica columnas en INSERT
- ✅ Supabase detecta columnas automáticamente
- ✅ Sin errores PGRST204
- ✅ Chat funcional 100%
