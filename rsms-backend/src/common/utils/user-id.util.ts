import { EntityManager } from 'typeorm';
import { Role } from '../enums';

const ROLE_PREFIX: Record<Role, string> = {
  [Role.RESIDENT]: 'RES',
  [Role.MANAGER]: 'MGR',
  [Role.GUARD]: 'GRD',
  [Role.MAINTENANCE]: 'MNT',
  [Role.ACCOUNTANT]: 'ACC',
};

/**
 * Generates the next human-readable ID for a role. This must be called inside
 * a transaction so the advisory lock is held until the user has been saved.
 */
export async function generateUserId(
  manager: EntityManager,
  role: Role,
): Promise<string> {
  const prefix = ROLE_PREFIX[role];

  return generatePrefixedId(manager, prefix);
}

export async function generatePrefixedId(
  manager: EntityManager,
  prefix: string,
): Promise<string> {
  const [result] = (await manager.query(
    `INSERT INTO "id_counters" ("prefix", "value")
     VALUES ($1, 1)
     ON CONFLICT ("prefix")
     DO UPDATE SET "value" = "id_counters"."value" + 1
     RETURNING "value"`,
    [prefix],
  )) as Array<{ value: string | number }>;

  const nextSerial = Number(result.value);
  return `${prefix}-${String(nextSerial).padStart(2, '0')}`;
}
