// Row shape for Platforms — used to build pending-change payloads/snapshots
// (the direct-write superadmin path in adminPlatformsSlice.ts builds this
// inline; this mirrors the same field names so approve_pending_change's SQL
// branch can read the payload directly).

export interface PlatformFields {
  name: string;
  key: string;
  description?: string;
  color?: string;
}

export const platformToInsertRow = (p: PlatformFields): Record<string, unknown> => ({
  Name: p.name,
  key: p.key,
  description: p.description || null,
  color: p.color || null,
});
