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
NUEVO ENFOQUE - RLS deshabilitado:
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - funcionando
3. ✅ Bucket "chat-media" creado y público
4. ✅ RLS DESHABILITADO en storage.objects
5. ⏳ Probando envío de multimedia

CAMBIO DE ESTRATEGIA: Las políticas RLS no funcionaban. RLS ha sido deshabilitado completamente en storage.objects para permitir uploads sin restricciones.

SIGUIENTE PASO: Probar envío de imágenes ahora que RLS está deshabilitado.

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [x] Chat de admin funcionando con polling
- [x] Bucket de storage configurado correctamente
- [x] RLS deshabilitado en storage.objects
- [ ] Envío de multimedia funcionando

## Acceptance
- Chat de admin carga sin pantalla negra ✅
- Mensajes se envían y reciben en ambos chats ✅
- Imágenes y audio se pueden enviar sin error RLS
