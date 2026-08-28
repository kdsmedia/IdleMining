# Panduan Unggah ke Google Play Console - INDOMINE 1.0.6

Dokumen ini memandu Anda mengunggah AAB dan materi store listing INDOMINE ke Google Play Console secara benar, memenuhi kebijakan program Google Play, dan siap rilis publik.

## 1. Prasyarat Akun

1. Daftarkan akun **Google Play Developer** (bayar sekali sekitar USD 25) di https://play.google.com/console.

2. Lengkapi profil pengembang: nama tampilan resmi, alamat, email publik, dan nomor telepon.

3. Verifikasi identitas dan selesaikan **Data safety declaration** sebelum AAB dapat dirilis.

4. Siapkan **Daftar aplikasi** baru dengan bahasa default **Bahasa Indonesia (Indonesia)**.

## 2. File yang Diunggah

Gunakan file **AAB** (Android App Bundle) dari rilis ini:

- Nama file: INDOMINE-1.0.6-universal.aab

- Ukuran: di bawah 200 MB (memenuhi batas Play Console.)

- versionCode 6 / versionName "1.0.6" (lebih tinggi dari versi sebelumnya agar update lancar.)

- Ditandatangani dengan keystore ALTOMEDIA.jks yang sama; senantiasa gunakan keystore yang sama untuk seluruh pembaruan berikutnya agar konsisten.

Jangan mengunggah APK debug atau APK ABI-spesifik ke Production. Gunakan AAB dari build **release** ini.

## 3. Store Listing (Konten Toko)

Isi konten toko di menu **Store listing** dengan materi dari ALTOMEDIA/STORE_LISTING.md:

- **Nama aplikasi:** INDOMINE - Tambang Koin

- **Deskripsi singkat (80 karakter):** Tambang koin, upgrade alat, klaim hadiah harian, dan raih reward seru!

- **Deskripsi lengkap:** salin dari STORE_LISTING.md (minimal 4.000 karakter direkomendasikan.)

- **Kategori:** Game - Simulasi; **Tag:** Idle, Clicker, Simulasi.

- **Konten dewasa:** Tidak ada.

## 4. Grafis Wajib

Unggah aset grafis berikut dari ALTOMEDIA/grafis/:

1. **Ikon aplikasi 512x512:** ic_launcher_512.png

2. **Grafik fitur 1.024x500:** feature_graphic_1024x500.png

3. **Screenshot telepon (minimal 2; disarankan 5-8):** screenshots/01_mining.png, 02_upgrade.png, 03_misi.png, 04_wallet.png, 05_profil.png (semuanya 1.080x1.920.)

4.(Opsional) **Grafik TV 1.280x720:** gunakan gambar cover dari aset yang sama bila tersedia.

## 5. Rating Konten dan Audiens

1. Buka **Content rating** dan isi kuesioner IARC: INDOMINE tidak mengandung kekerasan berdarah, judi, narkoba, konten seksual, atau bahasa kasar. Jawab "Tidak ada" untuk sebagian besar pertanyaan agar memperoleh rating 3+ atau 7+.

2. Di **Audience**, tentukan kelompok umur target dan nyatakan bahwa aplikasi tidak ditujukan kepada anak di bawah 13 tahun tanpa mekanisme persetujuan orang tua.

## 6. Data Safety dan Privasi

1. Isi **Data safety** sesuai PRIVACY_POLICY.md: data akun (opsional), data penggunaan, data perangkat, iklan; semuanya dikumpulkan dan dibagikan hanya jika benar-benar dipakai.

2. Tempel URL **Kebijakan Privasi** yang aktif (misal: GitHub Pages atau situs ALTOMEDIA) di menu **Privacy policy**. Jangan mengosongkannya - Play mewajibkan URL publik yang valid.

3.(Opsional namun direkomendasikan) Sediakan halaman **Terms of Service** dari TERMS_OF_SERVICE.md.

## 7. Rilis ke Production

1. Buka menu **Production - Track - Production** dan pilih "Create new release".

2. Unggah AAB, isi **What is new** dengan ringkasan dari ALTOMEDIA/RELEASE_NOTES_1.0.6.md (buat versi Bahasa Indonesia yang ramah pengguna.)

3. Klik **Review release**, periksa peringatan, lalu **Start rollout to Production**.

4.(Untuk keamanan lanjut) Aktifkan **Play App Signing** - Google akan mengelola kunci penandatanganan aplikasi dan memberi cadangan saat kunci utama hilang.

## 8. Checklist Akhir QA

- - [x] App Bundle (AAB) one file, < 200 MB

- - [x] versionCode 6 > versi sebelumnya(5)

- - [x] Signing keystore konsisten (ALTOMEDIA.jks)

- - [x] minSdk 24; targetSdk/compileSdk 36 (broad device coverage dan patuh kebijakan terbaru)

- - [x] Grafis ikon, feature graphic, >= 2 screenshot tersedia

- - [x] Privacy policy URL publik siap

- - [x] Rating konten IARC selesai

Konsultasikan dukung (support@altomedia.id) bila menemui kendala di Play Console.
