const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withMlKitMetadata(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const mainApplication = androidManifest.application?.[0];

    if (mainApplication) {
      if (!mainApplication["meta-data"]) {
        mainApplication["meta-data"] = [];
      }

      const existingEntry = mainApplication["meta-data"].find(
        (item) => item.$ && item.$["android:name"] === "com.google.mlkit.vision.DEPENDENCIES"
      );

      if (!existingEntry) {
        mainApplication["meta-data"].push({
          $: {
            "android:name": "com.google.mlkit.vision.DEPENDENCIES",
            "android:value": "barcode",
          },
        });
      }
    }

    return config;
  });
};
