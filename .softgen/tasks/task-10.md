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
1. ✅ Realtime FUNCIONANDO en ambos chats
   - Canal diferente para admin y usuario
   - Detección de duplicados mejorada
   - Logs detallados para debugging
2. ✅ Mensajes se envían correctamente
3. ✅ Nombre real del usuario en AMBOS chats
   - Chat admin: muestra nombre del lead
   - Chat usuario: muestra nombre del lead (NO "Usuario")
4. ✅ Texto legible en burbujas blancas
5. ✅ Botones de audio e imagen visibles
6. ✅ Auto-scroll cuando llegan mensajes
7. ✅ Input se limpia inmediatamente al enviar

## Checklist
- [x] Realtime con canales separados (admin-chat-X / user-chat-X)
- [x] Mensajes se envían sin errores
- [x] Nombre real en burbujas blancas
- [x] Texto legible (text-gray-900 sobre bg-white)
- [x] Botones multimedia implementados
- [x] Auto-scroll funcionando
- [x] Sin errores de compilación

## Acceptance
- ✅ Mensajes llegan en tiempo real SIN refrescar
- ✅ Nombre real mostrado en ambos chats
- ✅ Texto legible en burbujas blancas
- ✅ Botones de imagen y audio visibles
- ✅ Auto-scroll cuando llegan nuevos mensajes
