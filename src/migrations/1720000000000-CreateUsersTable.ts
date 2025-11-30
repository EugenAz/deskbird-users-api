import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1720000000000 implements MigrationInterface {
  name = 'CreateUsersTable1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('admin', 'user')`,
    );

    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "firstName" character varying,
        "lastName" character varying,
        "role" "user_role_enum" NOT NULL DEFAULT 'user',
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "user"');
    await queryRunner.query('DROP TYPE "user_role_enum"');
  }
}
