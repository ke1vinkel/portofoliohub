import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { initDatabase, ensureUserProfileAndPortfolio, queryAuthDb } from './turso';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text' },
        password: { label: 'NIM', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Email and Password are required');
        }

        const cleanEmail = credentials.username.trim().toLowerCase();
        const cleanNim = credentials.password.trim();

        try {
          await initDatabase();

          let userRow: any = null;

          // Central Auth lookup via direct HTTP fetch (avoids @libsql/client migration job check)
          try {
            const rows = await queryAuthDb(
              'SELECT id, email, nim, name, role_id FROM users WHERE LOWER(email) = ? AND nim = ? LIMIT 1',
              [cleanEmail, cleanNim]
            );
            if (rows.length > 0) {
              userRow = rows[0];
            }
          } catch (e) {
            console.error('Error querying Central Auth users table:', e);
            throw new Error('Authentication service unavailable. Please try again.');
          }

          if (!userRow) {
            throw new Error('Invalid Email or NIM. Please try again.');
          }

          const userId = String(userRow.id);
          const userName = String(userRow.name);
          const roleIdStr = String(userRow.role_id || '').toLowerCase().trim();
          const nimStr = String(cleanNim || userRow.nim || '').trim().toUpperCase();
          const isLecturerNim = /^D\d+/i.test(nimStr);
          const primaryRole: 'student' | 'lecturer' = (roleIdStr === '3' || roleIdStr === 'lecturer' || roleIdStr === 'dosen' || isLecturerNim) ? 'lecturer' : 'student';

          // Auto-provision profile & default portfolio in App Data DB
          await ensureUserProfileAndPortfolio(userId, userName);

          const nameSlug = userName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
          const emailSlug = (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail)
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '');

          const finalUsername = nameSlug || emailSlug || 'user';

          return {
            id: userId,
            name: userName,
            role: primaryRole,
            username: finalUsername || 'user',
            email: cleanEmail,
          };
        } catch (e: any) {
          console.error('Authentication failed:', e);
          throw new Error(e.message || 'Invalid Email or NIM');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60,
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dummy-secret',
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session?.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).name = token.name as string;
        (session.user as any).role = token.role as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
};
