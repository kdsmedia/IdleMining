import { storage } from './storageService';
import { fbAuth, db, phoneToEmail, derivePassword, isFirebaseAvailable } from './firebaseService';

export interface User {
  id: string;
  username: string;
  phone: string;
  avatar: string;
  level: number;
  xp: number;
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

// ID user / kode referral = 6 digit angka akhir nomor HP
export const getUserShortId = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.slice(-6).padStart(6, '0');
};

const cacheUser = (user: User) => storage.set('current_user', user);

export const authService = {
  register: async (username: string, phone: string, password: string, referralCode?: string): Promise<{ user: User; error?: string }> => {
    if (isFirebaseAvailable()) {
      try {
        // Cek username unik di Firestore
        const dup = await db().collection('users')
          .where('usernameLower', '==', username.toLowerCase()).limit(1).get();
        if (!dup.empty) return { user: null as any, error: 'Username sudah digunakan' };

        const cred = await fbAuth().createUserWithEmailAndPassword(phoneToEmail(phone), derivePassword(phone, password));
        let referredBy = '';
        if (referralCode) {
          const ref = await db().collection('users')
            .where('referralCode', '==', referralCode.trim()).limit(1).get();
          if (!ref.empty) referredBy = ref.docs[0].id;
        }

        const user: User = {
          id: cred.user.uid,
          username,
          phone,
          avatar: 'avatar' + (Math.floor(Math.random() * 6) + 1),
          level: 1,
          xp: 0,
          vipLevel: 0,
          referralCode: getUserShortId(phone),
          referredBy,
          createdAt: new Date().toISOString(),
        };
        await db().collection('users').doc(user.id).set({
          ...user,
          usernameLower: username.toLowerCase(),
        });
        await cacheUser(user);
        await storage.set('session_token', user.id + '_' + Date.now());
        return { user };
      } catch (e: any) {
        const code = e?.code || '';
        if (code === 'auth/email-already-in-use') return { user: null as any, error: 'Nomor HP sudah terdaftar' };
        if (code === 'auth/invalid-email') return { user: null as any, error: 'Nomor HP tidak valid' };
        if (code === 'auth/weak-password') return { user: null as any, error: 'Password terlalu lemah' };
        return { user: null as any, error: 'Registrasi gagal: ' + (e?.message || 'coba lagi') };
      }
    }
    return { user: null as any, error: 'Koneksi server tidak tersedia. Coba lagi.' };
  },

  login: async (phone: string, password: string): Promise<{ user: User; error?: string }> => {
    if (isFirebaseAvailable()) {
      try {
        const cred = await fbAuth().signInWithEmailAndPassword(phoneToEmail(phone), derivePassword(phone, password));
        const snap = await db().collection('users').doc(cred.user.uid).get();
        if (!snap.exists()) {
          await fbAuth().signOut();
          return { user: null as any, error: 'Data akun tidak ditemukan' };
        }
        const data = snap.data() as any;
        const { usernameLower, ...user } = data;
        await cacheUser(user as User);
        await storage.set('session_token', (user as User).id + '_' + Date.now());
        return { user: user as User };
      } catch (e: any) {
        const code = e?.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          return { user: null as any, error: 'Nomor HP tidak ditemukan atau password salah' };
        }
        if (code === 'auth/wrong-password') return { user: null as any, error: 'Password salah' };
        if (code === 'auth/network-request-failed') return { user: null as any, error: 'Tidak ada koneksi internet' };
        return { user: null as any, error: 'Login gagal: ' + (e?.message || 'coba lagi') };
      }
    }
    return { user: null as any, error: 'Koneksi server tidak tersedia. Coba lagi.' };
  },

  logout: async () => {
    try { if (isFirebaseAvailable()) await fbAuth().signOut(); } catch {}
    await storage.remove('current_user');
    await storage.remove('session_token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = await storage.get<string>('session_token');
    if (!token) return null;
    // Segarkan dari Firestore bila tersedia agar data selalu terkoneksi
    if (isFirebaseAvailable()) {
      try {
        const fbUser = fbAuth().currentUser;
        if (fbUser) {
          const snap = await db().collection('users').doc(fbUser.uid).get();
          if (snap.exists()) {
            const { usernameLower, ...user } = snap.data() as any;
            await cacheUser(user as User);
            return user as User;
          }
        }
      } catch {}
    }
    return storage.get<User>('current_user');
  },

  // Hitung jumlah referral valid (akun yang mendaftar via kode user ini)
  countReferrals: async (userId: string): Promise<number> => {
    if (!isFirebaseAvailable()) return 0;
    try {
      const snap = await db().collection('users').where('referredBy', '==', userId).get();
      return snap.size;
    } catch {
      return 0;
    }
  },

  // Berikan 250 koin bonus ke pengundang (atasan)
  grantReferrerBonus: async (referrerId: string): Promise<void> => {
    if (!isFirebaseAvailable()) return;
    try {
      const { gameService } = require('./gameService');
      const state = await gameService.getState(referrerId);
      const { newState } = gameService.claimReferralBonus(state);
      newState.missionProgress = {
        ...newState.missionProgress,
        invite_friends: Math.min((newState.referralCount || 0) + 1, 10),
      };
      await gameService.saveState(newState);
    } catch {}
  },

  updateUser: async (updates: Partial<User>): Promise<User | null> => {
    const current = await storage.get<User>('current_user');
    if (!current) return null;
    const updated = { ...current, ...updates };
    await cacheUser(updated);
    if (isFirebaseAvailable()) {
      try {
        await db().collection('users').doc(current.id).set({
          ...updated,
          usernameLower: updated.username.toLowerCase(),
        }, { merge: true });
      } catch {}
    }
    return updated;
  },
};
