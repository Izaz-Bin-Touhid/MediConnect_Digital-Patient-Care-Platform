import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1795015445467 implements MigrationInterface {
  name = 'InitialSchema1795015445467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "COORDINATION_ACTIVITY" ("activity_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL, "coordinator_id" character varying(10), "action" character varying(40) NOT NULL, "note" character varying(1000), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ecd5575f8adaca942d4ed62cca5" PRIMARY KEY ("activity_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ADMIN" ("admin_id" character varying(10) NOT NULL, "full_name" character varying(120) NOT NULL, "email" character varying(254) NOT NULL, "phone" character varying(25) NOT NULL, "password" character varying(60) NOT NULL, CONSTRAINT "UQ_3a94a63ed8ea8862529bf21fb29" UNIQUE ("email"), CONSTRAINT "PK_fa2483eccf9c22286ec0479b36e" PRIMARY KEY ("admin_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "COORDINATION_TASK" ("task_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "request_id" character varying(10) NOT NULL, "note" character varying(1000) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_15ac3f8c69b364637254279378d" UNIQUE ("request_id"), CONSTRAINT "REL_15ac3f8c69b364637254279378" UNIQUE ("request_id"), CONSTRAINT "PK_dcf94da5ea5438c987a59b73a1f" PRIMARY KEY ("task_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "COORDINATOR_APPLICATION" ("application_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(120) NOT NULL, "phone" character varying(25) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "approved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_da0b9e6e9354ed6581f2f27f973" PRIMARY KEY ("application_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "FOLLOWUP_COORDINATOR" ("coordinator_id" character varying(10) NOT NULL, "admin_id" character varying(10) NOT NULL, "full_name" character varying(120) NOT NULL, "email" character varying(254) NOT NULL, "phone" character varying(25) NOT NULL, "password" character varying(60) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'coordinator', "token_version" integer NOT NULL DEFAULT '0', "staff_id" character varying(30) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8bdf26935c6af4d4ce415b88fe8" UNIQUE ("email"), CONSTRAINT "UQ_f0aecbaeac49c272a5a412acd5b" UNIQUE ("staff_id"), CONSTRAINT "PK_ed733f9a71710aa54bc5edae30b" PRIMARY KEY ("coordinator_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "DIAGNOSTIC_CENTER" ("center_id" character varying(10) NOT NULL, "center_name" character varying(120) NOT NULL, "email" character varying(254) NOT NULL, "phone" character varying(25) NOT NULL, "password" character varying(60) NOT NULL, "location" character varying(250) NOT NULL, CONSTRAINT "UQ_78f8215199cfbb2e2fbe2f495a7" UNIQUE ("email"), CONSTRAINT "PK_7774cb65605db04ac3196df3cff" PRIMARY KEY ("center_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "DIAGNOSTIC_REPORT" ("report_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "request_id" character varying(10) NOT NULL, "result" character varying(4000) NOT NULL, "report_file" character varying(1000) NOT NULL, "check_status" character varying(20) NOT NULL DEFAULT 'pending', "forwarded_at" TIMESTAMP WITH TIME ZONE, "doctor_notes" character varying(2000), "status" character varying(20) NOT NULL DEFAULT 'submitted', "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_587425dd66c6392890a17ec772f" UNIQUE ("request_id"), CONSTRAINT "REL_587425dd66c6392890a17ec772" UNIQUE ("request_id"), CONSTRAINT "PK_47554145de33574914e72537aaa" PRIMARY KEY ("report_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "FOLLOWUP_SCHEDULE" ("followup_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_id" character varying(10) NOT NULL, "followup_code" character varying(20) NOT NULL, "followup_date" date NOT NULL, "followup_time" TIME NOT NULL, "note" character varying(1000) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'scheduled', "outcome" character varying(1000), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_634d30a906db38863bd6cb28afa" UNIQUE ("followup_code"), CONSTRAINT "PK_27a74a936927d211738b61dc8f8" PRIMARY KEY ("followup_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "REMINDER" ("reminder_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "followup_id" uuid NOT NULL, "reminder_code" character varying(20) NOT NULL, "message" character varying(1000) NOT NULL, "sent_date" TIMESTAMP WITH TIME ZONE, "response_status" character varying(20) NOT NULL DEFAULT 'pending', CONSTRAINT "UQ_89890d01c79d35a6f4a1183f6b8" UNIQUE ("reminder_code"), CONSTRAINT "PK_20f069ab977b0b79125e90b9146" PRIMARY KEY ("reminder_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "DOCTOR" ("doctor_id" SERIAL NOT NULL, "full_name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "phone" character varying(20) NOT NULL, "password" character varying(255) NOT NULL, CONSTRAINT "UQ_b096743c94b4c7f0989ce0b4300" UNIQUE ("email"), CONSTRAINT "PK_e5f87f1f13a308eb90a9479bcfe" PRIMARY KEY ("doctor_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "TEST_REQUEST" ("request_id" character varying(10) NOT NULL, "request_code" character varying(20) NOT NULL, "case_id" character varying(10) NOT NULL, "center_id" character varying(10), "test_type" character varying(120) NOT NULL, "notes" character varying(2000), "patient_decision" character varying(20), "decision_date" TIMESTAMP WITH TIME ZONE, "status" character varying(30) NOT NULL DEFAULT 'requested', "request_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_67c67121332a131cca723bd5db4" UNIQUE ("request_code"), CONSTRAINT "PK_50cf87b083e2bad3d5e30792f18" PRIMARY KEY ("request_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PATIENT_CASE" ("case_id" character varying(10) NOT NULL, "case_code" character varying(20) NOT NULL, "doctor_id" character varying(10) NOT NULL, "coordinator_id" character varying(10), "symptoms" character varying(2000) NOT NULL, "duration" character varying(100) NOT NULL, "age" integer NOT NULL, "gender" character varying(20) NOT NULL, "previous_illness" character varying(2000), "description" character varying(2000), "status" character varying(30) NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "patient_id" character varying(10) NOT NULL, CONSTRAINT "UQ_e838fc7e2fef5ea4cd6d1b7f265" UNIQUE ("case_code"), CONSTRAINT "PK_01e6e541f46fa17a0f7f31be20a" PRIMARY KEY ("case_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PATIENT" ("patient_id" character varying(10) NOT NULL, "full_name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "phone" character varying(20) NOT NULL, "password" character varying(2000) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'patient', CONSTRAINT "UQ_c32d4004ac28a0ee7c48699aae1" UNIQUE ("email"), CONSTRAINT "PK_6a7ea065da39077ecbe61414699" PRIMARY KEY ("patient_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PAYMENT" ("payment_id" character varying(10) NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_method" character varying(50), "transaction_id" character varying(150), "payment_status" character varying(30) NOT NULL DEFAULT 'pending', "doctor_payable_amount" numeric(10,2) NOT NULL, "paid_at" TIMESTAMP, "case_id" character varying(10) NOT NULL, CONSTRAINT "UQ_0dfd233a9948aef2eba843d45df" UNIQUE ("transaction_id"), CONSTRAINT "PK_33c097f0589fc1c64ed235d3cd2" PRIMARY KEY ("payment_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "COORDINATION_ACTIVITY" ADD CONSTRAINT "FK_0ee9e6af1edbc2f3c65ebae9484" FOREIGN KEY ("task_id") REFERENCES "COORDINATION_TASK"("task_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "COORDINATION_TASK" ADD CONSTRAINT "FK_15ac3f8c69b364637254279378d" FOREIGN KEY ("request_id") REFERENCES "TEST_REQUEST"("request_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "FOLLOWUP_COORDINATOR" ADD CONSTRAINT "FK_7f73521577971aaa73ad8720f0a" FOREIGN KEY ("admin_id") REFERENCES "ADMIN"("admin_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "DIAGNOSTIC_REPORT" ADD CONSTRAINT "FK_587425dd66c6392890a17ec772f" FOREIGN KEY ("request_id") REFERENCES "TEST_REQUEST"("request_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "FOLLOWUP_SCHEDULE" ADD CONSTRAINT "FK_c9b9fcaa9b4ab0084a9afe69c41" FOREIGN KEY ("case_id") REFERENCES "PATIENT_CASE"("case_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "REMINDER" ADD CONSTRAINT "FK_ce0d8b71f033d2aaaa0dc767528" FOREIGN KEY ("followup_id") REFERENCES "FOLLOWUP_SCHEDULE"("followup_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "TEST_REQUEST" ADD CONSTRAINT "FK_49eb5cd1fc97581f636753a1321" FOREIGN KEY ("case_id") REFERENCES "PATIENT_CASE"("case_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "TEST_REQUEST" ADD CONSTRAINT "FK_88d84cfdfadf63b63d7babae470" FOREIGN KEY ("center_id") REFERENCES "DIAGNOSTIC_CENTER"("center_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PATIENT_CASE" ADD CONSTRAINT "FK_8fec7b011ea5cf50c838b80bd19" FOREIGN KEY ("patient_id") REFERENCES "PATIENT"("patient_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PATIENT_CASE" ADD CONSTRAINT "FK_f117fcffe38c64a78f3bd4a38e2" FOREIGN KEY ("coordinator_id") REFERENCES "FOLLOWUP_COORDINATOR"("coordinator_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PAYMENT" ADD CONSTRAINT "FK_a51d04a860db12e7a9619f2ee28" FOREIGN KEY ("case_id") REFERENCES "PATIENT_CASE"("case_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PAYMENT" DROP CONSTRAINT "FK_a51d04a860db12e7a9619f2ee28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PATIENT_CASE" DROP CONSTRAINT "FK_f117fcffe38c64a78f3bd4a38e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PATIENT_CASE" DROP CONSTRAINT "FK_8fec7b011ea5cf50c838b80bd19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TEST_REQUEST" DROP CONSTRAINT "FK_88d84cfdfadf63b63d7babae470"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TEST_REQUEST" DROP CONSTRAINT "FK_49eb5cd1fc97581f636753a1321"`,
    );
    await queryRunner.query(
      `ALTER TABLE "REMINDER" DROP CONSTRAINT "FK_ce0d8b71f033d2aaaa0dc767528"`,
    );
    await queryRunner.query(
      `ALTER TABLE "FOLLOWUP_SCHEDULE" DROP CONSTRAINT "FK_c9b9fcaa9b4ab0084a9afe69c41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DIAGNOSTIC_REPORT" DROP CONSTRAINT "FK_587425dd66c6392890a17ec772f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "FOLLOWUP_COORDINATOR" DROP CONSTRAINT "FK_7f73521577971aaa73ad8720f0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "COORDINATION_TASK" DROP CONSTRAINT "FK_15ac3f8c69b364637254279378d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "COORDINATION_ACTIVITY" DROP CONSTRAINT "FK_0ee9e6af1edbc2f3c65ebae9484"`,
    );
    await queryRunner.query(`DROP TABLE "PAYMENT"`);
    await queryRunner.query(`DROP TABLE "PATIENT"`);
    await queryRunner.query(`DROP TABLE "PATIENT_CASE"`);
    await queryRunner.query(`DROP TABLE "TEST_REQUEST"`);
    await queryRunner.query(`DROP TABLE "DOCTOR"`);
    await queryRunner.query(`DROP TABLE "REMINDER"`);
    await queryRunner.query(`DROP TABLE "FOLLOWUP_SCHEDULE"`);
    await queryRunner.query(`DROP TABLE "DIAGNOSTIC_REPORT"`);
    await queryRunner.query(`DROP TABLE "DIAGNOSTIC_CENTER"`);
    await queryRunner.query(`DROP TABLE "FOLLOWUP_COORDINATOR"`);
    await queryRunner.query(`DROP TABLE "COORDINATOR_APPLICATION"`);
    await queryRunner.query(`DROP TABLE "COORDINATION_TASK"`);
    await queryRunner.query(`DROP TABLE "ADMIN"`);
    await queryRunner.query(`DROP TABLE "COORDINATION_ACTIVITY"`);
  }
}
