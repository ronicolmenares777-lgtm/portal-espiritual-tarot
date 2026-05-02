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
EN PROGRESO - Políticas de storage creadas:
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - funcionando
3. ✅ Bucket "chat-media" creado y público
4. ✅ Políticas RLS de storage.objects creadas (INSERT, SELECT, UPDATE, DELETE)
5. ⏳ Probando envío de multimedia

SIGUIENTE PASO: Probar envío de imágenes en ambos chats.

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [x] Chat de admin funcionando con polling
- [x] Bucket de storage configurado correctamente
- [x] Políticas RLS de storage creadas
- [ ] Envío de multimedia funcionando

## Acceptance
- Chat de admin carga sin pantalla negra
- Mensajes se envían y reciben en ambos chats
- Imágenes y audio se pueden enviar en ambos chats
