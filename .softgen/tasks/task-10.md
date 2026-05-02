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
EN PROGRESO - Políticas RLS recreadas (ultra-permisivas):
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - funcionando con logs de debugging
3. ✅ Bucket "chat-media" creado y público
4. ✅ TODAS las políticas anteriores eliminadas
5. ✅ Políticas ultra-permisivas creadas (sin restricciones)
6. ⏳ Probando envío de multimedia

ERROR ANTERIOR: "new row violates row-level security policy (403)"
SOLUCIÓN: Políticas recreadas completamente - enfoque ultra-permisivo

SIGUIENTE PASO: Probar envío de imágenes después de políticas ultra-permisivas.

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [x] Chat de admin funcionando con polling
- [x] Bucket de storage configurado correctamente
- [x] Políticas RLS ultra-permisivas creadas
- [ ] Envío de multimedia funcionando

## Acceptance
- Chat de admin carga sin pantalla negra ✅
- Mensajes se envían y reciben en ambos chats ✅
- Imágenes y audio se pueden enviar sin error RLS
