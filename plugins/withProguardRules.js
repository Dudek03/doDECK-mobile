const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withProguardRules(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const proguardPath = path.join(projectRoot, "app", "proguard-rules.pro");

      try {
        if (fs.existsSync(proguardPath)) {
          let contents = fs.readFileSync(proguardPath, "utf8");

          const customRules = `
# --- START: Custom ML Kit & Camera ProGuard Rules ---
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.vision.** { *; }
-keep class com.google.android.gms.code.scanner.** { *; }
-keep class expo.modules.camera.** { *; }
-dontwarn com.google.mlkit.**
-dontwarn com.google.android.gms.**
# --- END: Custom ML Kit & Camera ProGuard Rules ---
`;

          if (!contents.includes("Custom ML Kit & Camera ProGuard Rules")) {
            contents += `\n${customRules}\n`;
            fs.writeFileSync(proguardPath, contents, "utf8");
            console.log("[withProguardRules] Successfully injected rules into proguard-rules.pro");
          }
        }
      } catch (err) {
        console.error("[withProguardRules] Failed to update proguard-rules.pro:", err);
      }

      return config;
    },
  ]);
};
