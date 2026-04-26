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
COMPLETADO: Formulario simplificado para crear leads sin precision_answers inicial, auth.ts arreglado con mejor manejo de errores, servidor reiniciado.

## Checklist
- [x] Corregir project ID (klxepxdekgnfyazqsytk)
- [x] Crear todas las tablas correctas
- [x] Eliminar perfil duplicado
- [x] Verificar columna precision_answers existe
- [x] Simplificar LeadService.create (solo campos básicos)
- [x] Arreglar handleSubmit en index.tsx (sin precision_answers inicial)
- [x] Arreglar verifyAdminCredentials con mejor error handling
- [x] Usar maybeSingle() para evitar error si no hay perfil
- [x] Reiniciar servidor (restart #83)

## Acceptance
- ✅ Supabase conectado (klxepxdekgnfyazqsytk)
- ✅ Perfil admin existe (20cbd892-ea2a-4715-bb7e-22fc8e244887)
- ✅ Formulario crea leads sin error (solo campos básicos)
- ✅ Login muestra error claro si falla
- ✅ Login funciona si credenciales correctas
- ✅ Sin errores de compilación
- ✅ Servidor funcionando (restart #83)