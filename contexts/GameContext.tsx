import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { gameService, GameState } from '../services/gameService';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

interface GameContextType {
  gameState: GameState | null;
  loading: boolean;
  offlineReward: number;
  showOfflineModal: boolean;
  showDailyModal: boolean;
  dailyReward: number;
  dailyDay: number;
  claimOffline: () => void;
  dismissOfflineModal: () => void;
  claimDaily: () => void;
  dismissDailyModal: () => void;
  upgrade: (upgradeId: string) => Promise<{ success: boolean; error?: string }>;
  claimMission: (missionId: string) => Promise<number>;
  claimMiningTick: (minutes: number) => void;
  refreshState: () => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineReward, setOfflineReward] = useState(0);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReward, setDailyReward] = useState(0);
  const [dailyDay, setDailyDay] = useState(1);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadState = useCallback(async () => {
    if (!auth?.user) { setLoading(false); return; }
    const state = await gameService.getState(auth.user.id);

    // Check offline reward
    const now = new Date();
    const lastActive = new Date(state.lastActiveAt);
    const diffMin = (now.getTime() - lastActive.getTime()) / 60000;
    if (diffMin > 2) {
      const { newState, reward } = gameService.claimOffline(state);
      if (reward > 0) {
        await gameService.saveState(newState);
        setGameState(newState);
        setOfflineReward(reward);
        setShowOfflineModal(true);
      } else {
        setGameState(state);
      }
    } else {
      setGameState(state);
    }

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

  const claimOffline = () => setShowOfflineModal(false);
  const dismissOfflineModal = () => setShowOfflineModal(false);

  const claimDaily = () => {
    if (!gameState) return;
    const { newState, reward, day } = gameService.claimDaily(gameState);
    setDailyReward(reward);
    setDailyDay(day);
    if (reward > 0) { save(newState); }
    setShowDailyModal(false);
    if (reward > 0) { setShowDailyModal(false); }
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

  const claimMiningTick = useCallback((minutes: number) => {
    if (!gameState) return;
    const { newState } = gameService.claimMining(gameState, minutes);
    setGameState(newState);
    gameService.saveState(newState);
  }, [gameState]);

  const refreshState = async () => {
    if (!auth?.user || !gameState) return;
    const state = await gameService.getState(auth.user.id);
    setGameState(state);
  };

  return (
    <GameContext.Provider value={{
      gameState, loading,
      offlineReward, showOfflineModal,
      showDailyModal, dailyReward, dailyDay,
      claimOffline, dismissOfflineModal,
      claimDaily, dismissDailyModal,
      upgrade, claimMission, claimMiningTick, refreshState,
    }}>
      {children}
    </GameContext.Provider>
  );
}
