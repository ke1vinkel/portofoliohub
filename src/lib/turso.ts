// Custom HTTP Client for Turso Database (bypasses @libsql/client migration job 400 check)
const rawPortoUrl = (process.env.TURSO_DATABASE_URL || '').replace('libsql://', '').replace('https://', '');
const rawPortoToken = process.env.TURSO_AUTH_TOKEN || '';

const rawAuthUrl = (process.env.AUTH_DATABASE_URL || '').replace('libsql://', '').replace('https://', '');
const rawAuthToken = process.env.AUTH_DATABASE_TOKEN || '';

interface TursoExecuteResult {
  rows: Record<string, any>[];
  columns: string[];
  affectedRows: number;
}

async function executeHttpQuery(
  hostname: string,
  token: string,
  stmt: string | { sql: string; args?: any[] }
): Promise<TursoExecuteResult> {
  const sql = typeof stmt === 'string' ? stmt : stmt.sql;
  const rawArgs = typeof stmt === 'string' ? [] : stmt.args || [];

  const formattedArgs = rawArgs.map((a) => {
    if (a === null || a === undefined) return { type: 'null' };
    if (typeof a === 'number') return { type: 'integer', value: String(a) };
    if (typeof a === 'boolean') return { type: 'integer', value: a ? '1' : '0' };
    return { type: 'text', value: String(a) };
  });

  const body = JSON.stringify({
    requests: [
      {
        type: 'execute',
        stmt: { sql, args: formattedArgs },
      },
      { type: 'close' },
    ],
  });

  const res = await fetch(`https://${hostname}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Turso HTTP error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  if (json?.results?.[0]?.type === 'error') {
    throw new Error(json.results[0].error?.message || 'Turso query execution error');
  }

  const result = json?.results?.[0]?.response?.result;
  if (!result) {
    return { rows: [], columns: [], affectedRows: 0 };
  }

  const cols: string[] = (result.cols || []).map((c: any) => c.name);
  const rows = (result.rows || []).map((row: any[]) => {
    const rowObj: Record<string, any> = {};
    row.forEach((cell: any, idx: number) => {
      const colName = cols[idx];
      let val = cell?.value ?? null;
      if (cell?.type === 'integer' && val !== null) {
        val = Number(val);
      }
      rowObj[colName] = val;
    });
    return rowObj;
  });

  return {
    rows,
    columns: cols,
    affectedRows: result.affected_row_count || 0,
  };
}

// 1. Portfolio Database Client (Portfolios, Projects, Experiences, Education)
export const turso = {
  execute(stmt: string | { sql: string; args?: any[] }): Promise<TursoExecuteResult> {
    return executeHttpQuery(rawPortoUrl, rawPortoToken, stmt);
  },
};

// 2. Central Auth Database Client
export async function queryAuthDb(
  sql: string,
  args: (string | number | null)[] = []
): Promise<Record<string, any>[]> {
  const result = await executeHttpQuery(rawAuthUrl, rawAuthToken, { sql, args });
  return result.rows;
}

let isInitialized = false;

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;
}

export async function ensureUserProfileAndPortfolio(userId: string, name: string) {
  try {
    const profileCheck = await turso.execute({
      sql: 'SELECT user_id FROM profiles WHERE user_id = ?',
      args: [userId],
    });

    if (profileCheck.rows.length === 0) {
      await turso.execute({
        sql: `INSERT INTO profiles (
          user_id, bio, avatar, show_avatar, major, university, location,
          skills, skill_descriptions, hero_badge_text, typing_words, sections
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          `Hello! I'm ${name}, welcome to my portfolio.`,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
          1,
          'Computer Science',
          'Binus University',
          'Jakarta, Indonesia',
          JSON.stringify(['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS']),
          JSON.stringify({
            'Next.js': 'App Router & Web Development',
            TypeScript: 'Strong type safety and clean code',
          }),
          '✦ Available for opportunities',
          JSON.stringify(['Software Developer', 'Engineering Student']),
          JSON.stringify({
            show_skills: true,
            show_projects: true,
            show_experience: true,
            show_education: true,
            show_contact: true,
          }),
        ],
      });

      const portCheck = await turso.execute({
        sql: 'SELECT id FROM portfolios WHERE user_id = ?',
        args: [userId],
      });

      if (portCheck.rows.length === 0) {
        const demoPortId = crypto.randomUUID();
        await turso.execute({
          sql: `INSERT INTO portfolios (id, user_id, title, slug, description, is_public) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            demoPortId,
            userId,
            `${name}'s Portfolio`,
            'main-portfolio',
            'Main portfolio showcasing projects and achievements.',
            1,
          ],
        });
      }
    }
  } catch (err) {
    console.error('Error ensuring profile and portfolio:', err);
  }
}
