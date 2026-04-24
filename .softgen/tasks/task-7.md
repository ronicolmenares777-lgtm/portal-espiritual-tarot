---
title: "Optimizar cursor, inputs y corregir error de realtime"
status: "todo"
priority: "urgent"
type: "bug"
tags: ["cursor", "performance", "realtime", "chat"]
created_by: "agent"
position: 7
---

## Notes
Tres problemas críticos afectando la experiencia de usuario:

1. **Cursor personalizado lento:** El círculo externo se mueve detrás del punto central debido a una transición de 300ms, creando un efecto de "retraso" visual poco profesional.

2. **Input lag en formulario:** Al escribir en los campos de nombre y WhatsApp, las letras aparecen con retraso. Esto es causado por validaciones/operaciones en el onChange que bloquean el renderizado.

3. **Error crítico de realtime:** Al abrir el chat, aparece el error `cannot add postgres_changes callbacks after subscribe()`. Esto sucede porque en `messageService.ts` el orden está mal - se debe crear el canal, agregar los listeners con `.on()`, y DESPUÉS llamar a `.subscribe()`. El orden actual rompe la suscripción y bloquea el chat tanto en PC como en móvil.

## Checklist
- [ ] Optimizar el cursor personalizado para que ambos elementos (punto y círculo) se muevan de forma sincronizada y fluida sin lag visual
- [ ] Eliminar cualquier procesamiento pesado en los onChange de los inputs del formulario para que la escritura sea instantánea
- [ ] Corregir el orden de la suscripción en messageService.ts para que los mensajes en tiempo real funcionen sin errores
- [ ] Verificar que el chat funciona correctamente tanto en PC como en móvil después de completar el formulario

## Acceptance
- El cursor personalizado se mueve suavemente sin que el círculo vaya detrás del punto
- Escribir en los campos de nombre y WhatsApp se siente completamente fluido e instantáneo
- El chat se abre sin errores de realtime tanto en PC como en móvil y permite enviar mensajes correctamente