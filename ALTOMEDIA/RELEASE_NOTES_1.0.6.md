# Catatan Rilis - INDOMINE 1.0.6

**Tanggal rilis:** 28 Agustus 2026

**versionCode:** 6

**versionName:** 1.0.6



## Perbaikan dan Peningkatan Utama

1. **Memperbaiki crash di Android pada rilis 1.0.5.**

   - Menonaktifkan minifikasi kode (R8/ProGuard) yang menghapus kelas React Native, Expo, dan Firebase yang dipanggil secara reflektif - penyebab utama aplikasi langsung tertutup saat dibuka.

   - Menghapus pemecahan APK per-arsitektur (ABI splits) agar hanya dihasilkan **satu APK universal** yang berjalan di semua perangkat.

2. **Menurunkan ukuran dan menyederhanakan distribusi.**

   - Cukup satu berkas saja untuk diunduh pengguna; tanpa harus tahu-menahu soal arsitektur prosesor.

   - App Bundle (AAB) tetap berukuran wajar (kurang dari 200 MB) sehingga aman diunggah ke Play Console.

3. **Kesesuaian dengan persyaratan Google Play terbaru.**

   - minSdk 24 (Android 7.0): cakupan perangkat luas dengan tetap memenuhi tuntutan minimal library Expo.)

   - targetSdk dan compileSdk 36 (selaras dengan kebijakan target API tahunan Play Store.)

   - Penandatanganan rilis menggunakan keystore resmi ALTOMEDIA.jks agar siklus pembaruan berikutnya konsisten.

4. **Paket materi rilis lengkap.**

   - Dokumen Kebijakan Privasi, Ketentuan Layanan, dan Panduan Unggah Play Console.

   - Grafis toko: ikon 512x512, feature graphic 1.024x500, dan lima screenshot telepon 1.080x1.920.



## Cara Memasang

1. Unduh berkas APK universal dari aset rilis ini.

2. Izinkan pemasangan dari sumber tidak dikenal di pengaturan Android (bila perlu.)

3. Buka berkas dan ikuti petunjuk pemasangan.



## Catatan Teknis Singkat

- **Arsitetur didukung:** semua (universal APK; arm64-v8a plus armeabi-v7a plus x86 plus x86_64.)

- **Versi minimum Android:** 7.0 (API 24.)

- **Penandatanganan:** ALTOMEDIA.jks (alias kdsmedia; keystore sama untuk semua rilis mendatang.)

- **Dukungan:** support@altomedia.id



_Terima kasih telah memainkan INDOMINE. Selamat menambang!_
