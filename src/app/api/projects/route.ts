import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { turso, initDatabase } from '@/lib/turso';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const portfolioId = body.portfolio_id || body.portfolio;
    const { title, description, image, github_url, live_url, technologies, featured, link_type, category, embed_url, links } = body;

    if (!portfolioId || !title) {
      return NextResponse.json({ error: 'Portfolio ID and Title are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();

    await turso.execute({
      sql: `INSERT INTO projects (
        id, portfolio_id, title, description, image, github_url, live_url, technologies, featured, link_type, category, embed_url, links
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        portfolioId,
        title,
        description || '',
        image || null,
        github_url || null,
        live_url || null,
        JSON.stringify(technologies || []),
        featured ? 1 : 0,
        link_type || 'none',
        category || 'Other',
        embed_url || '',
        JSON.stringify(links || []),
      ],
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, image, github_url, live_url, technologies, featured, link_type, category, embed_url, links } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await turso.execute({
      sql: `UPDATE projects SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        image = ?,
        github_url = ?,
        live_url = ?,
        technologies = COALESCE(?, technologies),
        featured = COALESCE(?, featured),
        link_type = COALESCE(?, link_type),
        category = COALESCE(?, category),
        embed_url = COALESCE(?, embed_url),
        links = COALESCE(?, links)
      WHERE id = ?`,
      args: [
        title,
        description,
        image !== undefined ? image : null,
        github_url !== undefined ? github_url : null,
        live_url !== undefined ? live_url : null,
        technologies !== undefined ? JSON.stringify(technologies) : null,
        featured !== undefined ? (featured ? 1 : 0) : null,
        link_type,
        category,
        embed_url,
        links !== undefined ? JSON.stringify(links) : null,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating project:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
