# 📖 Panduan Praktis Pengelolaan Website Portofolio (README2.md)

Dokumen ini berisi panduan ringkas dan mudah dipahami untuk mengelola isi website portofolio Anda melalui Halaman Admin, serta penjelasan mengenai kapasitas batasan kunjungan gratis website.

---

## 🔑 1. Cara Masuk ke Halaman Admin

1. Buka browser dan ketik alamat admin website Anda:
   - **Website Online**: `https://[PROJECT_ID].web.app/admin` (atau domain website Anda)
   - **Komputer Lokal**: `http://localhost:3000/admin`
2. Masukkan Email & Password Admin yang telah Anda daftarkan di Firebase Console.
3. **Tips Keamanan**: Anda dapat menekan **tombol ikon mata (👁️)** di sebelah kanan kolom password untuk menampilkan atau memburamkan password saat diketik.

---

## 📝 2. Cara Mengubah & Mengisi Isi Website

Dashboard Admin memiliki beberapa tab menu dengan fungsi masing-masing:

### A. Navigation & Text (Kelola Tulisan & Pesan)

- **Fungsi**: Mengubah sapaan utama (Judul Hero), teks bio singkat, nama tombol CV, teks bagian Kontak, dan tulisan Footer di bawah website.
- **Formspree Link (Form Email Kontak)**:
  - Masukkan URL Formspree Anda (contoh: `https://formspree.io/f/YOUR_FORM_ID`) pada kolom Formspree.
  - Ketika pengunjung mengisi formulir "Get in Touch", pesan akan langsung terkirim otomatis ke inbox email Anda.
- Jangan lupa klik tombol **Save Text Settings**.

### B. Hero Photo & Drive (Foto Profil Utama)

- **Fungsi**: Mengubah foto profil utama di halaman depan.
- **Cara Input**: Salin link foto dari **Google Drive** atau link gambar publik lainnya, lalu paste ke kolom _Hero Photo URL_.
  > 💡 **Penting pada Google Drive**: Pastikan file foto di Google Drive sudah diatur hak aksesnya menjadi _"Siapa saja yang memiliki link / Anyone with the link can view"_.
- **📐 Standar Resolusi & Auto-Crop Otomatis**:
  - Foto akan otomatis di-crop dan di-scale secara simetris ke rasio persegi **800 × 800 pixel**.
  - Apapun ukuran foto awal Anda (portrait/landscape/besar/kecil), sistem akan memotong bagian tengah foto secara otomatis agar pas dan rapi tanpa terdistorsi.

### C. Theme & Colors (Warna & Mode Tampilan)

- **Fungsi**: Mengubah tema warna utama (_Primary Color_) dan mode tampilan (_Dark Mode_ / _Light Mode_).
- **Catatan Warna Tombol**: Tombol utama didesain default berwarna putih polos profesional agar saat website di-refresh tidak menampilkan kedipan warna ungu.

### D. Social Links (Link Media Sosial)

- **Fungsi**: Menambahkan atau mengubah link akun media sosial Anda (Instagram, LinkedIn, GitHub, Email, Dribbble, dll).

### E. Projects Manager (Kelola Hasil Karya / Proyek)

- **Fungsi**: Menambah proyek baru, mengedit proyek lama, atau menghapus proyek.
- **Isi Lengkap Proyek**:
  - **Judul Proyek, Subtitle/Tag, & Kategori**
  - **Nama Klien / Client**: Nama klien atau nama proyek (contoh: `Creative Studio X`).
  - **Tanggal / Timeline**: Waktu pengerjaan (contoh: `August 2026`).
  - **Deskripsi Proyek**: Ringkasan cerita & tujuan proyek.
  - **Tools & Software**: Software yang digunakan, dipisahkan dengan koma (contoh: `Adobe Illustrator, Photoshop, Figma`).
  - **Key Deliverables (Poin Hasil Utama)**: Hasil akhir proyek per baris (contoh: `Over 40 high-resolution vector assets`, `Tailored color palettes`, `Flexible SVG and PNG exports`).
- **📐 Standar Resolusi Gambar Proyek**: Otomatis di-crop simetris ke **800 × 800 pixel** (Rasio 1:1 Square).

### F. Certificates Manager (Kelola Sertifikat Keahlian)

- **Fungsi**: Menampilkan daftar sertifikat, lisensi, penerbit (_issuer_), ID Kredensial, dan tanggal penerbitan.

### G. 📊 Statistik Website (Laporan Kunjungan Real-Time)

- **Fungsi**: Memantau statistik performa website secara live:
  - **Total Kunjungan (Page Views)**: Jumlah berapa kali halaman website dibuka.
  - **Pengunjung Unik**: Jumlah pengunjung unik berdasarkan perangkat.
  - **Download Resume/CV**: Jumlah pengunjung yang menekan tombol _My Resume_.
  - **Asset & Item Aktif**: Total proyek dan sertifikat terpasang.

---

## 📊 3. Penjelasan Batasan Kunjungan & Kuota (Firebase Spark Tier)

Website Anda ditampung di layanan **Google Firebase (Spark Plan)**. Berikut adalah penjelasan kapasitasnya secara sederhana:

| Jenis Kuota                            | Batas Per Bulan / Hari       | Setara Dengan (Kapasitas Kunjungan)                     |
| :------------------------------------- | :--------------------------- | :------------------------------------------------------ |
| **Kunjungan Harian (Firestore Reads)** | 50.000 Pembacaan Data / Hari | **± 10.000 s/d 12.000 kali halaman dibuka per hari**    |
| **Transfer Data (Egress Bandwidth)**   | 10 Gigabyte (GB) / Bulan     | **± 8.000 s/d 10.000 total pengunjung penuh per bulan** |
| **Penyimpanan File (Storage)**         | 1 Gigabyte (GB)              | **Lebih dari 500+ proyek & foto portofolio**            |

### ❓ Pertanyaan Umum seputar Batasan:

- **Apakah kuota ini cukup?**  
  Sangat lebih dari cukup untuk portofolio pribadi, pencari kerja, maupun profesional.
- **Apa yang terjadi jika kuota harian habis?**  
  Kuota harian akan di-reset (diperbarui otomatis) setiap pukul 12 malam WIB.

---
