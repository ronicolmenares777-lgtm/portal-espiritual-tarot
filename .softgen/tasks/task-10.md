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
1. ✅ Realtime funcionando - mismo canal `chat-${id}` para admin y usuario
2. ✅ Mensajes se reflejan en AMBOS chats instantáneamente
3. ✅ Nombre real del usuario en burbujas (leadName prop)
4. ✅ Bucket chat-media creado con políticas RLS públicas
5. ✅ Columnas media_type y media_url agregadas
6. ✅ Campo text ahora es nullable para permitir multimedia sin texto
7. ✅ Subida de imágenes funcional (máx 5MB)
8. ✅ Grabación de audio funcional (formato webm)
9. ✅ Chat de usuario rediseñado - header profesional con avatar maestro
10. ✅ Scroll automático en ambos chats
11. ✅ Indicadores de carga durante uploads
12. ✅ Sin errores de TypeScript

## Checklist
- [x] Realtime con mismo canal para admin y usuario
- [x] Mensajes se reflejan instantáneamente
- [x] Nombre real en burbujas (no "Usuario")
- [x] Bucket chat-media creado
- [x] Políticas RLS públicas configuradas
- [x] Campo text nullable
- [x] Subida de imágenes funcionando
- [x] Grabación de audio funcionando
- [x] Chat usuario rediseñado
- [x] Sin errores de compilación

## Acceptance
- ✅ Admin envía mensaje → Usuario recibe INSTANTÁNEAMENTE
- ✅ Usuario envía mensaje → Admin recibe INSTANTÁNEAMENTE
- ✅ Nombre real del usuario en burbujas blancas
- ✅ Imágenes se suben, almacenan y muestran
- ✅ Audio se graba, sube y reproduce
- ✅ Chat de usuario profesional con header elegante
- ✅ Sin errores de TypeScript o compilación
