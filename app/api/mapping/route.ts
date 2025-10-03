// app/api/mappings/route.ts
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Validation schema for mapping
const mappingSchema = z.object({
  marketplaceId: z.string().min(1, "Marketplace ID is required"),
  sellerFileId: z.string().min(1, "Seller file ID is required"),
  columnMapping: z.record(z.string(), z.string()), // {sellerColumn: marketplaceAttribute}
})

// POST - Create or Update mapping (UPSERT)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = mappingSchema.parse(body)

    // Verify marketplace exists
    const marketplace = await prisma.marketplace.findUnique({
      where: { id: validatedData.marketplaceId },
    })

    if (!marketplace) {
      return NextResponse.json(
        { success: false, error: "Marketplace not found" },
        { status: 404 }
      )
    }

    // Verify seller file exists
    const sellerFile = await prisma.sellerFile.findUnique({
      where: { id: validatedData.sellerFileId },
    })

    if (!sellerFile) {
      return NextResponse.json(
        { success: false, error: "Seller file not found. Please upload the file first." },
        { status: 404 }
      )
    }

    // Use upsert: Update if mapping exists, Create if new
    const mapping = await prisma.mapping.upsert({
      where: {
        marketplaceId_sellerFileId: {
          marketplaceId: validatedData.marketplaceId,
          sellerFileId: validatedData.sellerFileId,
        },
      },
      update: {
        columnMapping: validatedData.columnMapping,
      },
      create: {
        marketplaceId: validatedData.marketplaceId,
        sellerFileId: validatedData.sellerFileId,
        columnMapping: validatedData.columnMapping,
      },
      include: {
        marketplace: true,
        sellerFile: true,
      },
    })

    // Check if it was created or updated
    const isNewRecord = mapping.createdAt.getTime() === mapping.updatedAt.getTime()

    return NextResponse.json(
      {
        success: true,
        data: {
          id: mapping.id,
          marketplaceId: mapping.marketplaceId,
          marketplaceName: mapping.marketplace.name,
          marketplaceAttributes: mapping.marketplace.attributes,
          sellerFileId: mapping.sellerFileId,
          sellerFilename: mapping.sellerFile.filename,
          sellerColumns: mapping.sellerFile.columns,
          columnMapping: mapping.columnMapping,
          createdAt: mapping.createdAt.toISOString(),
          updatedAt: mapping.updatedAt.toISOString(),
        },
        message: isNewRecord 
          ? "Mapping created successfully" 
          : "Mapping updated successfully",
        action: isNewRecord ? "created" : "updated",
      },
      { status: isNewRecord ? 201 : 200 }
    )
  } catch (error) {
    console.error("Error creating/updating mapping:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create/update mapping" },
      { status: 500 }
    )
  }
}

// GET - Fetch mappings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const marketplaceId = searchParams.get("marketplaceId")
    const sellerFileId = searchParams.get("sellerFileId")

    // Get specific mapping by ID
    if (id) {
      const mapping = await prisma.mapping.findUnique({
        where: { id },
        include: {
          marketplace: true,
          sellerFile: true,
        },
      })

      if (!mapping) {
        return NextResponse.json(
          { success: false, error: "Mapping not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: mapping.id,
          marketplaceId: mapping.marketplaceId,
          marketplaceName: mapping.marketplace.name,
          marketplaceAttributes: mapping.marketplace.attributes,
          sellerFileId: mapping.sellerFileId,
          sellerFilename: mapping.sellerFile.filename,
          sellerColumns: mapping.sellerFile.columns,
          columnMapping: mapping.columnMapping,
          createdAt: mapping.createdAt.toISOString(),
          updatedAt: mapping.updatedAt.toISOString(),
        },
      })
    }

    // Get mapping by marketplace and seller file
    if (marketplaceId && sellerFileId) {
      const mapping = await prisma.mapping.findUnique({
        where: {
          marketplaceId_sellerFileId: {
            marketplaceId,
            sellerFileId,
          },
        },
        include: {
          marketplace: true,
          sellerFile: true,
        },
      })

      if (!mapping) {
        return NextResponse.json(
          { success: false, error: "Mapping not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: mapping.id,
          marketplaceId: mapping.marketplaceId,
          marketplaceName: mapping.marketplace.name,
          marketplaceAttributes: mapping.marketplace.attributes,
          sellerFileId: mapping.sellerFileId,
          sellerFilename: mapping.sellerFile.filename,
          sellerColumns: mapping.sellerFile.columns,
          columnMapping: mapping.columnMapping,
          createdAt: mapping.createdAt.toISOString(),
          updatedAt: mapping.updatedAt.toISOString(),
        },
      })
    }

    // Get all mappings
    const mappings = await prisma.mapping.findMany({
      include: {
        marketplace: true,
        sellerFile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: mappings.map((mapping : any) => ({
        id: mapping.id,
        marketplaceId: mapping.marketplaceId,
        marketplaceName: mapping.marketplace.name,
        sellerFileId: mapping.sellerFileId,
        sellerFilename: mapping.sellerFile.filename,
        columnMapping: mapping.columnMapping,
        mappingCount: Object.keys(mapping.columnMapping as Record<string, string>).filter(
          (key) => (mapping.columnMapping as Record<string, string>)[key]
        ).length,
        createdAt: mapping.createdAt.toISOString(),
        updatedAt: mapping.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching mappings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch mappings" },
      { status: 500 }
    )
  }
}

// DELETE - Delete mapping by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Mapping ID is required" },
        { status: 400 }
      )
    }

    const mapping = await prisma.mapping.findUnique({
      where: { id },
    })

    if (!mapping) {
      return NextResponse.json(
        { success: false, error: "Mapping not found" },
        { status: 404 }
      )
    }

    await prisma.mapping.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Mapping deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting mapping:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete mapping" },
      { status: 500 }
    )
  }
}