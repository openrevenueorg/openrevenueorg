import { OpenPanel } from '@openpanel/nextjs';
 
export const op = new OpenPanel({
  clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID || 'e1621a60-19bd-4606-a33a-9fa6cfebd1db',
  clientSecret: process.env.OPEN_PANEL_SECRET || 'sec_1111aa7287d4e151b770',
  trackScreenViews: true,
  trackOutgoingLinks: true,
  trackAttributes: true,
});
 