---
title: "Optimizar cursor, inputs y corregir error de realtime"
status: "done"
priority: "urgent"
type: "bug"
tags: ["cursor", "performance", "realtime", "chat", "responsive"]
created_by: "agent"
created_at: "2026-04-24"
position: 7
---

## Notes
Problemas críticos corregidos:

1. **Cursor personalizado lento:** ✅ CORREGIDO - Ambos elementos sincronizados sin lag

2. **Input lag en formulario:** ✅ CORREGIDO - Escritura instantánea

3. **Error crítico de realtime:** ✅ CORREGIDO DEFINITIVAMENTE
   - Error: `cannot add postgres_changes callbacks after subscribe()`
   - Causa: Orden incorrecto - se llamaba `.subscribe()` ANTES de `.on()`
   - Solución: Orden correcto en messageService.ts:
     1. `const channel = supabase.channel()`
     2. `channel.on('postgres_changes', ...)`
     3. `channel.subscribe()`

4. **Tiempo de transición:** ✅ AJUSTADO - De 5 segundos a 4 segundos (ritmo perfecto)

5. **Layout móvil:** ✅ MEJORADO - CardReveal totalmente responsive con cartas bien alineadas

6. **Tipos de TypeScript:** ✅ CORREGIDOS - Acceso correcto a `read_at` en lugar de `is_read`

7. **Leads no aparecen en Dashboard:** ✅ CORREGIDO - Consulta de LeadService.getAll() corregida

## Checklist
- [x] Optimizar cursor (punto y círculo sincronizados)
- [x] Eliminar lag en inputs del formulario
- [x] Corregir orden de suscripción realtime: `.channel()` → `.on()` → `.subscribe()`
- [x] Ajustar tiempo de transición a 4 segundos
- [x] Mejorar layout responsive de CardReveal en móvil
- [x] Corregir tipos TypeScript (read_at vs is_read)
- [x] Corregir consulta de leads en Dashboard
- [x] Verificar chat funciona en PC y móvil
- [x] Verificar leads aparecen en /Suafazon

## Acceptance
- ✅ Cursor fluido y sincronizado
- ✅ Inputs responden instantáneamente
- ✅ Chat abre sin error "cannot add callbacks..."
- ✅ Mensajes se envían correctamente
- ✅ Revelación dura 4 segundos
- ✅ Layout móvil bien alineado
- ✅ Leads aparecen en /Suafazon Dashboard
- ✅ Mensajes en tiempo real funcionan