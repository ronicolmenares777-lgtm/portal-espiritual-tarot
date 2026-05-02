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
✅ COMPLETADO - Sistema de chat con multimedia funcionando:
1. ✅ Chat de usuario - polling funcionando
2. ✅ Chat de admin - polling funcionando
3. ✅ Tabla messages original funcionando
4. ✅ Multimedia implementado guardando base64 en columna text con prefijo [IMG]
5. ✅ Sistema de mensajes de texto e imágenes funcionando
6. ✅ Logs de debugging agregados para verificar is_from_maestro

ESTADO FINAL:
- Tabla messages original (sin nuevas columnas - evita problema de caché)
- Sistema de polling cada 2 segundos funcionando
- Envío y recepción de mensajes de texto
- Envío y recepción de imágenes (base64 con prefijo [IMG] en columna text)
- Detección automática de tipo de mensaje
- Mensajes se alinean correctamente según emisor

SOLUCIÓN TÉCNICA:
- Imágenes se guardan como: `[IMG]data:image/jpeg;base64,...`
- Se detectan por el prefijo [IMG]
- No requiere columnas nuevas (evita caché de PostgREST)
- Funciona con la tabla messages existente

## Checklist
- [x] Sistema de polling implementado
- [x] Chat de usuario funcionando con polling
- [x] Chat de admin funcionando con polling
- [x] Tabla messages funcionando
- [x] Multimedia implementado (base64 en text)
- [x] Botones de imagen restaurados
- [x] Logs de debugging agregados

## Acceptance
- Chat de admin carga sin pantalla negra ✅
- Mensajes de texto se envían y reciben correctamente ✅
- Imágenes se pueden enviar y visualizar ✅
- Mensajes se alinean según emisor (maestro/usuario) ✅
