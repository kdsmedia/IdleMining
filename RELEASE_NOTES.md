# Catatan Rilis INDOMINE

## Versi 1.0.1 (Rilis Terbaru)

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
