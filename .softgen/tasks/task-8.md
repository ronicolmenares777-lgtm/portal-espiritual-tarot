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
COMPLETADO: Conexión Supabase restaurada con project ID correcto (klxepxdekgnfyazqsytk), tablas creadas, RLS configurado, polling de 3 segundos implementado.

## Checklist
- [x] Corregir project ID (klxepxdekgnfyazqsytk - con 's')
- [x] Actualizar .env.local con URL correcta
- [x] Actualizar client.ts con credenciales correctas
- [x] Crear tabla leads con políticas RLS públicas
- [x] Crear tabla messages con políticas RLS públicas
- [x] Crear tabla profiles con columna role
- [x] Crear tabla tarot_cards
- [x] Implementar polling de 3 segundos con flag anti-saturación
- [x] Verificar servidor sin errores
- [x] Generar tipos TypeScript automáticamente

## Acceptance
- ✅ Supabase conectado (klxepxdekgnfyazqsytk)
- ✅ Todas las tablas creadas y visibles en Table Editor
- ✅ RLS público configurado
- ✅ Chat funciona con polling de 3 segundos
- ✅ Sin errores de TypeScript
- ✅ Formulario crea leads en Supabase