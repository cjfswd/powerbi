import handler from "../../api/sheets"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const req = {
  url: "/api/sheets",
  headers: { host: "localhost" },
  query: {},
}

const res = {
  status: (code: number) => {
    console.log("Status:", code)
    return res
  },
  json: (data: unknown) => {
    console.log("JSON Response:", JSON.stringify(data, null, 2))
    return res
  },
  setHeader: (name: string, value: string) => {
    console.log("Header:", name, "=", value)
  },
}

async function run() {
  try {
    console.log("Starting handler...")
    await handler(req as any, res as any)
    console.log("Handler finished.")
  } catch (err) {
    console.error("CRASH:", err)
  }
}

run()
