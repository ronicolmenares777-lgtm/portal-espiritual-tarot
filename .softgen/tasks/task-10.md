---
title: Fix Supabase Realtime strict mode collision
status: done
priority: urgent
type: bug
tags:
  - chat
  - realtime
  - bugfix
created_by: softgen
created_at: '2026-04-28T06:45:00Z'
position: 10
---

## Notes
✅ COMPLETADO AL 100%:
1. ✅ Realtime funcionando correctamente en ambos chats
2. ✅ Mensajes se envían correctamente (sin is_read)
3. ✅ Texto legible en burbujas blancas del usuario (text-gray-900)
4. ✅ Nombre real del usuario mostrado en chat de usuario
5. ✅ Nombre del lead mostrado en chat de admin
6. ✅ Carga de imagen de perfil arreglada
7. ✅ Bucket de avatars creado con políticas RLS
8. ✅ Validación de archivos (tipo y tamaño)
9. ✅ Header profesional en chat de admin
10. ✅ Burbujas doradas para admin, blancas para usuario

## Checklist
- [x] Mensajes se envían correctamente
- [x] Texto legible en burbujas
- [x] Nombre real en ambos chats
- [x] Carga de imagen funcionando
- [x] Políticas RLS creadas
- [x] Sin errores de compilación
- [x] ProfileService arreglado

## Acceptance
- ✅ Mensajes se envían sin errores
- ✅ Texto legible en burbujas del usuario
- ✅ Nombre real mostrado en ambos chats
- ✅ Carga de imagen de perfil funcional
- ✅ Sin errores de TypeScript
