type MarketplaceAttr = {
  name: string
  type: "string" | "number" | "enum" | "array" | "boolean"
  required?: boolean
  maxLength?: number
  minValue?: number
  enumValues?: string[]
  description?: string
}

export type MarketplaceTestResult = {
  id: string
  name: string
}

export async function testMarketplace(baseUrl: string): Promise<MarketplaceTestResult> {
  const name = `Test Market ${Date.now()}`
  const attributes: MarketplaceAttr[] = [
    { name: "sku", type: "string", required: true },
    { name: "title", type: "string", required: true },
  ]

  // Create or upsert marketplace
  const postRes = await fetch(`${baseUrl}/api/marketplace`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, attributes }),
  })
  if (!postRes.ok) {
    const body = await postRes.text()
    throw new Error(`POST /api/marketplace failed: ${postRes.status} ${body}`)
  }
  const postJson = await postRes.json()
  if (!postJson?.success || !postJson?.data?.id) {
    throw new Error(`POST /api/marketplace unexpected response: ${JSON.stringify(postJson)}`)
  }
  const marketplaceId: string = postJson.data.id

  // GET by id
  const getOneRes = await fetch(`${baseUrl}/api/marketplace?id=${encodeURIComponent(marketplaceId)}`)
  if (!getOneRes.ok) {
    const body = await getOneRes.text()
    throw new Error(`GET /api/marketplace?id= failed: ${getOneRes.status} ${body}`)
  }
  const getOneJson = await getOneRes.json()
  if (!getOneJson?.success || getOneJson?.data?.id !== marketplaceId) {
    throw new Error(`GET /api/marketplace?id unexpected response: ${JSON.stringify(getOneJson)}`)
  }

  // GET all
  const getAllRes = await fetch(`${baseUrl}/api/marketplace`)
  if (!getAllRes.ok) {
    const body = await getAllRes.text()
    throw new Error(`GET /api/marketplace failed: ${getAllRes.status} ${body}`)
  }
  const getAllJson = await getAllRes.json()
  if (!getAllJson?.success || !Array.isArray(getAllJson?.data)) {
    throw new Error(`GET /api/marketplace unexpected response: ${JSON.stringify(getAllJson)}`)
  }

  return { id: marketplaceId, name }
}
