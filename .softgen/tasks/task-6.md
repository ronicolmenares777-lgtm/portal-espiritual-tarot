---
title: "Fix mobile chat connection and hydration errors"
status: "todo"
priority: "urgent"
type: "bug"
tags: ["chat", "mobile", "hydration", "performance"]
created_by: "agent"
position: 6
---

## Notes
The mobile flow crashes and returns to the home screen because of a React Hydration Mismatch caused by `Math.random()` in `FloatingParticles.tsx`. This breaks the component tree and blocks the transition to the chat. Additionally, if the localStorage `currentLeadId` gets lost due to the crash, the chat cannot send messages and fails silently.

## Checklist
- [ ] Fix the background particles animation so it resolves the background crashing issues on mobile devices.
- [ ] Add an emergency connection recovery system to the chat so users can always send messages to the maestro, even if their initial form data was lost due to a connection drop.
- [ ] Ensure the final chat screen always loads smoothly without throwing errors or forcefully returning users to the start page.

## Acceptance
- The mobile site no longer shows red Hydration Mismatch errors in the console.
- Transitioning to the chat on mobile works reliably without returning to the start screen.
- Sending a message from the mobile chat always succeeds, even if the initial lead creation was interrupted.