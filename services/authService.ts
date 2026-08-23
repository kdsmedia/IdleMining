import { storage } from './storageService';

export interface User {
  id: string;
  username: string;
  phone: string;
  avatar: string;
  level: number;
  xp: number;
  vipLevel: number;
  referralCode: string;
  createdAt: string;
}

const generateId = () => 'USR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const authService = {
  register: async (username: string, phone: string, password: string, referralCode?: string): Promise<{ user: User; error?: string }> => {
    const existing = await storage.get<User[]>('users');
    const users = existing || [];

    if (users.find(u => u.phone === phone)) {
      return { user: null as any, error: 'Nomor HP sudah terdaftar' };
    }
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { user: null as any, error: 'Username sudah digunakan' };
    }

    const user: User = {
      id: generateId(),
      username,
      phone,
      avatar: `avatar${Math.floor(Math.random() * 6) + 1}`,
      level: 1,
      xp: 0,
      vipLevel: 0,
      referralCode: generateReferralCode(),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await storage.set('users', users);
    await storage.set(`pwd_${phone}`, password);
    await storage.set('current_user', user);
    await storage.set('session_token', user.id + '_' + Date.now());

    return { user };
  },

  login: async (phone: string, password: string): Promise<{ user: User; error?: string }> => {
    const users = await storage.get<User[]>('users') || [];
    const user = users.find(u => u.phone === phone);
    if (!user) return { user: null as any, error: 'Nomor HP tidak ditemukan' };

    const storedPwd = await storage.get<string>(`pwd_${phone}`);
    if (storedPwd !== password) return { user: null as any, error: 'Password salah' };

    await storage.set('current_user', user);
    await storage.set('session_token', user.id + '_' + Date.now());
    return { user };
  },

  logout: async () => {
    await storage.remove('current_user');
    await storage.remove('session_token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = await storage.get<string>('session_token');
    if (!token) return null;
    return storage.get<User>('current_user');
  },

  updateUser: async (updates: Partial<User>): Promise<User | null> => {
    const current = await storage.get<User>('current_user');
    if (!current) return null;
    const updated = { ...current, ...updates };
    await storage.set('current_user', updated);
    const users = await storage.get<User[]>('users') || [];
    const idx = users.findIndex(u => u.id === current.id);
    if (idx >= 0) { users[idx] = updated; await storage.set('users', users); }
    return updated;
  },
};
