import 'dotenv/config';
import { drizzle } from 'drizzle-orm/singlestore/driver';

const db = drizzle(process.env.DATABASE_URL!);

export { db };
