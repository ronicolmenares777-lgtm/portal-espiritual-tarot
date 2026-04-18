---
title: Mensaje final y chat con maestro
status: todo
priority: medium
type: feature
tags: [chat, mensajería]
created_by: agent
created_at: 2026-04-18T03:10:28Z
position: 5
---

## Notes
Pantalla de advertencia con mensaje sobre la conexión detectada, CTA "CONSULTAR CON EL MAESTRO" dorado, luego transición a interfaz de chat tipo WhatsApp con mensajes del Maestro Espiritual (avatar, estado "EN LÍNEA", mensajes de bienvenida).

## Checklist
- [ ] Crear WarningScreen.tsx con mensaje de advertencia
- [ ] Caja de advertencia con fondo rojo oscuro
- [ ] Botón CTA dorado "CONSULTAR CON EL MAESTRO"
- [ ] Crear FinalLoading.tsx "Enviando al maestro"
- [ ] Crear MaestroChat.tsx con layout tipo WhatsApp
- [ ] Header con avatar + nombre + estado "EN LÍNEA"
- [ ] Mensajes del maestro con timestamps
- [ ] Input de mensaje en la parte inferior
- [ ] Ícono de micrófono y adjuntar