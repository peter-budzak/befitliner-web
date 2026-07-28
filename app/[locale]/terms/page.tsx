import type {Metadata} from 'next';
import {
  buildLegalMetadata,
  LegalDocumentPage,
  type LegalPageProps
} from '../legal-page';

export function generateMetadata({params}: LegalPageProps): Promise<Metadata> {
  return buildLegalMetadata(params, 'terms');
}

export default function TermsPage({params}: LegalPageProps) {
  return <LegalDocumentPage params={params} document="terms" />;
}
