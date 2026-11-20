# Mobile validation – 2026-11-20

Version 0.1.0 preview. Tested on Windows with Node.js 24.22.3, Expo SDK 58 and React Native 0.88.1.

- TypeScript strict check passed.
- 21 automated tests passed: metadata routing across two gateways and renamed entities, duplicate-key/domain rejection, unknown buttons, limits, manual-mode/target/timer guards, real duration strings, URL validation, single-flight token renewal, revoked vs temporarily unreachable authentication, fresh preflight state checks, no retries after failed writes, duplicate-tap rejection, cancellation before a write, logout cleanup and secure code-exchange persistence.
- JavaScript/Hermes bundles exported for Android and iOS; demo web bundle exported.
- Android native project generated with the custom scheme, local HTTP support, protected credential backup exclusions and a a standalone release-mode preview build.
- Dependency audit after the fingerprint-specific minimatch override: no reported vulnerabilities. Lockfile pins the resolved dependency tree.
- Live HA states were fetched **read-only** to check function attributes and PLC duration format. No physical control action was sent for mobile development. Some guarded buttons omit Drevos attributes while unavailable; those controls correctly remain disabled until HA exposes them again.

Browser demo interaction checks cover a phone-sized viewport, explicit target application, heating confirmation/cancel, timer display and language selection. Browser emulation is not an iPhone or Android device test.

Still required before calling this a tested device release: successful native compiler builds, real iOS/Android login callback and protected-storage checks, local-network/HTTPS tests, foreground/background/reconnection tests on each platform, verified readbacks through the mobile UI, and signed installation. Real heater, ignition and Pi power-off are not activated by automated tests. Use a controlled supervised test for those functions.

GitHub CI is configured to produce an Android preview APK and an unsigned iPhone IPA without Apple credentials. An unsigned IPA is a compiler artifact and cannot be installed directly. Refer to the workflow result for actual compiler success; the existence of the workflow alone is not proof of a build.
