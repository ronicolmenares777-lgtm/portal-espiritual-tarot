---
title: Fix chat message delivery with stable polling
status: done
priority: urgent
type: bug
tags:
  - chat
  - real-time
  - supabase
created_by: softgen
created_at: '2026-04-26T04:00:00Z'
position: 8
---

## Notes
COMPLETED: Fixed all Supabase connection issues, created database tables, configured RLS policies, and implemented stable 3-second polling for chat messages.

## Checklist
- [x] Update Supabase API keys (used fetch_and_update_api_keys)
- [x] Update client.ts with correct Supabase URL (https://lqyogtdozblvdkyhpxiq.supabase.co)
- [x] Create leads table with RLS policies for public access
- [x] Create messages table with RLS policies for public access
- [x] Create profiles table with RLS policies
- [x] Remove Realtime subscription (causing CORS errors)
- [x] Implement 3-second polling with anti-saturation flag
- [x] Remove 500ms artificial delays from handleSendMessage
- [x] Verify server runs without errors (restart #53 successful)
- [x] Test complete flow: form → database → chat

## Acceptance
- ✅ Supabase connected (PostgreSQL 17.6 healthy)
- ✅ All tables created with public RLS policies
- ✅ Chat loads without "Conectando..." freeze
- ✅ Messages appear within 3 seconds
- ✅ No CORS/500/522/544 errors in console
- ✅ Form submission creates lead in Supabase
- ✅ Login recovery finds lead by name + WhatsApp