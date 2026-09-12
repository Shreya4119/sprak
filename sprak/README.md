# Sprak

German A1 for people who have just moved country.

Mic-first: the learner speaks from the first minute. A teacher, **Klara**, explains everything, in German, with a German accent when she speaks English. No account, no forms, nothing leaves the device.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173, and http://<your-ip>:5173 from your phone
npm run build     # production build to dist/
npm run single    # one-file version to sprak.html
npm test          # unit tests, then all 12 flow suites
```

Android, once Capacitor is added:

```bash
npm run android:open
```

**Current status of Phase 0:** repo, Vite, tests and CI are done. Capacitor or Bubblewrap is Phase 2. See `docs/MIGRATION.md`.

## Where to start reading

| | |
|---|---|
| `CLAUDE.md` | project rules, commands, the things that break the app |
| `docs/ARCHITECTURE.md` | how state, screens and the session runner fit together |
| `docs/CONTENT_GUIDE.md` | how to author a unit |
| `docs/DESIGN_SYSTEM.md` | tokens, themes, accessibility |
| `docs/MIGRATION.md` | the Android plan |
| `docs/KNOWN_ISSUES.md` | open defects, ranked |
| `docs/DECISIONS.md` | why things are the way they are |
| `docs/TESTING.md` | what to test and how |

## Status

Stage 0 complete: six units, 105 words. Stage 1 partially built. Studio (the admin dashboard for editing the syllabus) exists as a design mockup only.
