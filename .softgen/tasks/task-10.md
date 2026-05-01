---
title: Fix Supabase Realtime strict mode collision
status: done
priority: urgent
type: bug
tags:
  - chat
  - realtime
  - bugfix
  - multimedia
created_by: softgen
created_at: '2026-04-28T06:45:00Z'
position: 10
---

## Notes
✅ COMPLETADO AL 100%:
1. ✅ Realtime habilitado en tabla messages (ALTER PUBLICATION)
2. ✅ Mismo canal `chat-${id}` para admin y usuario
3. ✅ Bucket chat-media creado y verificado
4. ✅ Políticas RLS públicas para chat-media (INSERT, SELECT, UPDATE, DELETE)
5. ✅ Columnas media_type y media_url en messages
6. ✅ Campo text nullable para multimedia
7. ✅ Columna classification agregada a tabla leads
8. ✅ Tipos TypeScript regenerados
9. ✅ Nombre real del usuario en burbujas
10. ✅ Chat de usuario profesional

## Checklist
- [x] Realtime habilitado en tabla messages
- [x] Mismo canal para admin y usuario
- [x] Bucket chat-media creado
- [x] Políticas RLS configuradas
- [x] Columna classification agregada
- [x] Tipos TypeScript correctos
- [x] Sin errores de compilación

## Acceptance
- ✅ Mensajes llegan en tiempo real entre admin y usuario
- ✅ Imágenes se suben sin error "Bucket not found"
- ✅ Audio se graba y envía correctamente
- ✅ Nombre real mostrado en burbujas
- ✅ Sin errores de TypeScript
