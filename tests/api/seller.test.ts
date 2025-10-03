export type SellerTestResult = {
  id: string
  filename: string
}

export async function testSeller(baseUrl: string): Promise<SellerTestResult> {
  const filename = `test-${Date.now()}.csv`
  const columns = [{ name: "sku" }, { name: "title" }]

  // Create or upsert seller file
  const postRes = await fetch(`${baseUrl}/api/seller`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename, columns }),
  })
  if (!postRes.ok) {
    const body = await postRes.text()
    throw new Error(`POST /api/seller failed: ${postRes.status} ${body}`)
  }
  const postJson = await postRes.json()
  if (!postJson?.success || !postJson?.data?.id) {
    throw new Error(`POST /api/seller unexpected response: ${JSON.stringify(postJson)}`)
  }
  const sellerId: string = postJson.data.id

  // GET by id
  const getOneRes = await fetch(`${baseUrl}/api/seller?id=${encodeURIComponent(sellerId)}`)
  if (!getOneRes.ok) {
    const body = await getOneRes.text()
    throw new Error(`GET /api/seller?id= failed: ${getOneRes.status} ${body}`)
  }
  const getOneJson = await getOneRes.json()
  if (!getOneJson?.success || getOneJson?.data?.id !== sellerId) {
    throw new Error(`GET /api/seller?id unexpected response: ${JSON.stringify(getOneJson)}`)
  }

  // GET all
  const getAllRes = await fetch(`${baseUrl}/api/seller`)
  if (!getAllRes.ok) {
    const body = await getAllRes.text()
    throw new Error(`GET /api/seller failed: ${getAllRes.status} ${body}`)
  }
  const getAllJson = await getAllRes.json()
  if (!getAllJson?.success || !Array.isArray(getAllJson?.data)) {
    throw new Error(`GET /api/seller unexpected response: ${JSON.stringify(getAllJson)}`)
  }

  return { id: sellerId, filename }
}
