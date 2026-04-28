---
title: Fix chat loading error and code cleanup
status: done
priority: urgent
type: bug
tags:
  - chat
  - bugfix
  - cleanup
created_by: softgen
created_at: '2026-04-28T06:00:00Z'
position: 9
---

## Notes
COMPLETADO: 
1. markAsRead con bypass temporal del caché
2. Imports y variables no utilizadas eliminadas
3. useEffect de carga simplificado radicalmente - eliminados reintentos complejos y lógica de emergencia
4. Polling estable cada 3 segundos + realtime como backup

## Checklist
- [x] Modificar `markAsRead` en `src/services/messageService.ts` para bypass temporal
- [x] Limpiar imports no utilizados en `src/components/ChatMaestro.tsx`
- [x] Eliminar variables de estado no utilizadas
- [x] Simplificar useEffect de carga (eliminar reintentos y leads de emergencia)
- [x] Reiniciar servidor (restart #127)

## Acceptance
- ✅ El chat abre inmediatamente sin bloqueos
- ✅ No hay errores PGRST en la consola relacionados con `read_at`
- ✅ Código del chat limpio y optimizado
- ✅ Lógica de carga simplificada
- ✅ Servidor funcionando (restart #127)