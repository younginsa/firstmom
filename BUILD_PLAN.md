# Firstmom — Build Plan

**Decisions locked in**
- **Stack:** Expo (React Native, TypeScript) + Next.js API on Vercel + Neon Postgres + AI Gateway (Claude)
- **Languages:** Korean + English from day 1 (i18n with `react-i18next` + `expo-localization`)
- **MVP definition (v1):** Chat-only thin slice. Share with real parents at the end of v1.
- **Pacing:** Pause after each milestone. Build → test → green-light → next.
- **Auth:** Anonymous device-ID auth for v1 (lowest friction, parents don't want signup before trying).

---

## Full scope at a glance

Your full vision (per mockups + brainstorm) is 8 screens with two retention loops:

| # | Screen | Loop | Phase |
|---|---|---|---|
| 1 | Splash | — | v1 |
| 2 | Onboarding | — | v1 |
| 3 | Home | Daily push lands here | v1 (basic) → v1.1 (daily card) |
| 4 | Daily detail | Daily push loop | **v1.1** |
| 5 | Chat | Engagement loop | **v1 (the hero)** |
| 6 | Firstmom Noticed | Insight surface | v2 |
| 7 | Bookmark | Save loop | v1.2 |
| 8 | Settings | Control | v1 (basic) → v1.2 (full) |

We build v1 (Chat thin slice), share with parents, then add v1.1 (daily push), then v1.2 (bookmark/library), then v2 (Noticed pattern detection).

---

## v1 — Chat-only thin slice (~2 weeks)

The question v1 has to answer: **"Does the Warm Friend voice feel warm in Korean to real parents?"**

If yes → invest in v1.1 push infra.
If no → fix prompt/model/voice before building anything else.

### Milestone 0 — Project scaffold (1–2 days)

**Goal:** Working Expo app on iOS sim, Android emu, and web. Empty splash screen. Backend API responds to a health check.

What Claude in VS Code will build:
1. Monorepo with Turborepo: `apps/mobile` (Expo) + `apps/api` (Next.js) + `packages/shared` (types, prompts)
2. Expo SDK 51+, TypeScript strict, expo-router for navigation
3. Next.js 15 app with `/api/health` returning `{ ok: true }`
4. ESLint + Prettier + a single `pnpm dev` command that runs both
5. `.env.example` with placeholders for: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `EXPO_PUBLIC_API_URL`

**Pause and test:**
- `pnpm dev` → Expo dev server starts, Next.js API starts
- Press `i` for iOS sim → splash renders
- Press `a` for Android emu → splash renders
- Press `w` for web → splash renders at `localhost:8081`
- `curl localhost:3000/api/health` → `{ ok: true }`

**Prompt to paste into VS Code Claude:**
> Read `BUILD_PLAN.md`. Execute Milestone 0 only. Stop after I confirm the test checklist passes. Do not start Milestone 1.

---

### Milestone 1 — Splash + Onboarding (2–3 days)

**Goal:** First-launch flow matching mockup screens 1 + 2. Child stage auto-derives from birthdate. Data persists locally.

What gets built:
1. Splash screen (warm gradient, logo, **tap-driven CTA "시작하기"** → onboarding if no child saved, else → home)
2. Onboarding screen: name input, birthdate picker, **~~gender selector~~ removed v1 — mockup-warm.html is the source of truth; gender wasn't in the design and stage derivation only needs birthdate. Can revisit in v1.2 if content needs it.**, concern chips ("요즘 가장 마음 쓰이는 것")
3. Stage derivation: `infant` (0–12mo), `baby` (12–24mo), `toddler` (24–48mo), `preschool` (48mo+)
4. Stage badge: "💛 지우는 현재 유아기예요" (also EN version)
5. AsyncStorage persistence: `{ childId, childName, birthdate, stage, concerns }`
6. i18n: Korean default, English strings ready in `i18n/en.json` but not user-toggleable yet (Settings doesn't exist in M1)

**Pause and test:**
- Fresh install → splash → onboarding
- Type a name, pick a birthdate → see correct stage badge
- Close app, reopen → splash → skips onboarding, goes to Home (blank for now)
- Toggle KR/EN → all strings translated
- Test on iOS sim, Android emu, web

---

### Milestone 2 — Chat screen with MOCKED AI (2 days)

**Goal:** Chat UI matches mockup screen 5. Sending a message shows a fake AI reply. Lets us nail the UI before plugging in the real LLM.

What gets built:
1. Chat screen with header (child name, online dot), scrollable message list, input bar
2. User/AI bubbles matching mockup (warm coral + cream-soft)
3. Streaming-style fake response: hardcoded reply types out token-by-token
4. Keyboard handling (KeyboardAvoidingView), auto-scroll on new message
5. Korean IME tested explicitly
6. Tab bar at bottom (Home / Chat / Library / Me — last two are stubs)

**Pause and test:**
- Send "지우가 어린이집 가기 싫대요" → see mock streaming reply
- Korean keyboard works without bugs
- Long messages wrap and scroll correctly
- Test on iPhone, Android phone, web (responsive)

---

### Milestone 3 — Real AI integration (3–4 days)

**Goal:** Real Claude responses streaming into the chat. Conversation persists. Warm Friend voice in Korean.

What gets built:
1. Neon Postgres setup. Schema: `users`, `children`, `threads`, `messages`
2. `/api/chat` route (Next.js): receives `{ threadId, text, lang }`, streams from AI SDK + AI Gateway
3. System prompt: Warm Friend persona in both KR and EN (we'll iterate here a lot)
4. Context assembly: system prompt + child stage + last 20 messages + new message
5. Mobile app calls `/api/chat` with EventSource/fetch streaming, renders tokens as they arrive
6. Messages saved to DB after streaming completes
7. Model: `claude-haiku-4-5` for cost (escalate to Sonnet if user msg matches medical/mental-health keywords)

**Pause and test:**
- Send 3–5 different Korean parenting questions
- Compare AI reply to the mockup's example reply — does it feel like the same friend?
- Voice check with 1–2 native Korean speakers (very important — this is the existential question)
- English mode: send 3 questions, voice should be analogous warmth
- Conversation continuity: ask follow-up, AI remembers context from earlier in thread

**This is the milestone where you'll iterate most.** Plan for 2–3 rounds of prompt tuning.

---

### Milestone 4 — Polish + share-ready (2–3 days)

**Goal:** Safe enough and stable enough to put in friends' hands.

What gets built:
1. Basic safety filter: medical/mental-health/abuse keywords → AI reply gets resource pointer appended ("이 부분은 전문가와 이야기하는 것도 좋아요: [hotline]")
2. Crash handling: network error UI, retry button
3. Rate limiting: 30 messages/day per device (cost guard)
4. Privacy basics: no PII in logs, encrypted DB connection
5. EAS Build: internal iOS TestFlight build, internal Android Play Console build
6. Send TestFlight invite to 3–5 Korean parent friends

**Pause and test:**
- 3–5 real parents use it for a week
- Collect: did voice feel warm? did anything feel off? did they come back?
- **Decision gate:** Go (build v1.1 push) / Iterate (tune prompts more) / Pivot (voice not landing)

---

## v1.1 — Daily push hook (~2 weeks, post-v1 go decision)

Adds Home daily card (screen 3) + Daily detail (screen 4) + push notifications.

### Milestone 5 — Content library + daily generation cron (4–5 days)

1. Schema: `content_items` (title, url, kind, stage, locale, topics, summary), `daily_messages` (userId, contentId, framing_text, scheduled_for, opened_at)
2. Hand-curate ~20 KR + 10 EN content items (YouTube videos, articles, books) — quality > quantity
3. Vercel Cron: hourly job, finds users whose local 8am-ish window matches, generates daily message
4. Generation prompt: input = child stage + chat summary + last-7-days topics, output = `{ kind, contentId, framing_text }`
5. Skip embeddings/pgvector for v1.1 — simple SQL filters work fine for 30 items

### Milestone 6 — Expo Push setup (2–3 days)

1. APNs key (Apple Developer account needed — start this paperwork on day 1 of v1.1!)
2. FCM credentials (Google Cloud Console)
3. Expo Push token storage in `users.push_token`
4. `/api/push/send` worker — picks up generated daily_messages, fires Expo Push
5. Deep link: tap notification → opens Daily detail screen with the generated content

### Milestone 7 — Daily detail screen + Home card (2–3 days)

1. Home: daily message hero card + "최근 대화" preview (mockup screen 3)
2. Daily detail screen (mockup screen 4): pill, title, video/article embed, warm framing, "이것 관련 대화" button (deep-links to chat with topic pre-loaded)
3. Open tracking: `daily_messages.opened_at` updates on view

**Pause and test:**
- Set push time to 5 min from now → wait → receive push
- Tap push → Daily detail opens with correct content
- "이것 관련 대화" → opens chat, system prompt knows the topic
- Test KR push body and EN push body

---

## v1.2 — Bookmark + Library (~1 week)

- Mockup screen 7 (Bookmark): saved daily messages
- Library tab: chronological list of past dailies, filter by kind
- Settings screen full version (mockup screen 8): push time, language, child profile edit, export chat, privacy

## v2 — Noticed (~2 weeks)

- Weekly batch job: scan chat history → detect recurring themes ("you've mentioned sleep 4x this week") → surface as a card
- Mockup screen 6

---

## Deployment & store strategy

### Hosting

| Layer | Service | Why |
|---|---|---|
| Backend API | **Vercel** | Next.js native, generous free tier, edge runtime, cron built in |
| Database | **Neon Postgres** | Branch-per-PR, serverless pricing, mature |
| AI | **AI Gateway** (Vercel) | Provider-agnostic, easy model swap (Haiku→Sonnet) |
| Push | **Expo Push Service** | Free, handles APNs+FCM in one call |
| Mobile builds | **EAS Build + Submit** | Cloud builds, automatic store submission |
| Web build | **Vercel** (Expo for Web export) | Same domain as API, easy |

### iOS App Store

- **Apple Developer Program: $99/year.** Enroll on day 1 of v1.1 — approval can take a week.
- **First TestFlight build (v1 Milestone 4):** internal testing only, no review needed, instant.
- **App Store review for v1.1:** plan ~3–7 days. Common rejection causes for AI parenting apps:
  - Medical advice disclaimer missing → **fix:** clear "not medical advice" copy at first launch + in chat empty state
  - Children's data handling → **fix:** age-gate (parent confirms they are 18+), no data collected about the child beyond what parent enters
  - AI safety → **fix:** show your safety filter in the app review notes
- **Privacy nutrition label:** Data Linked to You = email (if you add it later), Device ID. Data Used to Track You = none.

### Google Play Store

- **Play Console: $25 one-time.** Enroll same time as Apple.
- **Closed testing track for v1:** 20 testers, instant.
- **Open production for v1.1:** review ~1–3 days. Less strict than Apple but still:
  - Data safety form is mandatory and detailed
  - "Health" apps get extra scrutiny — call yourself "parenting support," not "parenting health"

### Korea-specific compliance

- **PIPA (개인정보보호법):** privacy policy must be in Korean. Cover: what you collect (child name, birthdate, chat), how long you keep it, who it's shared with (Anthropic for inference — call this out explicitly), user rights (delete, export).
- **No KISA registration needed** for under-1M-MAU apps.
- **Payment:** if you charge later, In-App Purchase is mandatory for app stores; Korean payment regulations require local PG (PortOne / Toss Payments) for web.

### Privacy policy / Terms

Generate v1 with a service like Termly, then have a Korean lawyer review before public launch. Budget ~₩500K for a basic review. Critical because of child + mental-health data.

---

## Folder structure (proposed)

```
firstmom/
├── apps/
│   ├── mobile/              # Expo app
│   │   ├── app/             # expo-router screens
│   │   │   ├── (onboarding)/
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx       # Home
│   │   │   │   ├── chat.tsx
│   │   │   │   ├── library.tsx
│   │   │   │   └── me.tsx
│   │   │   └── daily/[id].tsx
│   │   ├── components/
│   │   ├── lib/             # api client, storage, hooks
│   │   └── i18n/
│   │       ├── ko.json
│   │       └── en.json
│   └── api/                 # Next.js backend
│       ├── app/
│       │   └── api/
│       │       ├── chat/route.ts
│       │       ├── daily/
│       │       └── push/
│       ├── db/              # drizzle or prisma schema
│       └── cron/
├── packages/
│   └── shared/
│       ├── prompts/         # warm-friend.ko.ts, warm-friend.en.ts
│       ├── types/
│       └── safety/          # keyword filter
├── BUILD_PLAN.md            # this file
└── turbo.json
```

---

## How to use this plan with VS Code Claude

For each milestone, paste a prompt like this:

```
Read BUILD_PLAN.md. Execute Milestone N only.
Show me your task list before starting.
Stop after the "Pause and test" checklist is testable.
Do not start the next milestone until I say "green-light Milestone N+1".
```

When a milestone is done, your checklist:
1. Run the "Pause and test" items yourself
2. If something feels off, ask Claude to fix that specific thing — don't bundle into next milestone
3. When happy, commit: `git commit -m "Milestone N: <name>"`
4. Green-light the next milestone

---

## Risks I'd watch

1. **Voice quality (Milestone 3).** Biggest unknown. Block 2–3 days for prompt iteration. If after a week the voice still doesn't feel warm in Korean, escalate to Claude Sonnet (4x cost) before pivoting.
2. **Apple Developer enrollment delay.** Start day 1 of v1.1 — it can take a week.
3. **Korean keyboard quirks in RN.** Test early on real device, not just simulator (composition events behave differently).
4. **Push at the parent's exact local time** requires storing timezone + running cron every hour, not daily. Easy to get wrong.
5. **Cost.** A user chatting ~10 messages/day on Haiku = ~$0.30/month. 1000 users = $300/mo. Daily push generation = another ~$50/mo. Plan budgets accordingly.
