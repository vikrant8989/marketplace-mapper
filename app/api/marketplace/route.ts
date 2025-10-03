// app/api/marketplace/route.ts
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for marketplace template
const marketplaceSchema = z.object({
  name: z.string().min(1, 'Marketplace name is required'),
  attributes: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'enum', 'array', 'boolean']),
      required: z.boolean().default(false),
      maxLength: z.number().optional(),
      minValue: z.number().optional(),
      enumValues: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
  ),
})

// GET - Fetch all marketplace templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Get specific marketplace
    if (id) {
      const marketplace = await prisma.marketplace.findUnique({
        where: { id },
        include: {
          _count: {
            select: { mappings: true },
          },
        },
      })

      if (!marketplace) {
        return NextResponse.json(
          { success: false, error: 'Marketplace not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: marketplace,
      })
    }

    // Get all marketplaces
    const marketplaces = await prisma.marketplace.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { mappings: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: marketplaces,
    })
  } catch (error) {
    console.error('Error fetching marketplaces:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch marketplaces',
      },
      { status: 500 }
    )
  }
}

// POST - Create or Update marketplace template (UPSERT)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = marketplaceSchema.parse(body)

    // Use upsert: Update if exists, Create if new
    const marketplace = await prisma.marketplace.upsert({
      where: {
        name: validatedData.name,
      },
      update: {
        attributes: validatedData.attributes,
      },
      create: {
        name: validatedData.name,
        attributes: validatedData.attributes,
      },
    })

    // Check if it was created or updated
    const isNewRecord = marketplace.createdAt.getTime() === marketplace.updatedAt.getTime()

    return NextResponse.json(
      {
        success: true,
        data: marketplace,
        message: isNewRecord
          ? 'Marketplace template created successfully'
          : 'Marketplace template updated successfully',
        action: isNewRecord ? 'created' : 'updated',
      },
      { status: isNewRecord ? 201 : 200 }
    )
  } catch (error) {
    console.error('Error creating/updating marketplace:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create/update marketplace template',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete marketplace template by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Marketplace ID is required',
        },
        { status: 400 }
      )
    }

    // Check if marketplace exists and has mappings
    const marketplace = await prisma.marketplace.findUnique({
      where: { id },
      include: {
        _count: {
          select: { mappings: true },
        },
      },
    })

    if (!marketplace) {
      return NextResponse.json(
        {
          success: false,
          error: 'Marketplace not found',
        },
        { status: 404 }
      )
    }

    // Delete marketplace (mappings will be cascade deleted)
    await prisma.marketplace.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Marketplace template deleted successfully',
      deletedMappings: marketplace._count.mappings,
    })
  } catch (error) {
    console.error('Error deleting marketplace:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete marketplace template',
      },
      { status: 500 }
    )
  }
}