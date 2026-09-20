import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseUserIdsForResidentPrimaryKeys1790000001000
  implements MigrationInterface
{
  name = 'UseUserIdsForResidentPrimaryKeys1790000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ dataType }] = (await queryRunner.query(
      `SELECT data_type AS "dataType"
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'residents'
         AND column_name = 'id'`,
    )) as Array<{ dataType: string }>;

    // A freshly synchronized database already uses the user's ID as its key.
    if (dataType !== 'uuid') {
      await queryRunner.query(
        `ALTER TABLE "residents" DROP COLUMN IF EXISTS "userId"`,
      );
      return;
    }

    await queryRunner.query(`
      CREATE TEMP TABLE resident_id_map (
        old_id uuid PRIMARY KEY,
        new_id character varying(20) UNIQUE NOT NULL
      ) ON COMMIT DROP
    `);
    await queryRunner.query(`
      INSERT INTO resident_id_map (old_id, new_id)
      SELECT "id", "userId" FROM "residents"
    `);

    await queryRunner.query(`
      DO $$
      DECLARE foreign_key RECORD;
      BEGIN
        FOR foreign_key IN
          SELECT conrelid::regclass AS table_name, conname
          FROM pg_constraint
          WHERE confrelid = 'residents'::regclass AND contype = 'f'
        LOOP
          EXECUTE format(
            'ALTER TABLE %s DROP CONSTRAINT %I',
            foreign_key.table_name,
            foreign_key.conname
          );
        END LOOP;
      END $$
    `);

    const references = [
      ['complaints', 'residentId'],
      ['visitors', 'preRegisteredById'],
      ['bills', 'residentId'],
      ['payments', 'residentId'],
      ['bookings', 'residentId'],
    ];

    for (const [table, column] of references) {
      await queryRunner.query(
        `ALTER TABLE "${table}"
         ALTER COLUMN "${column}" TYPE character varying(20)
         USING "${column}"::text`,
      );
    }

    await queryRunner.query(`
      ALTER TABLE "residents"
      ALTER COLUMN "id" TYPE character varying(20)
      USING "id"::text
    `);
    await queryRunner.query(`
      UPDATE "residents" AS residents
      SET "id" = resident_id_map.new_id
      FROM resident_id_map
      WHERE residents."id" = resident_id_map.old_id::text
    `);

    for (const [table, column] of references) {
      await queryRunner.query(`
        UPDATE "${table}" AS child
        SET "${column}" = resident_id_map.new_id
        FROM resident_id_map
        WHERE child."${column}" = resident_id_map.old_id::text
      `);
    }

    await queryRunner.query(`
      ALTER TABLE "residents" DROP CONSTRAINT IF EXISTS "FK_residents_user";
      ALTER TABLE "residents" DROP COLUMN "userId";
      ALTER TABLE "residents" ADD CONSTRAINT "FK_residents_user"
        FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE;
      ALTER TABLE "complaints" ADD CONSTRAINT "FK_complaints_resident"
        FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE;
      ALTER TABLE "visitors" ADD CONSTRAINT "FK_visitors_preregistered_by"
        FOREIGN KEY ("preRegisteredById") REFERENCES "residents"("id") ON DELETE SET NULL;
      ALTER TABLE "bills" ADD CONSTRAINT "FK_bills_resident"
        FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE;
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_resident"
        FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE;
      ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_resident"
        FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE
    `);
  }

  public async down(): Promise<void> {
    throw new Error(
      'Shared user/resident primary keys cannot be automatically converted back to their former UUID values.',
    );
  }
}
