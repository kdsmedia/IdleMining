const fs = require('fs');
const path = require('path');

const pkgDir = path.join(__dirname, '..', 'node_modules', 'react-native-google-mobile-ads');

function patchFile(rel, replacements) {
  const fp = path.join(pkgDir, rel);
  if (!fs.existsSync(fp)) return;
  let src = fs.readFileSync(fp, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (src.includes(from)) {
      src = src.replace(from, to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(fp, src);
}

// 1. Fix removed AdSize API (getLargeAnchoredAdaptiveBannerAdSize removed in newer GMA SDKs)
patchFile('android/src/main/java/io/invertase/googlemobileads/ReactNativeGoogleMobileAdsCommon.java', [
  [
    'AdSize.getLargeAnchoredAdaptiveBannerAdSize(reactViewGroup.getContext(), adWidth)',
    'AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(reactViewGroup.getContext(), adWidth)',
  ],
]);

// 2. Remove AgeRestrictedTreatment usage (API removed in newer GMA SDKs)
patchFile('android/src/main/java/io/invertase/googlemobileads/ReactNativeGoogleMobileAdsModule.kt', [
  ['import com.google.android.gms.ads.AgeRestrictedTreatment\n', ''],
  [
    `    if (requestConfiguration.hasKey("ageRestrictedTreatment")) {
      val ageRestrictedTreatment = requestConfiguration.getString("ageRestrictedTreatment")

      when (ageRestrictedTreatment) {
        "CHILD" -> builder.setAgeRestrictedTreatment(AgeRestrictedTreatment.CHILD)
        "TEEN" -> builder.setAgeRestrictedTreatment(AgeRestrictedTreatment.TEEN)
        "UNSPECIFIED" -> builder.setAgeRestrictedTreatment(AgeRestrictedTreatment.UNSPECIFIED)
      }
    }
`,
    '',
  ],
]);

console.log('apply-gma-patch: done');
