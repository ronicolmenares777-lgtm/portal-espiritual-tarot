---
title: Fix chat message delivery with stable polling
status: done
priority: urgent
type: bug
tags:
  - chat
  - real-time
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
The user was experiencing issues where chat messages were not appearing on screen. The Supabase Realtime subscription was failing silently (likely due to CORS, network constraints, or proxy issues). The user requested to bring back a 2-second polling interval to guarantee message delivery without overwhelming the database. Additionally, an artificial 500ms delay was causing UX lag and needed to be removed.

## Checklist
- [x] In the user chat component (`src/components/ChatMaestro.tsx`), re-implement a stable 2-second interval polling mechanism (using `setInterval` and `MessageService.getByLeadId`) alongside the Realtime subscription.
- [x] In the user chat component, remove the fake 500ms delay (`await new Promise...`) from the `handleSendMessage` function so the input clears immediately.
- [x] In the admin chat page (`src/pages/Suafazon/chat/[id].tsx`), re-implement a stable 2-second interval polling mechanism.
- [x] In the admin chat page, remove the fake 500ms delay from the `handleSendMessage` function.

## Acceptance
- New messages appear in both the user and admin chats within 2 seconds of being sent, even if websockets are blocked.
- The message input clears instantly after clicking send, without a 500ms delay.