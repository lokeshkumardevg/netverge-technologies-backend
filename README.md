# NetVerge Backend (NestJS + MongoDB)

## Run
1. MongoDB chalu rakho (local ya Atlas)
2. `cp .env.example .env` aur values badlo
3. `npm install`
4. `npm run start:dev`  -> http://localhost:4000/api

Pehli baar run par: super admin (.env ke ADMIN_EMAIL / ADMIN_PASSWORD) aur design wala default content auto-create hota hai.

## API (prefix /api)
Public:
- GET  /services, /team, /partners          (active items, order wise)
- GET  /services/slug/:slug                  (single service for its detail page /services/<slug>)
- GET  /faqs?page=home, /testimonials?page=home   (page = home | about | services | leadership | contact)
- GET  /content/:key                        (home | about | services | leadership | contact | faq | testimonials | settings)
- POST /messages                            (contact form)
- POST /auth/login

Admin (Authorization: Bearer <token>):
- GET /auth/me, PUT /auth/password
- GET/POST/DELETE /auth/users               (super_admin only)
- GET  /services|team|partners|faqs|testimonials/admin/all    (inactive bhi)
- POST /services|team|partners|faqs|testimonials
- PUT/DELETE /services|team|partners|faqs|testimonials/:id
- PATCH /services|team|partners|faqs|testimonials/admin/reorder   body: { "ids": [...] }
- PUT  /content/:key                        (page content save)
- GET /messages, PATCH /messages/:id/read, DELETE /messages/:id
- POST /upload  (form-data field "file")    -> { path, url }
- GET  /dashboard/stats


## Company Profile 2026 data
On startup the seed applies details from the NetVerge Company Profile 2026 (tagline, hero/about text, stats,
8 services incl. "AI & Automation" and "Application Services", 18 strategic partners with logos, industries,
engagement models, founder title and phone). For an existing database this runs **once** and only replaces values
that are still the old starter defaults, so anything you edited in the admin panel is kept.
Partner logos live in the frontend at `public/partners/`.
