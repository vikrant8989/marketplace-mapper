export type MappingTestResult = {
  id: string
}

export async function testMapping(
  baseUrl: string,
  marketplaceId: string,
  sellerFileId: string,
): Promise<MappingTestResult> {
  const columnMapping = {
    sku: "sku",
    title: "title",
  }

  // Create or upsert mapping
  const postRes = await fetch(`${baseUrl}/api/mapping`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ marketplaceId, sellerFileId, columnMapping }),
  })
  if (!postRes.ok) {
    const body = await postRes.text()
    throw new Error(`POST /api/mapping failed: ${postRes.status} ${body}`)
  }
  const postJson = await postRes.json()
  if (!postJson?.success || !postJson?.data?.id) {
    throw new Error(`POST /api/mapping unexpected response: ${JSON.stringify(postJson)}`)
  }
  const mappingId: string = postJson.data.id

  // GET by id
  const getById = await fetch(`${baseUrl}/api/mapping?id=${encodeURIComponent(mappingId)}`)
  if (!getById.ok) {
    const body = await getById.text()
    throw new Error(`GET /api/mapping?id failed: ${getById.status} ${body}`)
  }
  const getByIdJson = await getById.json()
  if (!getByIdJson?.success || getByIdJson?.data?.id !== mappingId) {
    throw new Error(`GET /api/mapping?id unexpected response: ${JSON.stringify(getByIdJson)}`)
  }

  // GET by marketplaceId & sellerFileId
  const getByPair = await fetch(
    `${baseUrl}/api/mapping?marketplaceId=${encodeURIComponent(marketplaceId)}&sellerFileId=${encodeURIComponent(sellerFileId)}`,
  )
  if (!getByPair.ok) {
    const body = await getByPair.text()
    throw new Error(`GET /api/mapping?marketplaceId&sellerFileId failed: ${getByPair.status} ${body}`)
  }
  const getByPairJson = await getByPair.json()
  if (!getByPairJson?.success || getByPairJson?.data?.id !== mappingId) {
    throw new Error(`GET /api/mapping by pair unexpected response: ${JSON.stringify(getByPairJson)}`)
  }

  return { id: mappingId }
}
