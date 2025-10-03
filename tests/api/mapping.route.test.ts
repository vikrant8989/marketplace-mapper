import { makeGet, makePost } from "../utils/mock-request"
import { jest } from "@jest/globals"

const prismaMock = {
  marketplace: {
    findUnique: async (_: any) => null,
  },
  sellerFile: {
    findUnique: async (_: any) => null,
  },
  mapping: {
    upsert: async (_: any) => null as any,
    findUnique: async (_: any) => null as any,
    findMany: async () => [] as any[],
    delete: async (_: any) => undefined,
  },
}

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: prismaMock,
}))

import { GET, POST, DELETE } from "@/app/api/mapping/route"

describe("Mappings API", () => {
  beforeEach(() => {
    prismaMock.marketplace.findUnique = async () => null
    prismaMock.sellerFile.findUnique = async () => null
    prismaMock.mapping.upsert = async () => null as any
    prismaMock.mapping.findUnique = async () => null as any
    prismaMock.mapping.findMany = async () => []
    prismaMock.mapping.delete = async () => undefined
  })

  it("POST validates input with Zod (400)", async () => {
    // marketplaceId is empty -> validation error
    const res = await POST(
      makePost("http://localhost/api/mappings", {
        marketplaceId: "",
        sellerFileId: "sf1",
        columnMapping: {},
      }) as any,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/validation/i)
  })

  it("POST returns 404 if marketplace missing", async () => {
    prismaMock.marketplace.findUnique = async () => null
    const res = await POST(
      makePost("http://localhost/api/mappings", {
        marketplaceId: "m1",
        sellerFileId: "sf1",
        columnMapping: {},
      }) as any,
    )
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/Marketplace not found/i)
  })

  it("POST creates mapping (201) when new", async () => {
    const t = new Date("2024-02-01T00:00:00Z")
    prismaMock.marketplace.findUnique = async () => ({ id: "m1", name: "M", attributes: [] }) as any
    prismaMock.sellerFile.findUnique = async () => ({ id: "sf1", filename: "f.csv", columns: [] }) as any
    prismaMock.mapping.upsert = async () =>
      ({
        id: "map1",
        marketplaceId: "m1",
        sellerFileId: "sf1",
        columnMapping: { sku: "sku" },
        createdAt: t,
        updatedAt: t, // equal -> created
        marketplace: { id: "m1", name: "M", attributes: [] },
        sellerFile: { id: "sf1", filename: "f.csv", columns: [] },
      }) as any

    const res = await POST(
      makePost("http://localhost/api/mappings", {
        marketplaceId: "m1",
        sellerFileId: "sf1",
        columnMapping: { sku: "sku" },
      }) as any,
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.action).toBe("created")
    expect(body.data.marketplaceId).toBe("m1")
  })

  it("GET by id returns 404 when not found", async () => {
    prismaMock.mapping.findUnique = async () => null as any
    const res = await GET(makeGet("http://localhost/api/mappings?id=x") as any)
    expect(res.status).toBe(404)
  })

  it("GET all returns trimmed mapping list", async () => {
    prismaMock.mapping.findMany = async () =>
      [
        {
          id: "map1",
          marketplaceId: "m1",
          sellerFileId: "sf1",
          columnMapping: { a: "A", b: "B", c: "" },
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
          marketplace: { id: "m1", name: "M", attributes: [] },
          sellerFile: { id: "sf1", filename: "f.csv", columns: [] },
        },
      ] as any

    const res = await GET(makeGet("http://localhost/api/mappings") as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    // mappingCount counts non-empty values
    expect(body.data[0].mappingCount).toBe(2)
  })

  it("DELETE requires id (400)", async () => {
    const res = await DELETE(makeGet("http://localhost/api/mappings") as any)
    expect(res.status).toBe(400)
  })
})
