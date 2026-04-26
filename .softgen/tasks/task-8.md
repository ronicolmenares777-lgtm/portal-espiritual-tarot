---
title: Fix chat message delivery with stable polling
status: in_progress
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
Chat messages not appearing. Supabase connection issues detected - API returning 500/544 errors. Investigating root cause.

## Checklist
- [x] Remove Realtime subscription (causing errors)
- [x] Implement 3-second polling with anti-saturation flag
- [x] Remove 500ms artificial delays
- [x] Update Supabase API keys via fetch_and_update_api_keys
- [ ] Fix Supabase connection (currently failing with 500/544)
- [ ] Verify RLS policies allow public access
- [ ] Test complete flow: form → chat → messages

## Acceptance
- Chat loads without "Conectando..." freeze
- Messages appear within 3 seconds
- No CORS/500 errors in console