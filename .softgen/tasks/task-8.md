---
title: Fix chat navigation and message service
status: done
priority: urgent
type: bug
tags:
  - chat
  - navigation
  - messages
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETADO: 
1. Corregido messageService para usar solo columnas existentes (lead_id, content, is_from_user, created_at)
2. Simplificado chat-usuario para usar localStorage en vez de query params
3. Guardado leadId en localStorage antes de navegar

## Checklist
- [x] Verificar esquema real de tabla messages
- [x] Eliminar referencias a columnas inexistentes (res_lat, etc)
- [x] Simplificar messageService
- [x] Usar localStorage para pasar leadId al chat
- [x] Reiniciar servidor (restart #124)

## Acceptance
- ✅ Chat se abre sin errores PGRST
- ✅ Mensajes se cargan correctamente
- ✅ Navegación funciona
- ✅ Servidor funcionando (restart #124)
