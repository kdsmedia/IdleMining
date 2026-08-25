import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useRef } from 'react';
import { gameService, GameState } from '../services/gameService';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext';

interface GameContextType {
  gameState: GameState | null;
  loading: boolean;
  showDailyModal: boolean;
  dailyReward: number;
  dailyDay: number;
  claimDaily: () => void;
  dismissDailyModal: () => void;
  upgrade: (upgradeId: string) => Promise<{ success: boolean; error?: string }>;
  claimMission: (missionId: string) => Promise<number>;
  recordAdWatch: (reward?: number) => Promise<void>;
  checkInDaily: () => Promise<void>;
  canCheckInToday: boolean;
  grantReferralBonus: () => Promise<void>;
  claimMiningTick: (minutes: number) => void;
  requestWithdrawal: (amountRupiah: number, danaNumber: string) => Promise<{ success: boolean; error?: string }>;
  refreshState: () => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReward, setDailyReward] = useState(0);
  const [dailyDay, setDailyDay] = useState(1);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadState = useCallback(async () => {
    if (!auth?.user) { setLoading(false); return; }
    let state = await gameService.getState(auth.user.id);

    // Sinkronkan progres misi undang teman dari Firestore (referral valid)
    try {
      const refCount = await authService.countReferrals(auth.user.id);
      if (refCount !== (state.referralCount || 0)) {
        state = gameService.syncReferralProgress(state, refCount);
        await gameService.saveState(state);
      }
    } catch {}

    setGameState(state);

    // Check daily
    if (gameService.canClaimDaily(state)) {
      setShowDailyModal(true);
    }
    setLoading(false);
  }, [auth?.user]);

  useEffect(() => {
    if (auth?.user) {
      setLoading(true);
      loadState();
    } else {
      setGameState(null);
      setLoading(false);
    }
  }, [auth?.user, loadState]);

  // Berikan bonus referral sekali setelah state dimuat
  useEffect(() => {
    if (gameState && auth?.user && !gameState.referralBonusGranted) {
      grantReferralBonus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.userId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!gameState) return;
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    saveTimerRef.current = setInterval(() => {
      if (gameState) gameService.saveState(gameState);
    }, 30000);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [gameState]);

  const save = async (state: GameState) => {
    setGameState(state);
    await gameService.saveState(state);
  };

  const claimDaily = () => {
    if (!gameState) return;
    const { newState, reward, day } = gameService.claimDaily(gameState);
    setDailyReward(reward);
    setDailyDay(day);
    if (reward > 0) { save(newState).catch(() => {}); }
    setShowDailyModal(false);
  };

  const dismissDailyModal = () => setShowDailyModal(false);

  const upgrade = async (upgradeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!gameState) return { success: false, error: 'Game belum dimuat' };
    const { newState, success, error } = gameService.upgrade(gameState, upgradeId);
    if (success) await save(newState);
    return { success, error };
  };

  const claimMission = async (missionId: string): Promise<number> => {
    if (!gameState) return 0;
    const { newState, reward } = gameService.claimMission(gameState, missionId);
    if (reward > 0) await save(newState);
    return reward;
  };

  const recordAdWatch = async (reward: number = 50) => {
    if (!gameState) return;
    await save(gameService.recordAdWatch(gameState, reward));
  };

  const checkInDaily = async () => {
    if (!gameState) return;
    await save(gameService.checkInDaily(gameState));
  };

  const grantReferralBonus = async () => {
    if (!gameState || !auth?.user) return;
    if (!auth.user.referredBy || gameState.referralBonusGranted) return;
    const { newState } = gameService.claimReferralBonus(gameState);
    newState.referralBonusGranted = true;
    await save(newState);
    // Bonus untuk pengundang
    try { await authService.grantReferrerBonus(auth.user.referredBy); } catch {}
  };

  const canCheckInToday = gameState ? gameService.canCheckIn(gameState) : false;

  const claimMiningTick = useCallback((minutes: number) => {
    if (!gameState) return;
    const { newState } = gameService.claimMining(gameState, minutes);
    setGameState(newState);
    gameService.saveState(newState).catch(() => {});
  }, [gameState]);

  const requestWithdrawal = async (amountRupiah: number, danaNumber: string): Promise<{ success: boolean; error?: string }> => {
    if (!gameState) return { success: false, error: 'Game belum dimuat' };
    const result = gameService.requestWithdrawal(gameState, amountRupiah, danaNumber);
    if (result.success && result.newState) await save(result.newState);
    return { success: result.success, error: result.error };
  };

  const refreshState = async () => {
    if (!auth?.user || !gameState) return;
    const state = await gameService.getState(auth.user.id);
    setGameState(state);
  };

  return (
    <GameContext.Provider value={{
      gameState, loading,
      showDailyModal, dailyReward, dailyDay,
      claimDaily, dismissDailyModal,
      upgrade, claimMission, recordAdWatch, checkInDaily, canCheckInToday, grantReferralBonus,
      claimMiningTick, requestWithdrawal, refreshState,
    }}>
      {children}
    </GameContext.Provider>
  );
}
