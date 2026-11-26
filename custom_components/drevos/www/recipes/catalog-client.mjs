// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Thomas Eigner
// Public recipe data only. This client never receives oven or HA credentials.
export const CATALOG_URL =
  "https://raw.githubusercontent.com/eignerth2010-byte/drevos-app/main/mobile/public/recipes/catalog.json";
const IMAGE_BASE =
  CATALOG_URL.slice(0, CATALOG_URL.lastIndexOf("/") + 1) + "images/";
export const CATALOG_KEY = "drevos.recipes.public.v1";
export const MAX_CATALOG_CHARS = 1_500_000;

function text(value, max, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim()) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  )
    throw Error("catalog-text");
  return value;
}
function slug(value) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(value))
    throw Error("catalog-id");
  return value;
}
function number(value, max) {
  if (!Number.isInteger(value) || value < 0 || value > max)
    throw Error("catalog-range");
  return value;
}
export function phaseStamp(phase) {
  return JSON.stringify([
    phase.name,
    phase.durationMinutes,
    phase.chamberC,
    phase.coreC,
    phase.smokePercent,
    phase.smokeFromProgram,
    phase.convection,
    phase.fan,
  ]);
}
export function normalizeCatalog(value) {
  if (
    !value ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.recipes) ||
    value.recipes.length < 1 ||
    value.recipes.length > 500
  )
    throw Error("catalog-schema");
  const updated = text(value.updated, 10, true);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(updated) ||
    !Number.isFinite(Date.parse(updated + "T00:00:00Z")) ||
    new Date(updated + "T00:00:00Z").toISOString().slice(0, 10) !== updated
  )
    throw Error("catalog-date");
  const revision = text(value.revision ?? updated, 100, true),
    ids = new Set();
  const recipes = value.recipes.map((r) => {
    if (
      !r ||
      typeof r !== "object" ||
      !r.source ||
      !["drevos_original", "community"].includes(r.source.kind)
    )
      throw Error("catalog-source");
    const id = slug(r.id);
    if (ids.has(id)) throw Error("catalog-duplicate");
    ids.add(id);
    if (!Array.isArray(r.phases) || r.phases.length < 1 || r.phases.length > 3)
      throw Error("catalog-phases");
    const phases = r.phases.map((p) => {
      if (
        !p ||
        typeof p !== "object" ||
        typeof p.smokeFromProgram !== "boolean" ||
        ![null, true, false].includes(p.convection) ||
        ![null, true, false].includes(p.fan)
      )
        throw Error("catalog-phase");
      return Object.freeze({
        name: text(p.name, 80, true),
        durationMinutes: number(p.durationMinutes, 9999),
        chamberC: number(p.chamberC, 120),
        coreC: number(p.coreC, 115),
        smokePercent: number(p.smokePercent, 100),
        smokeFromProgram: p.smokeFromProgram,
        convection: p.convection,
        fan: p.fan,
      });
    });
    const imageRevision =
      r.imageRevision === undefined ? "" : text(r.imageRevision, 100);
    if (imageRevision && !/^[a-zA-Z0-9._-]+$/.test(imageRevision))
      throw Error("catalog-image");
    return Object.freeze({
      id,
      name: text(r.name, 120, true),
      category: text(r.category, 120, true),
      ingredients: text(r.ingredients, 16000, true),
      method: text(r.method, 20000, true),
      notes: text(r.notes ?? "", 8000),
      image: slug(r.image),
      imageRevision,
      imageNote: text(r.imageNote ?? "", 600),
      source: Object.freeze({
        kind: r.source.kind,
        author: text(r.source.author ?? "", 120),
        reference: text(r.source.reference ?? "", 600),
        foodSafetyReviewed: false,
      }),
      phases: Object.freeze(phases),
    });
  });
  return Object.freeze({
    schemaVersion: 1,
    updated,
    revision,
    recipes: Object.freeze(recipes),
  });
}
export function recipeImageUrl(recipe) {
  const image = slug(recipe.image);
  const revision = text(recipe.imageRevision ?? "", 100);
  if (revision && !/^[a-zA-Z0-9._-]+$/.test(revision))
    throw Error("catalog-image");
  return (
    IMAGE_BASE +
    image +
    ".jpg" +
    (revision ? "?v=" + encodeURIComponent(revision) : "")
  );
}
export function createCatalogClient({
  fallback,
  store,
  fetcher = (...args) => fetch(...args),
  now = () => Date.now(),
  timeoutMs = 7000,
  storageTimeoutMs = 1500,
}) {
  let state = Object.freeze({
    catalog: normalizeCatalog(fallback),
    status: "bundled",
    busy: false,
    checkedAt: null,
    persistent: true,
  });
  const listeners = new Set();
  let initialized = false,
    flight = null,
    lastAttempt = -Infinity;
  const emit = (patch) => {
    state = Object.freeze({ ...state, ...patch });
    for (const listener of listeners) listener(state);
  };
  async function storageStep(promise) {
    let timer;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(Error("catalog-storage-timeout")),
            storageTimeoutMs,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
  async function run() {
    emit({ busy: true });
    if (!initialized) {
      initialized = true;
      try {
        const cached = store
          ? await storageStep(store.getItem(CATALOG_KEY))
          : null;
        if (cached) {
          if (cached.length > MAX_CATALOG_CHARS) throw Error("catalog-size");
          emit({
            catalog: normalizeCatalog(JSON.parse(cached)),
            status: "cached",
          });
        }
      } catch {
        /* A broken cache cannot replace the bundled safe copy. */
      }
    }
    lastAttempt = now();
    const controller = new AbortController();
    let timer;
    try {
      const remote = (async () => {
        const response = await fetcher(CATALOG_URL, {
          method: "GET",
          credentials: "omit",
          redirect: "error",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || (response.url && response.url !== CATALOG_URL))
          throw Error("catalog-http");
        if (Number(response.headers.get("content-length")) > MAX_CATALOG_CHARS)
          throw Error("catalog-size");
        const raw = await response.text();
        if (controller.signal.aborted || raw.length > MAX_CATALOG_CHARS)
          throw Error("catalog-size");
        return normalizeCatalog(JSON.parse(raw));
      })();
      const catalog = await Promise.race([
        remote,
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(Error("catalog-timeout"));
          }, timeoutMs);
        }),
      ]);
      let persistent = true;
      try {
        const saved = JSON.stringify(catalog);
        if (saved.length > MAX_CATALOG_CHARS) throw Error("catalog-size");
        if (store) await storageStep(store.setItem(CATALOG_KEY, saved));
      } catch {
        persistent = false;
      }
      emit({ catalog, status: "online", checkedAt: now(), persistent });
    } catch {
      emit({ status: "offline", checkedAt: now() });
    } finally {
      clearTimeout(timer);
      emit({ busy: false });
    }
    return state;
  }
  return {
    snapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh(force = false) {
      if (flight) return flight;
      if (initialized && !force && now() - lastAttempt < 30 * 60 * 1000)
        return Promise.resolve(state);
      flight = Promise.resolve()
        .then(run)
        .finally(() => {
          flight = null;
        });
      return flight;
    },
  };
}
