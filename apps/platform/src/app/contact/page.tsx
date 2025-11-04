import { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://openrevenue.org'),
  title: 'Contact Us | OpenRevenue',
  description:
    `Get in touch with OpenRevenue. Have questions? Send us a message and we'll respond within 24 hours.`,
};

export default function ContactPage() {
  return <ContactForm />;
}
