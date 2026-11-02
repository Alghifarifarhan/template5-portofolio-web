# 🚀 Portfolio Template 5 — Dynamic Next.js & Firebase CMS

Website portofolio modern, dinamis, dan responsif yang dibangun menggunakan arsitektur **Next.js 15 (App Router)** dan ditenagai oleh **Google Firebase (Firestore & Authentication)**. Website ini dilengkapi dengan dashboard **Admin CMS interaktif** yang memungkinkan pengelolaan konten (teks, foto, karya/proyek, sertifikat, tautan media sosial, serta warna tema tampilan) secara langsung tanpa perlu menyunting baris kode.

---

> [!IMPORTANT]
> ### ℹ️ Keterangan Modifikasi & Atribusi Proyek
> Proyek ini merupakan **versi pengembangan dan modifikasi mendalam** dari template open-source **"Olivia - Portfolio Tailwind CSS Template"** yang awalnya dirancang oleh tim **[Pixelcave](https://pixelcave.com/)** dan didistribusikan secara resmi oleh **[ThemeWagon](https://themewagon.com/themes/olivia/)** di bawah lisensi **MIT**.
>
> **Transformasi yang telah dilakukan meliputi:**
> 1. Restrukturisasi menyeluruh dari template statis HTML/CSS menjadi web app dinamis menggunakan **Next.js 15 (App Router)**, **React 19**, dan **TypeScript**.
> 2. Penambahan **Interactive Admin CMS (`/admin`)** dengan autentikasi keamanan **Firebase Auth**.
> 3. Integrasi database cloud realtime dengan **Google Cloud Firestore**.
> 4. Fitur **Sinkronisasi Multi-Tab Real-time** (`BroadcastChannel` & snapshot database).
> 5. Mesin kustomisasi tema visual (*Live Theme & Color Customizer*) dengan variabel dinamis.
> 6. Pelacak analitik kunjungan mandiri (*Real-time Visitor & Download Tracker*).
> 7. Konversi otomatis tautan gambar publik Google Drive menjadi direct CDN link dengan auto-resizer.
> 
> *Kredit hak cipta asli dan atribusi desain tetap dipertahankan secara utuh pada footer website dan panel lisensi (`components/Footer.tsx`).*

---

## 🛠️ Framework & Teknologi yang Digunakan

Website ini dibangun menggunakan teknologi web modern:

| Teknologi / Framework | Versi | Peran & Penggunaan |
| :--- | :--- | :--- |
| **[Next.js](https://nextjs.org/)** | `15.3.3` | Framework React fullstack dengan arsitektur **App Router** (`app/`) dan static HTML export (`output: "export"`). |
| **[React](https://react.dev/)** | `19.0.0` | Library utama pembuatan antarmuka (UI), komponen modular, React Hooks, serta Context API. |
| **[TypeScript](https://www.typescriptlang.org/)** | `^5.0.0` | Bahasa pemrograman utama dengan sistem pengetikan ketat (*strict typing*) untuk menjamin keandalan kode. |
| **[Tailwind CSS](https://tailwindcss.com/)** | `^4.0.0` | Framework utility-first CSS modern untuk perancangan tata letak responsif, palet warna, dan mode gelap. |
| **[Google Firebase](https://firebase.google.com/)** | `^12.17.1` | **BaaS (Backend-as-a-Service)** yang menangani:<br>• **Cloud Firestore**: Database dokumen NoSQL realtime.<br>• **Firebase Authentication**: Manajemen login akun administrator.<br>• **Firebase Hosting**: Hosting statis berkecepatan tinggi dengan CDN global. |
| **[Formspree](https://formspree.io/)** | - | Integrasi pengiriman formulir email kontak pengunjung langsung ke inbox tanpa server backend. |
| **PostCSS** | `^8.4.0` | Pemroses CSS untuk Tailwind CSS v4. |

---

## ✨ Fitur-Fitur Utama

1. **Dashboard Admin Mandiri (`/admin`)**:
   - Kelola seluruh teks bio, sapaan hero, headline, dan kontak.
   - Manajemen daftar proyek portofolio (*CRUD: Create, Read, Update, Delete*).
   - Manajemen sertifikat keahlian lengkap dengan modal pratinjau detail.
   - Ganti link media sosial (GitHub, LinkedIn, Twitter/X, Instagram, Dribbble).
   - Ganti password akun admin langsung dari dashboard.

2. **Mesin Penyesuai Tampilan (Theme Customizer)**:
   - Pilihan preset tema instan (*Dark Obsidian, Pure Clean, Cyber Midnight, Emerald Deep Forest, Royal Purple, dll.*).
   - Ubah warna latar belakang (*Background*), warna tombol (*Button*), aksen hover, dan warna teks secara dinamis.

3. **Google Drive Image CDN Converter**:
   - Cukup tempel link berbagi file Google Drive biasa; sistem akan otomatis mengonversi dan memformatnya menjadi link gambar CDN cepat dengan rasio resolusi optimal.

4. **Analitik Kunjungan Real-Time**:
   - Memantau total kunjungan halaman (*Page Views*), pengunjung unik (*Unique Visitors*), serta jumlah klik tombol *Download CV/Resume*.

5. **Optimalisasi Kecepatan & SEO**:
   - Dikonfigurasi dengan `output: "export"` menghasilkan build statis murni yang sangat cepat dibuka dan ramah kuota Firebase Spark Tier gratis.

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan proyek ini, pastikan komputer Anda telah terpasang:
- **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan **Node.js 20 LTS**). Periksa dengan perintah:
  ```bash
  node -v
  ```
- **Package Manager**: `npm` (bawaan Node.js), `yarn`, atau `pnpm`.
- **Akun Google Firebase**: Untuk database Firestore dan Autentikasi.
- **Git**: Untuk mengelola repositori kode.

---

## 🚀 Panduan Memulai & Menjalankan (Step-by-Step)

### 1. Kloning Repositori
Clone repositori ini ke komputer lokal Anda:
```bash
git clone https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git
cd NAMA_REPO_ANDA
```

### 2. Install Dependensi
Jalankan perintah instalasi pustaka:
```bash
npm install
```

### 3. Konfigurasi Firebase SDK

Proyek ini membutuhkan kredensial Firebase untuk fungsi database dan autentikasi.

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru (misalnya: `my-portfolio`).
2. Di dalam proyek Firebase Anda:
   - **Aktifkan Firestore Database**: Masuk ke menu *Firestore Database* > *Create Database* > Pilih lokasi server terdekat > Pilih mode aturan (*Rules*).
   - **Aktifkan Firebase Authentication**: Masuk ke menu *Authentication* > *Get Started* > Tab *Sign-in method* > Aktifkan penyedia **Email/Password**.
   - **Buat Akun Admin**: Di tab *Users* pada Firebase Authentication, klik **Add user**, lalu masukkan email dan password admin Anda (misalnya: `admin@example.com` dan password Anda).
3. Salin konfigurasi Firebase Web App Anda dari menu **Project Settings (Ikon Gerigi)** > tab **General** > bagian **Your apps** > pilih ikon Web (`</>`).
4. Duplikasi file template `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
5. Buka file `.env.local` dan isi dengan kredensial Firebase SDK Anda:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proyek-anda.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=proyek-anda
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proyek-anda.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

> 💡 **Catatan Alternatif**: Anda juga dapat memasukkan konfigurasi langsung pada file [`lib/firebase.ts`](lib/firebase.ts).

### 4. Aturan Keamanan Firestore (Security Rules)

Pada Firebase Console > Firestore Database > tab **Rules**, terapkan aturan agar pengunjung publik dapat membaca data portofolio dan hanya akun terautentikasi yang dapat mengubah data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pengunjung dapat membaca data, admin terautentikasi dapat mengubah
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Jalankan Server Pengembangan (Local Development)

Jalankan perintah development server:
```bash
npm run dev
```

Buka peramban (browser) dan akses:
- **Halaman Utama Portofolio**: [http://localhost:3000](http://localhost:3000)
- **Halaman Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

Masuk ke panel admin menggunakan email dan password yang telah Anda daftarkan di Firebase Authentication pada Langkah 3.

---

## 📂 Struktur Direktori Proyek

```text
├── app/                        # Halaman & Rute Next.js (App Router)
│   ├── admin/                  # Dashboard CMS Pengelolaan Website (/admin)
│   ├── certificates/           # Halaman Khusus Seluruh Sertifikat (/certificates)
│   ├── projects/               # Halaman Khusus Seluruh Proyek (/projects)
│   ├── globals.css             # Konfigurasi gaya CSS global Tailwind
│   ├── layout.tsx              # Root layout & pembungkus SiteProvider
│   └── page.tsx                # Halaman utama portofolio (Home)
├── components/                 # Komponen UI modular
│   ├── CertificateModal.tsx    # Modal pop-up pratinjau sertifikat
│   ├── CertificatesSection.tsx # Bagian daftar sertifikat di beranda
│   ├── ContactSection.tsx      # Bagian form email Formspree & kontak
│   ├── FadeInCard.tsx          # Komponen animasi fade-in transisi
│   ├── Footer.tsx              # Footer website & atribusi lisensi
│   ├── Header.tsx              # Navigasi atas & tombol status
│   ├── HeroIntro.tsx           # Bagian sapaan bio hero profil
│   ├── Modal.tsx               # Komponen basis pop-up dialog
│   ├── ProjectModal.tsx        # Modal pop-up detail studi kasus proyek
│   ├── ProjectsSection.tsx     # Bagian daftar proyek unggulan di beranda
│   └── ResumeModal.tsx         # Modal pratinjau resume/CV
├── context/
│   └── SiteContext.tsx         # Manajemen status global (State Context) & sinkronisasi realtime
├── data/                       # Data awal fallback bawaan template
│   ├── certificates.ts         # Data contoh sertifikat
│   └── projects.ts             # Data contoh proyek
├── lib/
│   ├── firebase.ts             # Inisialisasi Firebase SDK (Auth & Firestore)
│   └── googleDrive.ts          # Utilitas pengonversi tautan gambar Google Drive ke CDN
├── public/                     # Aset statis (gambar, ikon, font)
├── .env.example                # Template kredensial konfigurasi Firebase SDK
├── firebase.json               # Konfigurasi deployment Firebase Hosting
├── next.config.ts              # Konfigurasi Next.js (Static export)
├── package.json                # Daftar dependensi & script proyek
├── README.md                   # Dokumentasi panduan proyek
└── tsconfig.json               # Konfigurasi TypeScript
```

---

## 📄 Lisensi & Kredit

- **Kredit Desain & Template Asli**: [Pixelcave](https://pixelcave.com/) & [ThemeWagon](https://themewagon.com/themes/olivia/).
- **Lisensi Template**: [MIT License](https://opensource.org/licenses/MIT).
- **Pengembangan & Modifikasi**: Ditingkatkan menjadi web app dinamis Next.js + Firebase CMS.
