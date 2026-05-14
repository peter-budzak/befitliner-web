import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function PublicGymRedirectPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;

  redirect(`/g/${resolvedParams.slug}/sk`);
}
