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
4. ✅ Bucket chat-media creado con políticas RLS
5. ✅ Columnas media_type y media_url agregadas
6. ✅ Subida de imágenes funcional
7. ✅ Grabación de audio funcional
8. ✅ Chat de usuario rediseñado - más profesional
9. ✅ Header mejorado con avatar maestro y estado "En línea"
10. ✅ Scroll automático en ambos chats

## Checklist
- [x] Realtime con mismo canal para admin y usuario
- [x] Mensajes se reflejan instantáneamente
- [x] Nombre real en burbujas (no "Usuario")
- [x] Bucket chat-media creado
- [x] Políticas RLS configuradas
- [x] Subida de imágenes funcionando
- [x] Grabación de audio funcionando
- [x] Chat usuario rediseñado
- [x] Sin errores de compilación

## Acceptance
- ✅ Admin envía → Usuario recibe instantáneamente
- ✅ Usuario envía → Admin recibe instantáneamente
- ✅ Nombre real del usuario en burbujas
- ✅ Imágenes se suben y muestran
- ✅ Audio se graba, sube y reproduce
- ✅ Chat de usuario más profesional
