import { createNextRouteHandler } from '@openpanel/nextjs/server';
 
export const POST = createNextRouteHandler({
  apiUrl: `api/op`,
});