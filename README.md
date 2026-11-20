# NEXORA — ESC Research CMS

NEXORA adalah research management workspace untuk **Departemen Research East Side Central (ESC)**.
Repositori ini berisi implementasi **Fase 1 / Sprint 1 (MVP)** dan **Fase 2 / Sprint 2 (Workflow)**:
submission riset, review Manager, revisi terstruktur, checklist Definition of Done, serta
manajemen ketersediaan Analyst.

![status](https://img.shields.io/badge/sprint-2%20workflow-4f46e5) ![next](https://img.shields.io/badge/Next.js-16.4.6-000000) ![prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748)

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

## Ringkasan Sprint 2

| Kebutuhan | Status | Implementasi |
| --- | --- | --- |
| **US-04** Workspace tugas Analyst | ✅ | Halaman `/my-tasks`: ringkasan status, filter status/deadline/peran, tabel tugas Primary & Backup |
| **US-05** Workflow status | ✅ | Stepper To Do → In Progress → In Review → Done + aksi transisi cepat sesuai peran |
| **US-06** Submission hasil riset | ✅ | Form submission dengan ringkasan eksekutif, dokumen utama, hingga 5 lampiran tautan, riwayat versi |
| **US-07** Review & approval Manager | ✅ | Panel review: setujui (`DONE`) atau minta revisi (`REVISION_NEEDED`) dengan catatan terstruktur per bagian |
| **US-08** Catatan revisi | ✅ | Catatan per section + severity (Low/Medium/High/Blocking), status Open/Resolved, resolve oleh Analyst/Manager |
| **US-09** Checklist Definition of Done | ✅ | Toggle item interaktif, progres, validasi item wajib sebelum submit & approval, apply template oleh Manager |
| **US-10** Ketersediaan Analyst | ✅ | Kontrol Available / Busy–Exam / Unavailable di dashboard, `/team`, dan peringatan saat menetapkan tugas |
| Indikator perhatian | ✅ | Banner & badge "menunggu review" untuk Manager dan "perlu revisi" untuk Analyst di dashboard/daftar riset |

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

## Deploy ke Neon + Vercel

Aplikasi siap di-deploy sebagai demo publik: **Neon** untuk PostgreSQL, **Vercel** untuk hosting Next.js.

### 1. Siapkan database Neon

1. Buat project di [neon.tech](https://neon.tech), pilih region terdekat (mis. **AWS ap-southeast-1 / Singapore**).
2. Buka menu **Connect**, salin dua connection string:
   - **Pooled** (host mengandung `-pooler`) → `DATABASE_URL`
   - **Direct** (matikan toggle *Pooled connection*) → `DIRECT_URL`

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

> Jika Prisma memberi error *"prepared statement already exists"*, tambahkan
> `&pgbouncer=true&connection_limit=1` pada `DATABASE_URL`.

### 2. Migrasi & seed ke Neon

Jalankan dari lokal dengan `.env` sementara diarahkan ke Neon:

```powershell
npm run db:deploy   # prisma migrate deploy — memasang index & constraint
npm run db:seed
```

Gunakan `db:deploy` (bukan `db:push`) agar partial unique index dan
`CHECK (deadline >= start_date)` ikut terpasang.

### 3. Environment variables di Vercel

Set untuk **Production** dan **Preview**:

| Key | Nilai |
| --- | --- |
| `DATABASE_URL` | pooled Neon + `sslmode=require` |
| `DIRECT_URL` | direct Neon + `sslmode=require` |
| `SESSION_PASSWORD` | random 32+ karakter |
| `NEXT_PUBLIC_APP_NAME` | `NEXORA` |
| `NEXORA_DEMO_MODE` | `true` |

`SESSION_PASSWORD` **wajib ada saat build** — aplikasi menolak start di production
tanpa secret ini. Generate dengan:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy

- Import repo GitHub di Vercel, root directory `/`, framework **Next.js**.
- Set **Node.js version 22.x** (lihat `engines` di `package.json`).
- `postinstall` menjalankan `prisma generate` otomatis saat build.
- Setelah mengubah environment variable, klik **Redeploy** agar berlaku.

### 5. Verifikasi pasca-deploy

- `GET /api/health` → `{"status":"ok"}`
- Login picker, dashboard Manager & Analyst, create/edit/arsip riset, dan badge deadline.
- Cek **Vercel Logs** bila ada error koneksi Prisma.

### Catatan demo publik

Quick role switcher tidak memakai password, sehingga siapa pun dapat masuk sebagai
Manager. Untuk demo:

- Gunakan database/branch Neon **khusus demo** berisi data fiktif.
- Reset berkala dengan `npm run db:seed`.
- Jangan menyimpan data asli atau PII.

---

## Peran & Hak Akses

| Aksi | Manager | Analyst |
| --- | --- | --- |
| Lihat dashboard & daftar riset | ✅ | ✅ (fokus "Tugas Saya") |
| Buat / edit / arsipkan topik | ✅ | ❌ (redirect + pesan) |
| Tetapkan analyst utama & backup | ✅ | ❌ |
| Lihat detail, timeline, referensi | ✅ | ✅ |
| Ubah status kerja (To Do ↔ In Progress, mulai revisi) | ✅ | ✅ hanya topik yang ditugaskan |
| Kirim submission hasil riset | ❌ | ✅ hanya Primary/Backup aktif & status In Progress / Revision Needed |
| Approve (`DONE`) atau minta revisi (`REVISION_NEEDED`) | ✅ | ❌ |
| Toggle checklist DOD | ✅ (termasuk saat review) | ✅ hanya saat To Do / In Progress / Revision Needed |
| Tandai catatan revisi selesai | ✅ | ✅ hanya topik yang ditugaskan |
| Ubah ketersediaan | ✅ (semua Analyst + diri sendiri) | ✅ hanya akun sendiri |
| Akses `/my-tasks` | ❌ (redirect `/team`) | ✅ |
| Akses `/team` | ✅ | ❌ (redirect `/dashboard?denied=1`) |

Guard diterapkan di dua lapis: `proxy.ts` (cek cookie) dan `requireUser` /
`requireManagerPage` / `requireAnalystPage` di setiap halaman serta di dalam
setiap Server Action.

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

### Submission hasil riset (US-06)
- Hanya **Analyst aktif (Primary/Backup)** pada topik terkait yang dapat mengirim
  submission.
- Submission hanya dibuka saat status `IN_PROGRESS` atau `REVISION_NEEDED`.
- Semua item DOD **wajib** harus dicentang sebelum submission dikirim.
- Versi submission bertambah otomatis (`v1`, `v2`, ...) dengan unique constraint
  `(topic_id, version)`.
- Lampiran berupa **tautan** (`LINK`); kolom file sudah disiapkan tetapi upload
  file belum diaktifkan pada Sprint 2.
- Submission sukses mengubah status topik menjadi `IN_REVIEW`.

### Review & approval (US-07)
- Hanya **Manager** yang dapat melakukan review.
- Syarat: topik berstatus `IN_REVIEW` dan submission berstatus `PENDING_REVIEW`.
- **Approve** menandai topik `DONE` + `completed_at`, serta memblokir approval
  bila masih ada item DOD wajib yang belum dicentang.
- **Minta revisi** mewajibkan minimal satu catatan terstruktur dan mengubah
  status topik menjadi `REVISION_NEEDED`.

### Catatan revisi (US-08)
- Setiap catatan memiliki `section` (Latar Belakang, Metodologi, Analisis &
  Temuan, Referensi & Sitasi, Struktur & Penulisan, Lainnya), `note`, dan
  `severity` (`LOW` / `MEDIUM` / `HIGH` / `BLOCKING`).
- Status catatan `OPEN` / `RESOLVED`; Analyst yang ditugaskan atau Manager dapat
  menandai selesai/membuka kembali.
- Semua catatan tersimpan sebagai riwayat dan terhubung ke submission + review.

### Checklist Definition of Done (US-09)
- Template default **Standar Riset ESC** memiliki 5 item wajib.
- Manager dapat menerapkan template ke topik yang belum punya checklist.
- Analyst hanya dapat mengubah checklist saat topik berada pada fase pengerjaan;
  checklist dikunci saat `IN_REVIEW` / `DONE` dan Manager memverifikasi saat review.
- Setiap toggle dicatat di audit log (`DOD_ITEM_CHECKED` / `DOD_ITEM_UNCHECKED`).

### Ketersediaan Analyst (US-10)
- Nilai: `AVAILABLE`, `BUSY_EXAM` (label **Busy / Exam**), `UNAVAILABLE`, plus
  catatan singkat maksimal 280 karakter.
- Analyst dapat memperbarui statusnya sendiri; Manager dapat memperbarui semua
  Analyst melalui `/team`.
- Dashboard dan form penugasan menampilkan peringatan bila Analyst yang dipilih
  sedang sibuk/tidak tersedia.

### Audit & konkurensi
- Perubahan status, submission, review, revisi, DOD, dan ketersediaan ditulis ke
  `audit_logs`.
- Transisi status memakai **optimistic version**; jika topik sudah diubah pengguna
  lain, aksi ditolak dan pengguna diminta memuat ulang.
- Perubahan status lewat form edit Manager tetap dimungkinkan sebagai override
  administratif dan dicatat sebagai `RESEARCH_STATUS_OVERRIDDEN`.

---

## Skema Database (Fase 1–3)

Skema lengkap sudah disiapkan sejak awal agar migrasi sprint berikutnya tidak
memecahkan data.

| Area | Tabel |
| --- | --- |
| Organisasi & akun | `departments`, `users` |
| Riset inti | `research_topics`, `research_topic_categories`, `categories`, `research_assignments`, `research_references` |
| Submission & review (Sprint 2) | `research_submissions`, `submission_attachments`, `research_reviews`, `revision_notes` |
| Definition of Done (Sprint 2) | `dod_templates`, `dod_template_items`, `dod_checklists`, `dod_checklist_items` |
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
│  │  ├─ (app)/dashboard/    # Dashboard metrik + perhatian workflow
│  │  ├─ (app)/my-tasks/     # Workspace tugas Analyst (Sprint 2)
│  │  ├─ (app)/team/         # Tim & ketersediaan Analyst (Sprint 2)
│  │  ├─ (app)/research/     # List, detail, create, edit
│  │  └─ api/health/         # Health check
│  ├─ components/
│  │  ├─ layout/             # Sidebar, user menu
│  │  ├─ research/           # Badge, form, filter, submission, review, DOD
│  │  ├─ shared/             # Page header, metric, pagination, flash
│  │  └─ ui/                 # Button, badge
│  ├─ lib/                   # Utils, constants, dates, workflow, session
│  └─ server/
│     ├─ actions/            # Server Actions (auth, riset, workflow, availability)
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
| `npm run db:migrate` | Terapkan migrasi Prisma (dev) |
| `npm run db:deploy` | Terapkan migrasi Prisma (production / Neon) |
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
- Dashboard Manager: metrik, beban kerja analyst, banner "menunggu review",
  kontrol ketersediaan, daftar perhatian.
- Dashboard Analyst: "Tugas Saya", banner "perlu revisi", tanpa panel beban kerja.
- Daftar riset: filter status/kategori/analyst/deadline + pagination + badge aksi.
- Detail riset: timeline, tim, referensi, riwayat status, DOD interaktif,
  submission & review, catatan revisi.
- Create/edit/arsip topik berjalan; validasi deadline & backup.
- Analyst diarahkan keluar dari `/research/new` dan `/research/:id/edit`.
- Analyst membuka `/my-tasks`, memfilter tugas, dan membuka detail.
- Analyst mengirim submission setelah semua DOD wajib dicentang.
- Manager menyetujui submission → topik `DONE`; atau meminta revisi dengan
  catatan terstruktur → topik `REVISION_NEEDED`.
- Analyst menandai catatan revisi selesai, melengkapi DOD, lalu mengirim ulang.
- Manager memperbarui ketersediaan Analyst melalui `/team`.
- `GET /api/health` → `{"status":"ok"}`.

---

## Batasan Sprint 2

Fitur berikut sengaja ditunda ke sprint selanjutnya:

- **Login tanpa password.** Quick role switcher dipakai untuk pengujian alur
  Manager vs Analyst. Autentikasi kredensial penuh dan manajemen user akan
  ditambahkan pada fase berikutnya.
- **Upload file belum aktif.** Submission mendukung tautan (`LINK`); kolom file
  (`storage_key`, `size_bytes`) sudah disiapkan tetapi belum dipakai UI.
- **Notifikasi (Fase 3)** sudah memiliki tabel di database, tetapi belum memiliki
  UI, email, atau real-time. Indikator saat ini berupa banner/badge di halaman.
- **Approval tidak memblokir catatan revisi lama yang masih open** — Manager hanya
  diberi peringatan; approval tetap dapat dilakukan bila DOD wajib sudah lengkap.
- **Checklist DOD belum dapat disunting labelnya** dari UI; template dikelola
  melalui database/seeder.
- **Belum ada komentar diskusi bebas** di luar catatan revisi terstruktur.

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
