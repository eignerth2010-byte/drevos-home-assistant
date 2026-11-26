# Recipes and community submissions

**New: shared online recipe updates.** Install app 0.5.0 or HA 0.3.0 once; future recipe additions do not require another software update. [How it works](ONLINE-RECIPES.en.md).

## Use a recipe

1. Open the app or Web App and select your oven.
2. Open **Recipes**, search for a product and open its recipe.
3. Read the ingredients, instructions and **Source notes**.
4. Select one phase: drying, smoking 1 or smoking 2.
5. Switch heat, smoke and timer off. Before a new timed phase, press **Reset** on the Timer page.
6. Press **Transfer all selected phase values to oven** and wait for confirmed feedback.
7. Start the required heat, smoke/ignition, fans and timer yourself using the existing controls.
8. Check the oven after the phase and take your intended break. Select and prepare the next phase yourself.

Selecting a phase only prefills the controls. The transfer button sends only that selected phase's numeric settings. It does not start heat, ignition, fans or the clock. There is no automatic next phase or scheduled remote start. To use different custom settings, clear the phase selection and use the normal controls.

**0 minutes** is never changed into a one-minute countdown. The old timer duration remains unchanged and timer start is disabled for that selected phase. Convection and fan settings are not recorded in the photographed recipe fields and are not guessed. Drying uses smoke 0% from the existing PLC program, because the drying recipe display has no smoke field.

Preparation requires a connected oven in manual mode. An interrupted transfer may have applied some settings already. No automatic retry or start occurs. Check the actual values and repeat the transfer yourself if needed.

## Source of the 40 recipes

The collection was transcribed from 121 photos of a Drevos oven display. **Drevos original recipe** describes that source; it does not mean manufacturer approval or a food safety review. Original recipe text remains in German, with German and English interface labels.

Differences between recipe descriptions, names and saved settings remain visible in source notes. All-zero unused phases cannot be selected. For **Ribs, method 2**, the photographed display shows 185 °C chamber and 155 °C core. Thomas Eigner suggested **85/55 °C** as a likely typo correction. These are clearly labelled as a suggested user correction, with the photographed original numbers retained in the catalog. They are not a confirmed manufacturer correction.

The food photos were restored from display photographs using AI and are labelled accordingly. They are not unchanged original manufacturer image files.

## Save personal recipes

Open **Recipes → Save or submit your own recipe** to visit [the form](https://drevos-smoker-control.thankfulchick1.chatgpt.site/recipe-submit.html?lang=en).

Enter a name, ingredients, method, notes, up to three phases and a photo. **Save recipe and photo on this device** saves a personal draft in that browser without submitting it. Limits are 25 drafts, 8 MB per image and 50 MB of images in total.

Open drafts under **My recipes**. They are not automatically synced between native apps, HA, devices or browsers. Clearing website data also deletes the drafts. Personal drafts are not yet selectable oven programs; verified phase transfer is provided for the published collection.

## Suggest a recipe for inclusion

The same form includes a product photo, ingredients, instructions and each phase's minutes, chamber/core temperatures, smoke percentage and optional convection/fan settings. State the source, optionally add a public nickname and private contact email, confirm permission for the recipe and photo yourself, then press **Send recipe for review**.

**FormSubmit** delivers suggestions to **eigner.th2010@gmail.com**. Oven keys, pairing codes and HA credentials are not required; do not put them in free-text fields. Thomas reviews submissions before possible publication. User submissions are labelled **Community recipe**. Selecting a source does not automatically award an original-recipe badge.

### One-time setup for Thomas

FormSubmit sends an activation email for the first submission. Confirm the recipient address in your own inbox before inviting real submissions. Photo attachments from that first submission are not retained before activation: resend a test recipe and photo after activation and verify receipt. The delivery service is not a permanent recipe archive.

## Home Assistant and the existing Pi

The HA integration includes the same collection in **Drevos → Recipes** and its dashboard card. An existing shared Pi requires no new software for recipes. App/Web App and HA keep separate connections. Install the HA update yourself, restart HA and reload its browser page.
