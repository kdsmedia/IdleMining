# Catatan Rilis INDOMINE

## Versi 1.0.2 (Rilis Terbaru)

### Perbaikan Bug
- Memperbaiki import `AdBanner` yang hilang di halaman Mining (error kompilasi).
- Memperbaiki cabang misi kedaluwarsa yang mereferensikan handler tidak terdefinisi.
- Memperbaiki referensi konstanta penarikan yang sudah dihapus di halaman Wallet.
- Menghapus badge login demo dan memperbarui nama aplikasi menjadi INDOMINE di layar masuk.

### Fitur & Penyempurnaan
- Ikon koin seragam 🪙 di seluruh tampilan.
- Teks tombol dan menu diperpendek agar lebih rapi.
- Hasil mining diperlambat dengan algoritma SHA-256 dan tampilan hash rate (H/s).
- Mining wajib internet: otomatis berhenti saat offline atau aplikasi ditutup.
- Statistik mining tampil sebagai 3 kartu mini sebaris dengan label singkat.
- Misi tampil sebagai kartu mini 2 sebaris, masing-masing dengan tombol sesuai tugasnya.
- Paket upgrade kini tersedia 10 jenis.
- ID user/referral 6 digit dari nomor ponsel yang dipakai login/daftar.
- Tombol kontak admin tanpa menampilkan email; tombol WhatsApp hanya ikon + teks "WHATSAPP".
- Fitur achievement dihapus.
- Syarat penarikan: saldo minimal Rp1.000 dan 350 sesi bonus (rewarded) terselesaikan — progres tampil di halaman Wallet.
- Seluruh teks terkait promosi pihak ketiga dihilangkan dari UI.

### Rilis
- Ditandatangani dengan keystore ALTOMEDIA.jks (alias `kdsmedia`).
- Build APK (preview) dan AAB (production) via EAS.

## Versi 1.0.1

### Perbaikan Bug
- Memperbaiki error render pada grid Statistik di halaman Profil yang menyebabkan tampilan rusak.
- Memperbaiki error `react/no-unescaped-entities` pada halaman Not Found dan Profil.
- Memperbaiki duplikasi import `react-native` di halaman Misi.
- Membersihkan variabel dan import yang tidak digunakan (`GoldButton`, `FlatList`, `dailyReward`, `dailyDay`, `elapsed`, `formatRupiah`).
- Memperbaiki dependensi `useEffect` yang hilang (exhaustive-deps) pada MiningAnimation, SplashRedirect, dan Mining Screen.

### Rilis
- Build rilis APK ditandatangani dengan keystore ALTOMEDIA (alias `kdsmedia`).
- Build rilis AAB (Android App Bundle) untuk distribusi Google Play.
- Konfigurasi signing rilis baru di `android/app/build.gradle`.

## Versi 1.0.0

- Rilis awal aplikasi INDOMINE.
- Fitur mining koin, upgrade, misi harian, wallet, dan profil.
- Integrasi Firebase Auth, Firestore, dan AdMob.
