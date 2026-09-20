import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseReadablePrimaryKeys1790000000000 implements MigrationInterface {
  name = 'UseReadablePrimaryKeys1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "id_counters" (
        "prefix" character varying(10) PRIMARY KEY,
        "value" integer NOT NULL
      )
    `);

    const tablePrefixes: Record<string, string> = {
      blocks: 'BLK',
      flats: 'FLT',
      complaints: 'CMP',
      visitors: 'VIS',
      bills: 'BIL',
      payments: 'PAY',
      amenities: 'AMN',
      amenity_slots: 'AMS',
      bookings: 'BKG',
      announcements: 'ANN',
      announcement_targets: 'ANT',
      notifications: 'NTF',
      audit_logs: 'AUD',
      billing_config: 'BCF',
      otp_tokens: 'OTP',
      refresh_tokens: 'RFT',
    };

    for (const [table, prefix] of Object.entries(tablePrefixes)) {
      await queryRunner.query(
        `INSERT INTO "id_counters" ("prefix", "value")
         SELECT $1, COALESCE(MAX(CAST(SUBSTRING("id" FROM '[0-9]+$') AS INTEGER)), 0)
         FROM "${table}"
         ON CONFLICT ("prefix") DO UPDATE
         SET "value" = GREATEST("id_counters"."value", EXCLUDED."value")`,
        [prefix],
      );
    }

    await queryRunner.query(`
      INSERT INTO "id_counters" ("prefix", "value")
      SELECT
        SPLIT_PART("id", '-', 1),
        MAX(CAST(SUBSTRING("id" FROM '[0-9]+$') AS INTEGER))
      FROM "users"
      GROUP BY SPLIT_PART("id", '-', 1)
      ON CONFLICT ("prefix") DO UPDATE
      SET "value" = GREATEST("id_counters"."value", EXCLUDED."value")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "id_counters"`);
  }
}
