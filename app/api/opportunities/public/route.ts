import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const major = searchParams.get('major');

    const supabase = createServiceRoleClient();

    let query = supabase
      .from('opportunities')
      .select('id, title, leader_department, leader_name, description, relevant_majors, technical_disciplines, ai_summary')
      .eq('status', 'Recruiting')
      .order('created_at', { ascending: false })
      .limit(6);

    if (major && major !== 'all') {
      // Filter by relevant_majors containing the major (case-insensitive via ilike on array)
      query = query.or(
        `leader_department.ilike.%${major}%,relevant_majors.cs.{"${major}"}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Public opportunities fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    // Shape response for landing page
    const opportunities = (data ?? []).map((opp) => ({
      id: opp.id,
      title: opp.title,
      department: opp.leader_department,
      piName: opp.leader_name,
      description: opp.ai_summary || (opp.description ? opp.description.slice(0, 200) : ''),
      tags: [
        ...(opp.relevant_majors ?? []).slice(0, 2),
        ...(opp.technical_disciplines ?? []).slice(0, 1),
      ],
    }));

    return NextResponse.json(opportunities, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch (error) {
    console.error('Public opportunities error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
