import { NextResponse } from 'next/server'
import { jobSourceRegistry } from '@/lib/sources'

export async function GET() {
  const providers = jobSourceRegistry.getAll().map(p => ({ id: p.id, name: p.name, available: p.isAvailable() }))
  return NextResponse.json({ providers })
}
