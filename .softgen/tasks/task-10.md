---
title: Fix Supabase Realtime strict mode collision
status: in_progress
priority: urgent
type: bug
tags:
  - chat
  - realtime
  - bugfix
  - multimedia
  - features
created_by: softgen
created_at: '2026-04-28T06:45:00Z'
position: 10
---

## Notes
EN PROGRESO - Políticas RLS verificadas y recreadas:
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - funcionando con logs de debugging
3. ✅ Bucket "chat-media" creado y público
4. ✅ Todas las políticas duplicadas eliminadas
5. ✅ 4 políticas creadas y verificadas (INSERT, SELECT, UPDATE, DELETE)
6. ⏳ Usuario debe probar envío de multimedia

POLÍTICAS FINALES:
- chat_media_public_insert (INSERT)
- chat_media_public_select (SELECT)
- chat_media_public_update (UPDATE)
- chat_media_public_delete (DELETE)

SIGUIENTE PASO: Usuario debe refrescar completamente el chat y probar upload.

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [x] Chat de admin funcionando con polling
- [x] Bucket de storage configurado correctamente
- [x] 4 políticas RLS verificadas y activas
- [ ] Envío de multimedia funcionando (usuario debe probar)

## Acceptance
- Chat de admin carga sin pantalla negra ✅
- Mensajes se envían y reciben en ambos chats ✅
- Imágenes y audio se pueden enviar sin error RLS (pendiente prueba del usuario)
