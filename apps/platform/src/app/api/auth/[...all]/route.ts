// import { auth } from '@/lib/auth';
// import { toNextJsHandler } from 'better-auth/next-js';

// export const { GET, POST } = toNextJsHandler(auth.handler);
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth.handler);
