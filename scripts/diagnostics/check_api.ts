async function check() {
  try {
    const res = await fetch("http://localhost:3005/api/sheets")
    const data = await res.json()
    console.log("Distribuicao Assistencia:", JSON.stringify(data.distribuicaoAssistencia, null, 2))
    console.log("Perfil Sexo:", JSON.stringify(data.perfilSexo, null, 2))
    console.log("Tipo Acomodacao:", JSON.stringify(data.tipoAcomodacao, null, 2))
  } catch (e: any) {
    console.error("Error:", e.message)
  }
}

check()
