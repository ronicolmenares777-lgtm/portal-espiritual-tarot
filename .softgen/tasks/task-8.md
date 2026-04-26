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
COMPLETADO: Columna precision_answers verificada en DB, tipos TypeScript regenerados forzadamente, PM2 reiniciado completamente (stop + delete + start).

## Checklist
- [x] Corregir project ID (klxepxdekgnfyazqsytk)
- [x] Crear todas las tablas (leads, messages, profiles, tarot_cards)
- [x] Eliminar perfil duplicado (solo queda 20cbd892-ea2a-4715-bb7e-22fc8e244887)
- [x] Verificar columna precision_answers existe en DB
- [x] Regenerar tipos TypeScript (forzado con supabase_generate_types)
- [x] Verificar database.types.ts contiene precision_answers
- [x] PM2 restart completo (stop → delete → start)
- [x] Verificar logs del servidor sin errores

## Acceptance
- ✅ Supabase conectado (klxepxdekgnfyazqsytk)
- ✅ Solo un perfil admin (20cbd892-ea2a-4715-bb7e-22fc8e244887)
- ✅ Columna precision_answers existe en DB (tipo: jsonb)
- ✅ database.types.ts tiene precision_answers en tipo leads
- ✅ PM2 reiniciado completamente (nueva instancia)
- ✅ Formulario debe funcionar sin error de schema cache