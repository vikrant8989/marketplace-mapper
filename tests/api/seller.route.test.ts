import { makeGet, makePost } from "../utils/mock-request"
import { jest } from "@jest/globals"

const prismaMock = {
  sellerFile: {
    findUnique: async (_: any) => null,
    findMany: async () => [],
    upsert: async (_: any) => null as any,
    delete: async (_: any) => undefined,
  },
}

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: prismaMock,
}))

import { GET, POST, DELETE } from "@/app/api/seller/route"

describe("Seller Files API", () => {
  beforeEach(() => {
    prismaMock.sellerFile.findUnique = async () => null
    prismaMock.sellerFile.findMany = async () => []
    prismaMock.sellerFile.upsert = async () => null as any
    prismaMock.sellerFile.delete = async () => undefined
  })

  it("GET returns all seller files", async () => {
    prismaMock.sellerFile.findMany = async () =>
      [
        {
          id: "f1",
          filename: "file1.csv",
          columns: [],
          uploadedAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          _count: { mappings: 0 },
        },
      ] as any

    const res = await GET(makeGet("http://localhost/api/seller-files") as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it("GET by id returns 404 when not found", async () => {
    prismaMock.sellerFile.findUnique = async () => null
    const res = await GET(makeGet("http://localhost/api/seller-files?id=missing") as any)
    expect(res.status).toBe(404)
  })

  it("POST creates a new seller file (201)", async () => {
    const t = new Date("2024-02-01T00:00:00Z")
    prismaMock.sellerFile.upsert = async () =>
      ({
        id: "sf1",
        filename: "items.csv",
        columns: [],
        uploadedAt: t,
        updatedAt: t, // equal -> created
      }) as any

    const res = await POST(
      makePost("http://localhost/api/seller-files", {
        filename: "items.csv",
        columns: [],
      }) as any,
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.action).toBe("created")
  })

  it("DELETE requires id (400)", async () => {
    const res = await DELETE(makeGet("http://localhost/api/seller-files") as any)
    expect(res.status).toBe(400)
  })
})
