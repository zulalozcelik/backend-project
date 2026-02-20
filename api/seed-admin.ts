/**
 * Admin seed script — ADMIN rolünde test kullanıcısı oluşturur.
 * Tek seferlik kullanım: npx ts-node seed-admin.ts
 */
import postgres from 'postgres';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL tanımlı değil!');
    process.exit(1);
}

const client = postgres(connectionString);

async function seedAdmin() {
    const email = 'admin@test.com';
    const password = 'Admin123!';
    const name = 'Admin User';

    // Zaten var mı?
    const existing = await client`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;

    if (existing.length > 0) {
        console.log(`⚠️  ${email} zaten mevcut. Role'ünü ADMIN'e güncelliyoruz...`);
        await client`
      UPDATE users SET role = 'ADMIN', updated_at = NOW()
      WHERE email = ${email}
    `;
        console.log('✅ Role güncellendi: ADMIN');
    } else {
        const hash = await bcrypt.hash(password, 10);
        const [user] = await client`
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES (${name}, ${email}, ${hash}, 'ADMIN', NOW(), NOW())
      RETURNING id, email, role
    `;
        console.log('✅ Admin kullanıcı oluşturuldu:', user);
    }

    console.log('\n📋 Test bilgileri:');
    console.log(`   Email   : ${email}`);
    console.log(`   Şifre   : ${password}`);
    console.log('   Role    : ADMIN\n');

    await client.end();
}

seedAdmin().catch((err) => {
    console.error('❌ Hata:', err);
    process.exit(1);
});
