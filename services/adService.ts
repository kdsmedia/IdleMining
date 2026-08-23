// AdMob service — INDOMINE
// Konfigurasi ID unit iklan AdMob. Saat ini memakai ID test resmi Google.
// Ganti dengan ID unit produksi dari AdMob console sebelum rilis.

import mobileAds, {
  TestIds,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

export const AD_UNITS = {
  banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-3940256099942544/6300978111',
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712',
  rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3940256099942544/5224354917',
};

export const INTERSTITIAL_INTERVAL_MS = 20 * 60 * 1000; // 20 menit
export const AD_REWARD_COINS = 50; // koin per rewarded ad

let initialized = false;

export async function initAds(): Promise<void> {
  if (initialized) return;
  try {
    await mobileAds().initialize();
    initialized = true;
  } catch (e) {
    console.warn('[Ads] init gagal:', e);
  }
}

// ---- Interstitial (setiap 20 menit) ----
let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let lastInterstitialAt = 0;

function preloadInterstitial() {
  interstitialLoaded = false;
  interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
  interstitial.addAdEventListener(AdEventType.LOADED, () => { interstitialLoaded = true; });
  interstitial.addAdEventListener(AdEventType.CLOSED, () => { preloadInterstitial(); });
  interstitial.addAdEventListener(AdEventType.ERROR, () => { interstitialLoaded = false; });
  interstitial.load();
}

export function startInterstitialCycle(): () => void {
  if (!initialized) return () => {};
  preloadInterstitial();
  lastInterstitialAt = Date.now();
  const timer = setInterval(() => {
    if (Date.now() - lastInterstitialAt >= INTERSTITIAL_INTERVAL_MS && interstitialLoaded && interstitial) {
      lastInterstitialAt = Date.now();
      interstitial.show();
    }
  }, 30 * 1000); // cek setiap 30 detik
  return () => {
    clearInterval(timer);
    interstitial = null;
    interstitialLoaded = false;
  };
}

// ---- Rewarded (misi 50x ads) ----
let rewarded: RewardedAd | null = null;
let rewardedLoaded = false;

function preloadRewarded() {
  rewardedLoaded = false;
  rewarded = RewardedAd.createForAdRequest(AD_UNITS.rewarded);
  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => { rewardedLoaded = true; });
  rewarded.addAdEventListener(AdEventType.CLOSED, () => { preloadRewarded(); });
  rewarded.addAdEventListener(AdEventType.ERROR, () => { rewardedLoaded = false; });
  rewarded.load();
}

export function isRewardedReady(): boolean {
  return rewardedLoaded;
}

export function ensureRewardedLoaded(): void {
  if (!initialized) return;
  if (!rewarded) preloadRewarded();
}

export function showRewardedAd(): Promise<boolean> {
  return new Promise(resolve => {
    if (!initialized || !rewarded || !rewardedLoaded) {
      if (initialized) preloadRewarded();
      resolve(false);
      return;
    }
    let earned = false;
    const earnSub = rewarded!.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const closeSub = rewarded!.addAdEventListener(AdEventType.CLOSED, () => {
      earnSub();
      closeSub();
      resolve(earned);
    });
    rewardedLoaded = false;
    rewarded!.show();
  });
}
