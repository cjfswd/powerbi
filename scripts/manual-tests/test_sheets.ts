import { getGoogleSheetsClient } from "../../api/lib/google.js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

async function run() {
  const sheets = getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  console.log("Fetching REF_Procedimentos...")
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "REF_Procedimentos!A:G",
  })

  const rows = result.data.values || []
  console.log("Total rows:", rows.length)

  if (rows.length > 1) {
    console.log("First data row:")
    console.log(JSON.stringify(rows[1]))
    console.log("Exact length of procedimento string:", rows[1][0].length)
    console.log("String boundaries:", `"${rows[1][0]}"`)
    return
  }

  console.log("No data rows found.")
}

run().catch(console.error)
