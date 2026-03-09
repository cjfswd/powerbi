import { google } from "googleapis"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

async function run() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY

  const sheets = google.sheets({ version: "v4", auth: apiKey })
  const ranges = [
    "AGG_Operadoras!A:D",
    "Procedimentos_Realizados!A:K",
    "Pacientes!A:K",
  ]

  try {
    console.log("Fetching ranges...")
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const valueRanges = res.data.valueRanges || []

    console.log("--- AGG_Operadoras (First 5 rows) ---")
    console.log(valueRanges[0].values?.slice(0, 5))

    console.log("--- Procedimentos_Realizados (First 2 rows) ---")
    console.log(valueRanges[1].values?.slice(0, 2))

    console.log("--- Pacientes (First 2 rows) ---")
    console.log(valueRanges[2].values?.slice(0, 2))
  } catch (err) {
    console.error("Error fetching data:", err)
  }
}

run()
