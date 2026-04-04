

# Revised Roamio Hiring Spec — React Native Migration + GPT-Assisted Interns

## Key Changes from Previous Version

1. **Capacitor → React Native**: Since your codebase is already React + TypeScript, React Native is the smoothest migration. Shared hooks, state logic, and even some UI patterns can carry over. Remove all Capacitor references.

2. **Lower the bar, lean on GPT**: Reframe requirements as "familiar with" instead of "must be proficient." Acknowledge AI-assisted development as a valid workflow.

---

## Revised Job Description

### 🚀 Roamio — Hiring Full Stack / Mobile Developer (Intern)

**📍 Remote | ⏳ Internship / Part-time**
**🕒 Duration: 2 Months | Commitment: 7–8 hrs/week**

---

### Role Overview

Help build and scale Roamio — a travel safety app for solo women travelers. You will work across the React web app and a new React Native mobile app. AI tools (ChatGPT, Copilot) are encouraged — what matters is shipping working features, not memorizing syntax.

---

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Mobile (NEW) | React Native + Expo |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| AI | Google Gemini API |

---

### Must-Have Skills

1. **React + TypeScript** — Comfortable building components, using hooks, and reading existing code. You don't need to be an expert — you need to be able to learn by reading our codebase + using GPT.

2. **React Native (basic)** — Have built at least one small RN app or completed a tutorial. We'll be migrating from a web-wrapped app to true native — you should know the basics of `View`, `Text`, `FlatList`, navigation, and Expo.

3. **SQL / Database basics** — Can write queries, understand tables and relationships. Supabase experience is a plus but not required — it's Postgres under the hood.

4. **Git** — Can branch, commit, push, and open PRs. Async communication via PR descriptions.

5. **Problem-solving with AI tools** — Can use ChatGPT / Copilot effectively to unblock yourself. Know when to trust AI output and when to verify.

---

### Nice-to-Have Skills

6. **Supabase** — Auth, RLS policies, Edge Functions, Realtime subscriptions.
7. **Expo modules** — Camera, location, notifications, offline storage.
8. **Payment integration** — Stripe or Razorpay (for freemium model).
9. **Offline-first patterns** — AsyncStorage, offline maps, background sync.
10. **UI/UX sense** — Can spot a bad layout and fix it without being told.

---

### What Was Removed vs. Previous JD

| Removed | Why |
|---------|-----|
| Capacitor | Migrating to React Native — no longer relevant |
| Deno runtime | Intern won't need to write edge functions from scratch initially; can learn as needed |
| "Intermediate-to-senior level" language | Too high a bar for interns; GPT bridges the gap |
| Flutter / Kotlin | Not applicable — chose React Native |

### What Was Added

| Added | Why |
|-------|-----|
| React Native + Expo | New mobile framework |
| "AI-assisted development" as explicit skill | Reflects reality of how interns work today |
| Lowered phrasing ("familiar with" vs "proficient") | Accessible to strong learners, not just experienced devs |

---

### First 2 Weeks Assignment (Trial Tasks)

1. Set up Expo project, connect to existing Supabase backend, render the home screen
2. Implement auth flow (login/signup) in React Native using Supabase Auth
3. Port one existing screen (e.g., Companion discovery) from React web to React Native

This tests: RN basics, Supabase integration, ability to read existing code and replicate it.

---

### Migration Strategy (for your planning)

```text
Phase 1 (Weeks 1-2): Expo setup + Auth + Home screen
Phase 2 (Weeks 3-4): Core screens (Explore, Companion, Journey)
Phase 3 (Weeks 5-6): Native features (push notifs, camera, GPS)
Phase 4 (Weeks 7-8): Offline support + polish + App Store prep
```

Shared code between web and mobile: hooks (`usePlans`, `useCompanions`, etc.), Supabase client config, types, and business logic. UI components will be rewritten in RN primitives.

