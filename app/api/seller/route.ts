// app/api/seller-files/route.ts
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for SellerFile
const sellerFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  columns: z.array(
    z.object({
      name: z.string(),
      type: z.string().optional(),
      sampleData: z.array(z.string()).optional(),
    })
  ),
})

// GET - Fetch seller files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Get specific seller file
    if (id) {
      const file = await prisma.sellerFile.findUnique({
        where: { id },
        include: {
          _count: {
            select: { mappings: true },
          },
        },
      })

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Seller file not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: file,
      })
    }

    // Get all seller files
    const files = await prisma.sellerFile.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        _count: {
          select: { mappings: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: files,
    })
  } catch (error) {
    console.error('Error fetching seller files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller files' },
      { status: 500 }
    )
  }
}

// POST - Upload seller file metadata (with UPSERT)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = sellerFileSchema.parse(body)

    // Use upsert: Update if same filename exists, Create if new
    const sellerFile = await prisma.sellerFile.upsert({
      where: {
        filename: validatedData.filename,
      },
      update: {
        columns: validatedData.columns,
      },
      create: {
        filename: validatedData.filename,
        columns: validatedData.columns,
      },
    })

    // Check if it was created or updated
    const isNewRecord = sellerFile.uploadedAt.getTime() === sellerFile.updatedAt.getTime()

    return NextResponse.json(
      {
        success: true,
        data: sellerFile,
        message: isNewRecord
          ? 'Seller file uploaded successfully'
          : 'Seller file updated successfully',
        action: isNewRecord ? 'created' : 'updated',
      },
      { status: isNewRecord ? 201 : 200 }
    )
  } catch (error) {
    console.error('Error uploading seller file:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload seller file' },
      { status: 500 }
    )
  }
}

// DELETE - Delete seller file by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Seller file ID is required' },
        { status: 400 }
      )
    }

    // Check if seller file exists and has mappings
    const sellerFile = await prisma.sellerFile.findUnique({
      where: { id },
      include: {
        _count: {
          select: { mappings: true },
        },
      },
    })

    if (!sellerFile) {
      return NextResponse.json(
        { success: false, error: 'Seller file not found' },
        { status: 404 }
      )
    }

    // Delete seller file (mappings will be cascade deleted)
    await prisma.sellerFile.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Seller file deleted successfully',
      deletedMappings: sellerFile._count.mappings,
    })
  } catch (error) {
    console.error('Error deleting seller file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete seller file' },
      { status: 500 }
    )
  }
}