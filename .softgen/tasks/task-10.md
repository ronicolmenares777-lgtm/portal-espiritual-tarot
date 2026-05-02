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
EN PROGRESO - Problemas actuales:
1. ✅ Chat de usuario - polling funcionando
2. ❌ Chat de admin - pantalla negra (código reconstruido)
3. ❌ Envío de imágenes - bucket "chat-media" creado pero clientes no lo ven
4. ❌ Políticas de storage.buckets - RLS bloqueando visibilidad del bucket

SIGUIENTE PASO: Reescribir chat de admin desde cero sin errores.

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [ ] Chat de admin funcionando con polling
- [ ] Bucket de storage visible para clientes
- [ ] Envío de multimedia funcionando

## Acceptance
- Chat de admin carga sin pantalla negra
- Mensajes se envían y reciben en ambos chats
- Imágenes y audio se pueden enviar en ambos chats
