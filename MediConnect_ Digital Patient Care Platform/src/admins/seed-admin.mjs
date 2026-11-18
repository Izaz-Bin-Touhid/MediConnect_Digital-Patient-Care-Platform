import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME?.trim() || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
  throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD in your ignored .env first');
}
if (ADMIN_NAME.length < 3 || ADMIN_NAME.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL) || ADMIN_EMAIL.length > 150 ||
    ADMIN_PHONE.length < 7 || ADMIN_PHONE.length > 20 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/.test(ADMIN_PASSWORD)) {
  throw new Error('Check Admin name, email, phone and password validation rules');
}
const client = new pg.Client({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
try {
  await client.connect();
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const result = await client.query(
    'INSERT INTO "ADMIN" (full_name,email,phone,password) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING RETURNING admin_id',
    [ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, password],
  );
  console.log(result.rowCount ? 'Admin created successfully' : 'Admin already exists; no changes made');
} finally {
  await client.end();
}
