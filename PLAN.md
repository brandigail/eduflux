# EduFlux: Build Plan

- [x] 1. Scaffold the project (stack in `CLAUDE.md`), strict `tsconfig`, lint, `netlify.toml`, `.env.example`; first working commit
- [x] 2. Neon schema (users, courses, lessons, quizzes, progress, certificates) and migration
- [x] 3. `types/` interfaces and zod schemas
- [x] 4. Auth.js credentials login and roles
- [x] 5. Seed script: courses, lessons, quizzes, demo student
- [x] 6. Course catalog and course detail
- [x] 7. Video.js player with speed, chapters and bookmarks
- [x] 8. Progress saving and resume
- [x] 9. Quiz UI with server-side grading
- [x] 10. Course completion logic and certificate PDF
- [x] 11. Instructor dashboard: courses and completion chart
- [x] 12. Instructor material upload: documented as Phase 2 stub in the README (course creation and uploads not built)
- [x] 13. Responsive and accessibility pass (keyboard controls done; captions deferred, clips are silent: see `TODO-ASSETS.md`)
- [x] 14. Quality gate: `npm run build`, lint and `tsc --noEmit` all pass; no console errors; core flow tested at 375px and desktop (26 browser checks)
- [x] 15. README: pitch, features, stack, architecture notes, screenshot placeholders, run steps, 3-bullet "what to demo to a recruiter", Phase 2 list
- [ ] 16. Deploy to Netlify, set env vars (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`), verify the public URL end to end (deferred: deploys happen together after every project is built)
- [x] 17. Push to GitHub (live URL in `README.md` and root `LINKS.md` stays TBD until step 16)
