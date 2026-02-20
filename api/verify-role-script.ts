
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { users } from './src/core/database/schema';

dotenv.config({ path: '../.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function verify() {
    console.log('Verifying database schema...');

    // Check column existence
    const result = await client`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role';
  `;

    if (result.length > 0) {
        console.log('✅ Role column exists:', result[0]);
    } else {
        console.error('❌ Role column missing!');
    }

    // Check data
    const userList = await db.select().from(users).limit(1);
    if (userList.length > 0) {
        console.log('First user found:', userList[0]);
        console.log('Role value:', userList[0].role);
    } else {
        console.log('No users found in database to check default value.');
    }

    await client.end();
}

verify().catch((err) => {
    console.error(err);
    process.exit(1);
});
