import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('previews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Supabase query failed:', error.message)

    return NextResponse.json(
      { error: 'Gagal mengambil data' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
