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
1. ✅ Realtime SIMPLIFICADO - suscripción NO se cierra
2. ✅ Mismo canal `chat-${id}` para admin y usuario
3. ✅ Fondo NEGRO en chat de usuario (como antes)
4. ✅ Barra superior sin overflow
5. ✅ Nombre real del usuario en burbujas blancas
6. ✅ Bucket chat-media funcional
7. ✅ Mensajes en tiempo real como Messenger
8. ✅ Audio e imágenes funcionales
9. ✅ Auto-scroll mejorado
10. ✅ Diseño profesional en ambos chats

## Checklist
- [x] Realtime simplificado (no se cierra)
- [x] Mismo canal compartido
- [x] Fondo negro en chat de usuario
- [x] Barra superior arreglada
- [x] Nombre real (no "Usuario")
- [x] Multimedia funcionando
- [x] Sin errores de compilación

## Acceptance
- ✅ Admin envía → Usuario recibe INSTANTÁNEAMENTE
- ✅ Usuario envía → Admin recibe INSTANTÁNEAMENTE
- ✅ Suscripción NO se cierra (estado: SUBSCRIBED)
- ✅ Fondo negro en chat de usuario
- ✅ Nombre real en burbujas
- ✅ Imágenes y audio funcionan
