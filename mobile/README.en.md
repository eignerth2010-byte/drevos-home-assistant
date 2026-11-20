> This earlier HA-dependent prototype is superseded by the [standalone Drevos app](https://github.com/eignerth2010-byte/drevos-app). Use that repository for the current app and downloads.

# Drevos app Ã¢â‚¬â€œ English guide

The native app uses the existing **Drevos integration in Home Assistant**. No Raspberry Pi changes, MQTT broker, extra serial connection or PLC program changes are required. Home Assistant and the gateway must be reachable. Use the existing secure HA address or a VPN for remote access.

## Requirements

- A smoker matching the verified controller profile and a working native Drevos Pi/HA installation from this repository.
- A Home Assistant user with permission to operate its Drevos entities. Entity discovery was checked against HA 2026.11.1.
- Android 7+ or iPhone/iPad on iOS/iPadOS 16.4+. The generated Android preview APK targets ARM devices. Physical mobile-device tests remain pending.
- Your Home Assistant address. Enter your password only in Home Assistant's own sign-in window.

## Android without local build tools

Open this repository on GitHub, select **Actions Ã¢â€ â€™ Drevos Mobile Ã¢â€ â€™ Run workflow**. Disable `build_ios` if you only need Android. After success, download and unzip **Artifacts Ã¢â€ â€™ Drevos-Android-preview-APK**, transfer the APK to your phone and allow installation of that file. This is a standalone test build with its JavaScript embedded, not a Play Store release. No development server is needed.

Test signing keys may change between CI runs. If an update is refused because its signing key differs, sign out, uninstall the previous test app and install the new one. Use your own persistent release signing key for maintained releases.

Artifacts expire after 14 days. GitHub's standard hosted runners are [free for public repositories](https://docs.github.com/en/actions/reference/runners/github-hosted-runners); private repositories have different quotas. No paid subscription is created automatically.

## iPhone with macOS 13 Ventura

This Expo SDK 58 project needs **Xcode 26.4+**. Ventura cannot run that Xcode version. The GitHub workflow can compile the iPhone app on a current hosted Mac instead. Its `Drevos-iPhone-UNSIGNED-needs-Apple-signing` artifact contains an **unsigned `.ipa`**. This cannot be installed directly on an iPhone. The workflow does not use Apple credentials, create certificates or provision devices.

Valid Apple signing is still required for installation. A supported route is a signed internal EAS build with your own Apple Developer account and registered iPhone, or a personal device build on a compatible current Mac/Xcode installation. Check the selected account's and build service's terms and fees before choosing. Nothing is purchased or submitted to an app store by these files.

After setting up your own EAS account, in `mobile`:

```sh
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

`eas init` links your own project. The bundle ID `at.eignerth.drevos` must belong to your Apple team; change it before the first build if publishing your own fork. Complete Apple sign-in, agreements and device approval yourself. Keep signing keys, passwords and certificates out of the repository. The `production` profiles prepare store builds; store listings, privacy disclosures, signing and review are separate tasks.

## Local builds

Install Node.js 24 LTS with npm. Android requires JDK 17 and Android Studio/SDK. iOS requires CocoaPods and macOS compatible with Xcode 26.4+. Check [Expo requirements](https://docs.expo.dev/versions/v58.0.0/) and [Apple's Xcode requirements](https://developer.apple.com/xcode/system-requirements/).

For Android, run `android-vorbereiten.ps1`, or `npm ci` followed by `npx expo prebuild --platform android --no-install`. Open the generated `android` directory in Android Studio. Use **Generate Signed Bundle / APK** for a release with your own private signing key.

On a compatible Mac, run:

```sh
chmod +x macOS-vorbereiten.command
./macOS-vorbereiten.command
```

The script installs locked dependencies, checks the source, generates the native project and opens `ios/Drevos.xcworkspace`. Choose your own team under **Signing & Capabilities**, select a connected iPhone and press **Run**. Accept Xcode agreements and handle Apple sign-in/device approvals yourself. No HA or Apple credentials are included.

## Sign-in and controls

Enter your HA URL and select **Sign in with Home Assistant**. Use a valid HTTPS address, preferably, or local `.local` HTTP with the platform's local network permission. Return from the HA sign-in window to the app. If several ovens are found, select one explicitly. Discovery uses gateway/function metadata and survives entity renaming.

**Oven:** view chamber/core temperature and smoke level; edit a target and press **Apply**. A positive target does not automatically start heating or smoke. Separate heating/smoke start actions ask for confirmation. Smoke operation also starts the PLC's automatic ignition sequence. Zero disables the corresponding heat/smoke request; a zero core target disables that completion criterion.

**Timer:** set duration in minutes and apply. Elapsed/remaining time comes from the PLC, not a phone clock. Start enables the timer; heating and smoke are separate. Pause/reset and Pi shutdown require heating and smoke off; reset/shutdown also require a paused timer.

**Connection:** select oven/language, refresh, shut down the Pi or sign out. Pi shutdown does not turn the oven off and the app cannot turn the Pi back on.

On connection loss, readings become unavailable and controls are disabled. Returning from background first loads fresh data. Every command gets a fresh preflight check; writes are never replayed after a timeout/reconnection. Check actual device state after an unconfirmed command. The PLC continues independently when the phone is closed; this app is not an emergency stop. Automatic mode or unsupported temperature units lock manual control.

**Demo** is isolated synthetic data with no HA/Pi connection. The browser preview is demo-only and does not prove native-device behavior.

## Privacy and troubleshooting

HA passwords are not stored by the app. A refresh credential is saved in native protected storage; short-lived access tokens remain in memory. HA fetches a static redirect declaration from GitHub during sign-in. Credentials and oven data are not sent to GitHub. No advertising or analytics service is built into the app.

Sign-out clears local credentials and attempts server revocation. If HA is unreachable, also revoke the app credential in your HA profile's Security page. Fix invalid HTTPS certificates; validation is never bypassed. Local HTTP is unencrypted and must not be exposed publicly.

No entities: check the native integration and user permissions. Disabled reset/shutdown: ensure heating, smoke and timer are off. Expired sign-in: sign out and authenticate again. Do not publish tokens, passwords or full HA configuration in support requests.

[Validation and limitations](VALIDATION.md) Ã‚Â· [Deutsch](README.de.md)

### Personal iPhone installation from Windows

Another option is [Sideloadly](https://sideloadly.io/): it can sign the unsigned IPA on Windows using a normal Apple ID and install it on your own iPhone. The provider supports free accounts; free signing lasts seven days and must be renewed. A device connection and the required Apple desktop components are needed. Enter Apple credentials and verification codes yourself only in the appropriate sign-in window, never in chat. This installation route has not been tested on a physical iPhone here. No automatic installation or changes to existing iTunes/iCloud installations are performed.
