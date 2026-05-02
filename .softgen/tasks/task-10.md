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
✅ COMPLETADO - Sistema de chat con diseño correcto:
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - polling funcionando
3. ✅ Multimedia con base64 funcionando (prefijo [IMG])
4. ✅ Burbujas de mensajes con diseño diferenciado:
   - Usuario: IZQUIERDA, fondo BLANCO, nombre del lead
   - Maestro: DERECHA, fondo DORADO, nombre + avatar del perfil
5. ✅ Perfil del maestro cargado y mostrado
6. ✅ Mensajes se guardan correctamente con is_from_maestro

ESTADO FINAL:
- Tabla messages funcionando
- Sistema de polling cada 2 segundos
- Mensajes de texto e imágenes funcionando
- Diseño de burbujas correcto con nombres y avatares
- Código con logs de debugging para verificar flujo

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando
- [x] Chat de admin funcionando
- [x] Multimedia implementado (base64)
- [x] Diseño de burbujas diferenciado
- [x] Nombres y avatares mostrados
- [x] is_from_maestro guardado correctamente

## Acceptance
- Chat de admin carga correctamente ✅
- Mensajes de texto e imágenes se envían ✅
- Usuario a la izquierda (blanco) con nombre ✅
- Maestro a la derecha (dorado) con nombre y avatar ✅
