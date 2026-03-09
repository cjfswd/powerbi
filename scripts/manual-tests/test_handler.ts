import handler from "../../api/sheets.ts"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

async function test() {
  const req = {
    url: "/api/sheets?_t=" + Date.now(),
    headers: { host: "localhost:3001" },
    query: { _t: Date.now().toString() },
  }

  const res = {
    status: (code: number) => {
      console.log("Status Code:", code)
      return res
    },
    json: (val: any) => {
      if (val.error) {
        console.error("Error Response:", val.error)
      } else {
        console.log("Success! Received data for keys:", Object.keys(val))
      }
      return res
    },
    setHeader: (name: string, value: string) => {
      console.log("Header:", name, "=", value)
      return res
    },
  }

  try {
    await handler(req, res)
  } catch (err) {
    console.error("Handler threw error:", err)
  }
}

test()
