# EduFlux: Build Plan

- [ ] 1. Scaffold the project (stack in `CLAUDE.md`), strict `tsconfig`, lint, `netlify.toml`, `.env.example`; first working commit
- [ ] 2. Neon schema (users, courses, lessons, quizzes, progress, certificates) and migration
- [ ] 3. `types/` interfaces and zod schemas
- [ ] 4. Auth.js credentials login and roles
- [ ] 5. Seed script: courses, lessons, quizzes, demo student
- [ ] 6. Course catalog and course detail
- [ ] 7. Video.js player with speed, chapters and bookmarks
- [ ] 8. Progress saving and resume
- [ ] 9. Quiz UI with server-side grading
- [ ] 10. Course completion logic and certificate PDF
- [ ] 11. Instructor dashboard: courses and completion chart
- [ ] 12. Instructor material upload (metadata + local/Netlify Blobs) or documented stub
- [ ] 13. Responsive and accessibility pass (captions, keyboard controls)
- [ ] 14. Quality gate: `npm run build`, lint and `tsc --noEmit` all pass; no console errors; core flow tested at 375px and desktop
- [ ] 15. README: pitch, features, stack, architecture notes, screenshot placeholders, run steps, 3-bullet "what to demo to a recruiter", Phase 2 list
- [ ] 16. Deploy to Netlify, set env vars, verify the public URL end to end
- [ ] 17. Push to GitHub and update the live URL in `README.md` and the root `LINKS.md`
