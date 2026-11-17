# NEXORA — ESC Research CMS

NEXORA adalah research management workspace untuk **Departemen Research East Side Central (ESC)**.
Repositori ini berisi implementasi **Fase 1 / Sprint 1 (MVP)** yang sudah dapat dijalankan, lengkap dengan
skema database yang disiapkan sampai Fase 3.

![status](https://img.shields.io/badge/sprint-1%20MVP-4f46e5) ![next](https://img.shields.io/badge/Next.js-16.4.6-000000) ![prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748)

---

## Ringkasan Sprint 1

| Kebutuhan | Status | Implementasi |
| --- | --- | --- |
| **US-01** Manajemen topik riset | ✅ | Form create/edit: judul, deskripsi, tujuan, relevansi isu, referensi awal, status, prioritas, kategori |
| **US-02** Penugasan anggota | ✅ | Analyst utama + backup analyst per topik, riwayat penugasan aktif/nonaktif |
| **US-03** Timeline & deadline | ✅ | Tanggal mulai + deadline, indikator **On Track / Approaching Deadline / Overdue** di daftar & detail |
| Dashboard metrik | ✅ | Total Riset, Sedang Berjalan, Mendekati Deadline, Selesai (+ overdue & completion rate) |
| Auth / role switcher | ✅ | Quick role switcher Manager ↔ Analyst (cookie session terenkripsi) |
| Validasi & error handling | ✅ | Zod di server, validasi klien, pesan error per field |
| Data realistis ESC | ✅ | 1 Manager, 4 Analyst, 6 kategori, 6 topik, referensi, riwayat status, template DOD |

---

## Stack

- **Next.js 16.4.6** (App Router, Server Actions, `proxy.ts`)
- **React 19.3** + **TypeScript** (strict)
- **Tailwind CSS 4.3.3** (Turbopack)
- **PostgreSQL 18** + **Prisma 6.19.3**
- **Zod 4** untuk validasi, **iron-session 9** untuk sesi, **date-fns** untuk tanggal, **lucide-react** untuk ikon

---

## Prasyarat

- **Node.js 22.13+** (dibutuhkan iron-session 9)
- **PostgreSQL 18** (lokal atau remote)

Repositori menyertakan skrip pengelola cluster PostgreSQL dev khusus Windows
(`scripts/dev-db.ps1`) yang memakai binary PostgreSQL 18 di
`C:\Program Files\PostgreSQL\18\bin`.

> Jika Anda memakai PostgreSQL lain, cukup sesuaikan `DATABASE_URL` di `.env`
> lalu jalankan migrasi + seed. Skrip `db:start`/`db:stop` hanya diperlukan bila
> ingin memakai cluster dev bawaan proyek.

---

## Cara Menjalankan

```powershell
# 1. Masuk ke folder proyek
cd nexora

# 2. Install dependensi
npm install

# 3. Siapkan environment
Copy-Item .env.example .env
#    Edit .env bila perlu (DATABASE_URL & SESSION_PASSWORD)

# 4. Nyalakan PostgreSQL dev (Windows, port 5434, auth trust)
npm run db:start

# 5. Terapkan skema database
npm run db:migrate

# 6. Isi data contoh ESC
npm run db:seed

# 7. Jalankan aplikasi
npm run dev
```

Buka **http://localhost:3000** — Anda akan diarahkan ke halaman pemilihan akun.

### Akun demo

Tidak ada password pada Sprint 1. Pilih akun di halaman login atau lewat menu
profil di kanan atas untuk berganti peran kapan saja.

| Nama | Email | Role | Catatan |
| --- | --- | --- | --- |
| Fauzan Aditya | `fauzan@eastsidecentral.org` | **Manager** | Head of Research |
| Nadia Prameswari | `nadia@eastsidecentral.org` | Analyst | Fokus ekonomi & pasar |
| Rizky Pratama | `rizky@eastsidecentral.org` | Analyst | Sedang ujian (Busy) |
| Salsabila Rahma | `salsabila@eastsidecentral.org` | Analyst | Sosial & teknologi |
| Bagas Nugroho | `bagas@eastsidecentral.org` | Analyst | Cuti (Unavailable) |

### Menggunakan PostgreSQL sendiri

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/nexora?schema=public"
SESSION_PASSWORD="string-acak-minimal-32-karakter"
```

Lalu:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

---

## Peran & Hak Akses

| Aksi | Manager | Analyst |
| --- | --- | --- |
| Lihat dashboard & daftar riset | ✅ | ✅ (fokus "Tugas Saya") |
| Buat / edit / arsipkan topik | ✅ | ❌ (redirect + pesan) |
| Tetapkan analyst utama & backup | ✅ | ❌ |
| Lihat detail, timeline, referensi | ✅ | ✅ |

Guard diterapkan di dua lapis: `proxy.ts` (cek cookie) dan `requireUser` /
`requireManagerPage` di setiap halaman serta di dalam setiap Server Action.

---

## Fitur & Aturan Bisnis

### Topik riset (US-01)
- Field: judul, deskripsi/latar belakang, tujuan, relevansi isu, status,
  prioritas, kategori, tanggal mulai, deadline, analyst, referensi awal.
- Status: `TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `REVISION_NEEDED`, `DONE`, `ARCHIVED`.
- Setiap perubahan status tercatat di `research_status_history`.
- Setiap create/update/archive tercatat di `audit_logs`.
- Form edit memakai **optimistic version** (`version` bertambah setiap update).

### Penugasan (US-02)
- Satu topik hanya boleh punya **satu PRIMARY aktif** (partial unique index).
- Satu user hanya boleh punya **satu assignment aktif per topik**.
- Saat penugasan berubah, assignment lama di-*soft close*
  (`is_active = false`, `unassigned_at` diisi) — riwayat tetap tersimpan.
- `backup_analyst_id` pada topik adalah pointer cepat yang disinkronkan dengan
  assignment role `BACKUP`.
- Dropdown backup otomatis mengecualikan analyst utama.

### Timeline & deadline (US-03)
- Disimpan sebagai `DATE`; tampilan & hitungan sisa hari memakai kalender lokal
  (Asia/Jakarta).
- Indikator:
  - **On Track** — lebih dari 3 hari.
  - **Approaching Deadline** — 0–3 hari.
  - **Overdue** — sudah melewati deadline dan status belum `DONE`.
  - **Selesai** — status `DONE`.
- Deadline **tidak boleh** lebih awal dari tanggal mulai, divalidasi di tiga
  lapis: klien, Zod, dan `CHECK` constraint PostgreSQL.

---

## Skema Database (Fase 1–3)

Skema lengkap sudah disiapkan sejak awal agar migrasi sprint berikutnya tidak
memecahkan data.

| Area | Tabel |
| --- | --- |
| Organisasi & akun | `departments`, `users` |
| Riset inti | `research_topics`, `research_topic_categories`, `categories`, `research_assignments`, `research_references` |
| Submission & review (Fase 2) | `research_submissions`, `submission_attachments`, `research_reviews`, `revision_notes` |
| Definition of Done (Fase 2) | `dod_templates`, `dod_template_items`, `dod_checklists`, `dod_checklist_items` |
| Audit & notifikasi (Fase 3) | `research_status_history`, `audit_logs`, `notifications` |

Constraint penting yang sudah aktif:
- `research_assignments_one_active_primary` — satu PRIMARY aktif per topik.
- `research_assignments_one_active_user` — satu assignment aktif per topik+user.
- `research_topics_deadline_after_start` — `deadline >= start_date`.

---

## Struktur Proyek

```
nexora/
├─ prisma/
│  ├─ schema.prisma          # Skema Fase 1–3
│  ├─ seed.ts                # Seeder data ESC
│  └─ migrations/            # Migrasi SQL (termasuk constraint bisnis)
├─ scripts/
│  └─ dev-db.ps1             # Lifecycle PostgreSQL dev (port 5434)
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/       # Quick role switcher
│  │  ├─ (app)/dashboard/    # Dashboard metrik
│  │  ├─ (app)/research/     # List, detail, create, edit
│  │  └─ api/health/         # Health check
│  ├─ components/
│  │  ├─ layout/             # Sidebar, user menu
│  │  ├─ research/           # Badge, avatar, form, filter
│  │  ├─ shared/             # Page header, metric, pagination, flash
│  │  └─ ui/                 # Button, badge
│  ├─ lib/                   # Utils, constants, dates, session
│  └─ server/
│     ├─ actions/            # Server Actions (auth & riset)
│     ├─ auth/               # Guard & current user
│     ├─ services/           # Query & transaksi domain
│     └─ validators/         # Skema Zod
├─ .env.example
└─ README.md
```

---

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan dev server |
| `npm run build` | Production build |
| `npm run start` | Jalankan hasil build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:start` | Nyalakan PostgreSQL dev (port 5434) |
| `npm run db:stop` | Matikan PostgreSQL dev |
| `npm run db:migrate` | Terapkan migrasi Prisma |
| `npm run db:seed` | Isi ulang data contoh ESC |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Buka Prisma Studio |

---

## Verifikasi Kualitas

Sudah dijalankan dan lulus:

```powershell
npm run typecheck   # 0 error
npm run build       # compiled successfully
```

Smoke test manual yang sudah diverifikasi:

- Redirect anonim ke `/login`; login picker tampil.
- Dashboard Manager: metrik, beban kerja analyst, daftar perhatian.
- Dashboard Analyst: hanya "Tugas Saya", tanpa panel beban kerja.
- Daftar riset: filter status/kategori/analyst/deadline + pagination.
- Detail riset: timeline, tim, referensi, riwayat status, DOD.
- Create/edit/arsip topik berjalan; validasi deadline & backup.
- Analyst diarahkan keluar dari `/research/new` dan `/research/:id/edit`.
- `GET /api/health` → `{"status":"ok"}`.

---

## Batasan Sprint 1

Fitur berikut sengaja ditunda ke sprint selanjutnya:

- **Login tanpa password.** Quick role switcher dipakai untuk pengujian alur
  Manager vs Analyst. Autentikasi kredensial penuh dan manajemen user akan
  ditambahkan pada fase berikutnya.
- **Belum ada upload file.** Referensi disimpan sebagai URL.
- **Submission & review (Fase 2)** serta **notifikasi (Fase 3)** sudah memiliki
  tabel di database, tetapi belum memiliki UI.
- **Checklist DOD bersifat read-only** pada UI Sprint 1 (data template & snapshot
  sudah tersedia di database).
- **Belum ada notifikasi email / real-time.**

---

## Catatan Teknis

- **Next.js 16** memakai `proxy.ts` (bukan `middleware.ts`) dan `params`/
  `searchParams` berupa `Promise`.
- **Cache Components dinonaktifkan** agar alur auth + CRUD sederhana dan selalu
  fresh; halaman yang membaca sesi otomatis dynamic.
- Sesi disimpan pada cookie `nexora_session` yang dienkripsi iron-session.
  `SESSION_PASSWORD` **wajib** diisi di production (aplikasi akan menolak start
  bila kosong).
- `NEXORA_DEMO_MODE=true` menandai lingkungan demo pada UI.
- Database dev bawaan proyek berjalan di **port 5434** dengan `trust` auth,
  terpisah dari service PostgreSQL pengguna di port lain.

### Troubleshooting

- **`password authentication failed`** — Anda kemungkinan terhubung ke cluster
  PostgreSQL lain. Pastikan `DATABASE_URL` menunjuk ke `localhost:5434` atau
  sesuaikan kredensial.
- **Port 5434 sudah dipakai** — jalankan `npm run db:stop`, atau ubah port di
  `scripts/dev-db.ps1` dan `DATABASE_URL`.
- **Prisma Client belum ada** — jalankan `npm run db:generate`.
- **Ingin reset data** — `npm run db:seed` bersifat idempotent dan akan
  menyegarkan topik contoh.

---

© 2026 East Side Central — Departemen Research.
