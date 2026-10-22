<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- AZ-900 quiz app: all data lives in the user's own connected Supabase project
  (tables `question_bank`, `quiz_sessions`, `questions`, `attempts` with RLS).
  Never create, alter, or delete tables/columns/views/policies; read and write
  them from the browser client only, using the publishable key and anonymous
  sign-in (no login screen, no server functions for this data). Why: the
  project is BYO Supabase and the schema is owned outside this app.
- Never call AI APIs or create edge functions for this app; every question
  comes from the `question_bank` table. Why: explicit user requirement.
- Keep the footer disclaimer "Unofficial AZ-900 prep tool. Not affiliated with
  or endorsed by Microsoft. All questions are original, AI-written practice
  questions." on every screen; no Microsoft/Azure logos or four-colour style.
  Why: legal/unofficial branding requirement.
