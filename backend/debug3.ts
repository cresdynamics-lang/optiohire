import { query } from './src/db/index.js'
import dotenv from 'dotenv'
dotenv.config()
async function run() {
  try {
    const { rows } = await query('SELECT * FROM company_email_templates')
    console.log(JSON.stringify(rows, null, 2))
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
