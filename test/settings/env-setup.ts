import * as dotenv from "dotenv";
import * as path from "path";

console.log(`============ env-setup Loaded ===========`);
//process.env.DEFAULT_DB_DROP_SCHEMA = 'true';
dotenv.config({ path: path.resolve(process.cwd(), 'test', 'settings', '.test.env') });