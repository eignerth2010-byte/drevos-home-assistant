# Drevos Mobile

[Deutsch: vollständige Anleitung](README.de.md) · [English: complete guide](README.en.md)

Native React Native / Expo app for **iOS and Android**, using the existing Drevos Home Assistant integration. Version 0.1.0, preview. This is a community project, not an official Drevos app.

The app connects to **Home Assistant**, not directly to the Raspberry Pi. No gateway update, MQTT broker, additional serial connection or PLC program change is needed.

Includes the smoker-style interface, German/English, secure Home Assistant sign-in, chamber/core/smoke readings and targets, heating, smoke with automatic ignition, convection, fan, timer and guarded Pi shutdown. An isolated demo lets you inspect the interface without an oven.

Source code is ready for native builds. JavaScript bundles and automated checks do **not** replace compiling and testing on physical Android/iOS devices. iPhone installation always requires valid Apple signing. An unsigned `.ipa` cannot be installed directly.

## Build without a local Mac

In this repository, open **Actions → Drevos Mobile → Run workflow**. The workflow checks the app, builds a standalone Android preview APK and optionally compiles an **unsigned iPhone app** on a hosted Mac. Artifacts are retained for 14 days. No Apple credentials are stored in the workflow. Signing and distribution are separate steps; see the language-specific guides.

## Development

```sh
cd mobile
npm ci
npm run typecheck
npm test
npm run bundle:check
```

Node.js 24 LTS. Native iOS builds: Expo SDK 58 requires Xcode 26.4+ and iOS 16.4+; macOS 13 Ventura cannot run this Xcode version. Android: JDK 17, Android Studio/SDK; generated SDK levels follow Expo 58. See [Expo system requirements](https://docs.expo.dev/versions/v58.0.0/) and [Apple Xcode requirements](https://developer.apple.com/xcode/system-requirements/).

`npm run preview` is a **web demo only**, with native sign-in disabled. Production apps use SecureStore (Keychain/Keystore), OAuth state and PKCE. Never place real credentials in source, app config, a build variable or an issue.

## Login identity

`auth/index.html` declares `drevos://auth-callback`. Its public raw GitHub URL is the OAuth client ID. Home Assistant fetches this static declaration during sign-in; no credentials or oven data are sent to GitHub. A fork must host its own declaration and update `CLIENT_ID` in `src/client.ts` (and preferably its application IDs/custom scheme). Do not use Home Assistant Companion's client identity. See [HA authentication](https://contributors.home-assistant.io/core/internals/auth-api/).

## License

App source and original cabinet icon: MIT, see [LICENSE](LICENSE). The supplied Drevos logo and brand are excluded: see [BRAND-NOTICE](BRAND-NOTICE.md). Dependencies keep their respective licenses. [Validation](VALIDATION.md) describes what has and has not been tested.
