---
title: Fix chat navigation and restore messageService
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
1. messageService.ts restaurado con métodos getByLeadId, create, markAsRead
2. localStorage guarda leadId antes de navegar al chat
3. chat-usuario.tsx carga lead desde localStorage
4. Servidor reiniciado (restart #125)

## Checklist
- [x] Restaurar messageService.ts completo
- [x] Guardar leadId en localStorage
- [x] Cargar lead en chat-usuario
- [x] Reiniciar servidor

## Acceptance
- ✅ messageService restaurado
- ✅ Sin errores de compilación
- ✅ Servidor funcionando (restart #125)
- [ ] Usuario prueba flujo completo al chat
