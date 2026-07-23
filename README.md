# 🎯 Tracker Prioritas OSIS

Tracker manajemen event & program kerja OSIS berbasis Zona Prioritas (Merah/Kuning/Hijau).

## Fitur
- ✅ Zona Prioritas: Merah (urgent), Kuning (penting), Hijau (santai)
- ✅ Milestone checklist — progress otomatis berdasarkan tahapan
- ✅ Header editable (nama sekolah, periode, ketua OSIS)
- ✅ Filter per zona + search nama/PIC
- ✅ Countdown deadline + alert merah jika telat
- ✅ Export CSV (Excel-compatible, UTF-8 BOM)
- ✅ Stat dashboard (total, on progress, selesai, rata-rata progress)

---

## 🚀 Cara Deploy ke Vercel (Gratis, 5 Menit)

### Langkah 1 — Push ke GitHub
1. Buka [github.com](https://github.com) → **New repository**
2. Nama repo: `tracker-osis` → Create
3. Di terminal / folder project ini:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/tracker-osis.git
git push -u origin main
```
> Ganti `USERNAME` dengan username GitHub kamu.

### Langkah 2 — Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) → Sign up / Login (pakai akun GitHub)
2. Klik **"Add New Project"**
3. Pilih repo `tracker-osis` → klik **Import**
4. Framework: pilih **Vite** (biasanya auto-detect)
5. Klik **Deploy** — tunggu ~1 menit
6. Dapat link: `https://tracker-osis-xxx.vercel.app` ✅

### Langkah 3 — Custom domain (opsional)
- Di dashboard Vercel → Settings → Domains
- Tambah domain sendiri atau pakai subdomain Vercel gratis

---

## Development Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`

## Build Production

```bash
npm run build
npm run preview
```
