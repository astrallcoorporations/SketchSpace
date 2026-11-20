# Auth setup: Google OAuth + reliable verification emails

Supabase project: `sketchspace` (ref `pdaavprgjreslfrmnphb`). These are dashboard settings; they cannot be set from code.

## 1. URL configuration (fixes links landing in the wrong place)

Supabase → Authentication → URL Configuration

- **Site URL**: your production URL, e.g. `https://YOUR-DOMAIN`
- **Redirect URLs** (add all):
  - `https://YOUR-DOMAIN/**`
  - `https://*-YOUR-VERCEL-TEAM.vercel.app/**` (preview deploys)
  - `http://localhost:5173/**`

The app sends every email link and OAuth return to `/auth/callback`, which signs the person in and opens `/studio`.

## 2. Google OAuth

1. Google Cloud Console → APIs & Services → **OAuth consent screen**: External, app name SketchSpace, support email, authorized domain = your domain. Publish the app (Testing mode only lets listed test users in).
2. **Credentials → Create credentials → OAuth client ID → Web application.**
   - Authorized JavaScript origins: `https://YOUR-DOMAIN`, `http://localhost:5173`
   - Authorized redirect URI (exactly this one): `https://pdaavprgjreslfrmnphb.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret**.
4. Supabase → Authentication → Providers → **Google** → enable, paste both, save.
5. Test: `/login` → Google. A new profile row is created by `handle_new_user` (reads Google's `full_name` / `picture`).

## 3. Reliable verification emails (custom SMTP via Resend)

Supabase's built-in mailer is capped at a few emails per hour and is meant for testing, which is why verification mail feels random. Use Resend SMTP:

1. Resend → Domains → add and verify your sending domain (DNS records).
2. Resend → API Keys → create a key (sending access).
3. Supabase → Authentication → Emails → **SMTP Settings** → enable custom SMTP:
   - Host `smtp.resend.com`, port `465`
   - Username `resend`, password = the Resend API key
   - Sender email `no-reply@YOUR-DOMAIN`, sender name `SketchSpace`
4. Authentication → Rate Limits: raise "emails sent per hour" (e.g. 100).
5. Authentication → Emails → Templates: paste `supabase/templates/confirm-signup.html` and `reset-password.html`.
6. Authentication → Providers → Email: keep **Confirm email** on; set OTP expiry to 3600.

## 4. Hardening (from the Supabase advisor)

- Authentication → Providers → Email → enable **Leaked password protection**.
