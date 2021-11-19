import * as dotenv from 'dotenv';
import * as path from 'path';

console.log(`============ env-setup Loaded ===========`);
dotenv.config({
  path: path.resolve(process.cwd(), 'test', 'settings', '.test.env'),
});
