import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const text = await request.text()
    let body
    try {
        body = JSON.parse(text)
    } catch {
        return new NextResponse('Invalid JSON', { 
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
    }
    
    const { publicKey, eventType, url, referrer, userAgent } = body

    if (!publicKey || !eventType) {
        return new NextResponse('Missing fields', { 
            status: 400, 
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
    }

    const widget = await prisma.widget.findUnique({
      where: { publicKey },
      select: { id: true }
    })

    if (!widget) {
        return new NextResponse('Widget not found', { 
            status: 404,
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
    }

    const date = new Date()
    const dateOnly = new Date(date.toISOString().split('T')[0])
    const hour = date.getHours()

    // Simple upsert for analytics
    await prisma.widgetAnalytics.upsert({
      where: {
        widgetId_eventType_date_hour_country_device: {
          widgetId: widget.id,
          eventType,
          date: dateOnly,
          hour,
          country: 'unknown', // Placeholder
          device: 'unknown'   // Placeholder
        }
      },
      update: {
        count: { increment: 1 }
      },
      create: {
        widgetId: widget.id,
        eventType,
        date: dateOnly,
        hour,
        country: 'unknown',
        device: 'unknown',
        count: 1
      }
    })

    return new NextResponse('OK', {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return new NextResponse('Internal Error', { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
