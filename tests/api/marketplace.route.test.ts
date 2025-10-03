import { makeGet, makePost } from "../utils/mock-request"
import { jest } from "@jest/globals"

// Build a mutable prisma mock object that the route module will use
const prismaMock = {
  marketplace: {
    findUnique: async (_: any) => null,
    findMany: async () => [],
    upsert: async (_: any) => null as any,
    delete: async (_: any) => undefined,
  },
}

// Mock prisma import used by the route handlers
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: prismaMock,
}))

// Important: import after the mock so the module uses our mock
import { GET, POST, DELETE } from "@/app/api/marketplace/route"

describe("Marketplace API", () => {
  beforeEach(() => {
    // Reset default implementations
    prismaMock.marketplace.findUnique = async () => null
    prismaMock.marketplace.findMany = async () => []
    prismaMock.marketplace.upsert = async () => null as any
    prismaMock.marketplace.delete = async () => undefined
  })

  it("GET returns all marketplaces", async () => {
    const items = [
      {
        id: "m1",
        name: "Amazon",
        attributes: [],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        _count: { mappings: 0 },
      },
      {
        id: "m2",
        name: "eBay",
        attributes: [],
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
        _count: { mappings: 1 },
      },
    ]
    prismaMock.marketplace.findMany = async () => items as any

    const res = await GET(makeGet("http://localhost/api/marketplace") as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
  })

  it("GET by id returns 404 when not found", async () => {
    prismaMock.marketplace.findUnique = async () => null

    const res = await GET(makeGet("http://localhost/api/marketplace?id=missing") as any)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/not found/i)
  })

  it("POST creates a new marketplace (201)", async () => {
    const now = new Date("2024-02-01T00:00:00Z")
    prismaMock.marketplace.upsert = async () =>
      ({
        id: "new-id",
        name: "NewMarket",
        attributes: [],
        createdAt: now,
        updatedAt: now, // equal -> created
      }) as any

    const res = await POST(
      makePost("http://localhost/api/marketplace", {
        name: "NewMarket",
        attributes: [],
      }) as any,
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.action).toBe("created")
  })

  it("POST updates an existing marketplace (200)", async () => {
    prismaMock.marketplace.upsert = async () =>
      ({
        id: "existing",
        name: "Existing",
        attributes: [{ name: "color", type: "string", required: false }],
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"), // different -> updated
      }) as any

    const res = await POST(
      makePost("http://localhost/api/marketplace", {
        name: "Existing",
        attributes: [{ name: "color", type: "string", required: false }],
      }) as any,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.action).toBe("updated")
  })

  it("DELETE requires id (400)", async () => {
    const res = await DELETE(makeGet("http://localhost/api/marketplace") as any)
    expect(res.status).toBe(400)
  })

  it("DELETE returns 404 when marketplace not found", async () => {
    prismaMock.marketplace.findUnique = async () => null
    const res = await DELETE(makeGet("http://localhost/api/marketplace?id=x") as any)
    expect(res.status).toBe(404)
  })

  it("DELETE success returns message and deletedMappings count", async () => {
    prismaMock.marketplace.findUnique = async () =>
      ({
        id: "to-del",
        _count: { mappings: 3 },
      }) as any

    let deletedId: string | null = null
    prismaMock.marketplace.delete = async (args: any) => {
      deletedId = args.where.id
    }

    const res = await DELETE(makeGet("http://localhost/api/marketplace?id=to-del") as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.deletedMappings).toBe(3)
    expect(deletedId).toBe("to-del")
  })
})
