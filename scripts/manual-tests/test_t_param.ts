import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

async function test() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  const ranges = ["AGG_Faturamento_Mensal!A:D"]

  const params = new URLSearchParams({
    valueRenderOption: "UNFORMATTED_VALUE",
    key: apiKey,
  })
  ranges.forEach((range) => params.append("ranges", range))

  params.set("_t", Date.now().toString())

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params}`
  console.log("Requesting URL:", url)

  try {
    const res = await fetch(url)
    const body = await res.text()
    console.log("Status:", res.status)
    console.log("Response Body:", body)
  } catch (err) {
    console.error("Fetch error:", err)
  }
}

test()
