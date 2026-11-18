import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorProfiles1795019858527 implements MigrationInterface {
  name = 'AddDoctorProfiles1795019858527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "DOCTOR_PROFILE" ("profile_id" SERIAL NOT NULL, "doctor_id" integer NOT NULL, "admin_id" character varying(10), "qualification" text NOT NULL, "specialization" character varying(100) NOT NULL, "experience_years" integer NOT NULL, "registration_no" character varying(50) NOT NULL, "supporting_documents" text array NOT NULL DEFAULT '{}', "consultation_fee" numeric(10,2) NOT NULL, "verification_status" character varying(20) NOT NULL DEFAULT 'DRAFT', "verified_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_f4307ad07dc1215745c28678d83" UNIQUE ("doctor_id"), CONSTRAINT "UQ_adac58c05c2ab63a2be3e3b2769" UNIQUE ("registration_no"), CONSTRAINT "REL_f4307ad07dc1215745c28678d8" UNIQUE ("doctor_id"), CONSTRAINT "PK_bc58204cc9d2fb3cb3bf39f7d42" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "DOCTOR_PROFILE" ADD CONSTRAINT "FK_f4307ad07dc1215745c28678d83" FOREIGN KEY ("doctor_id") REFERENCES "DOCTOR"("doctor_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "DOCTOR_PROFILE" ADD CONSTRAINT "FK_f0d576530aebfbd31e66e2a054e" FOREIGN KEY ("admin_id") REFERENCES "ADMIN"("admin_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "DOCTOR_PROFILE" DROP CONSTRAINT "FK_f0d576530aebfbd31e66e2a054e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DOCTOR_PROFILE" DROP CONSTRAINT "FK_f4307ad07dc1215745c28678d83"`,
    );
    await queryRunner.query(`DROP TABLE "DOCTOR_PROFILE"`);
  }
}
