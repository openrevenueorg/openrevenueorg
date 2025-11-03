// import NextAuth from '@/lib/auth';

// const handler = NextAuth();

// export { handler as GET, handler as POST };
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;