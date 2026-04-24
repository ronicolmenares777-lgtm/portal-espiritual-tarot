---
title: "Optimizar cursor, inputs y corregir error de realtime"
status: "done"
priority: "urgent"
type: "bug"
tags: ["cursor", "performance", "realtime", "chat"]
created_by: "agent"
created_at: "2026-04-24"
position: 7
---

## Notes
Tres problemas críticos afectando la experiencia de usuario:

1. **Cursor personalizado lento:** El círculo externo se mueve detrás del punto central debido a una transición de 300ms, creando un efecto de "retraso" visual poco profesional. ✅ CORREGIDO

2. **Input lag en formulario:** Al escribir en los campos de nombre y WhatsApp, las letras aparecen con retraso. Esto es causado por validaciones/operaciones en el onChange que bloquean el renderizado. ✅ CORREGIDO

3. **Error crítico de realtime:** Al abrir el chat, aparece el error `cannot add postgres_changes callbacks after subscribe()`. Esto sucede porque en `messageService.ts` el orden está mal - se debe crear el canal, agregar los listeners con `.on()`, y DESPUÉS llamar a `.subscribe()`. El orden actual rompe la suscripción y bloquea el chat tanto en PC como en móvil. ✅ CORREGIDO

4. **Tiempo de transición corto:** El cuestionario aparece muy rápido después de la revelación de carta (3 segundos es demasiado rápido). ✅ AUMENTADO A 5 SEGUNDOS

5. **Tipos de TypeScript inconsistentes:** Los servicios tienen tipos de retorno inconsistentes causando errores de compilación. ✅ CORREGIDO

## Checklist
- [x] Optimizar el cursor personalizado para que ambos elementos (punto y círculo) se muevan de forma sincronizada sin lag visual
- [x] Eliminar procesamiento pesado en los onChange de los inputs del formulario para escritura instantánea
- [x] Corregir el orden de la suscripción en messageService.ts: `.channel()` → `.on()` → `.subscribe()`
- [x] Aumentar el tiempo de transición en CardReveal.tsx de 3 a 5 segundos
- [x] Corregir tipos de TypeScript en ChatMaestro.tsx, chat/[id].tsx y chat-usuario.tsx
- [x] Verificar que el chat funciona correctamente tanto en PC como en móvil

## Acceptance
- ✅ El cursor se mueve de forma fluida y sincronizada en PC
- ✅ Los inputs del formulario responden instantáneamente al escribir
- ✅ El chat se abre sin errores en PC y móvil
- ✅ Los mensajes se envían y reciben correctamente en tiempo real
- ✅ La revelación de carta dura 5 segundos antes de mostrar preguntas