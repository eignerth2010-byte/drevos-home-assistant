# New recipes without another application update

Install **app 0.5.0** or **HA integration 0.3.0** once. The web app receives this feature on its next full opening. An already configured Pi needs no change.

After that, recipes are published centrally. Opening **Recipes** checks the catalog at most once every 30 minutes automatically; **Refresh recipes** checks immediately on request. New recipe entries do not need another APK, iPhone signing operation or HA update. Changes to application/control features may still require a software update.

## Adding a recipe

1. Send Thomas the recipe, product photo, ingredients, instructions and oven settings using **Recipes → Save / submit my own recipe**.
2. Thomas reviews the submission and passes it to this project for inclusion. Incoming submissions are not automatically published.
3. The shared catalog and photo are updated, with source attribution. User submissions are labelled **Community recipe**; verified oven-display sources retain **Drevos original recipe**.
4. Users open **Recipes** or choose **Refresh recipes**. The new entry appears in the app, web app and HA.

Published recipes/photos are public. Personal form drafts remain in the current browser until explicitly submitted. FormSubmit recipient activation and an actual test photo still need owner verification before inviting submissions.

## Without an Internet connection

The 40 bundled recipes remain available. A successfully loaded catalog is also saved on the current device/browser. Its text and settings remain readable offline. New product photos may require connectivity; device image caches are not guaranteed permanent offline storage.

The page shows the catalog date and reports failed refreshes. Invalid or unsupported downloads never replace the last valid catalog. Clearing application/browser data also clears this public cache, returning a new installation to its bundled catalog.

## Selected phases keep their settings

Refreshing recipes never sends oven commands. An already selected phase keeps its numeric settings even if the same recipe changes online. Select the phase again to use its updated settings. Start heat, smoke/ignition, fans and timer yourself; no automatic start or phase transition is added.

## Publication details

The shared source is `mobile/public/recipes/catalog.json` in the app repository, with JPEG photos in its `images/` folder. Clients fetch data only from this fixed public GitHub location, never executable extensions. Update the catalog date/revision, include the photo and verify attribution, run **`npm run recipes:check`** in `mobile`, then publish the reviewed files on the main branch. No application version bump or release is needed for content-only additions; CI also checks the application.

Keep `schemaVersion: 1`: up to 500 recipes, up to three phases each; chamber 0–120 °C, core target 0–115 °C, smoke 0–100%, duration 0–9999 minutes. Resolve unclear values before publication. When replacing an existing image, change its `imageRevision` so clients fetch the new photo. Public GitHub caching can briefly delay visibility.
