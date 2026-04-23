import GymsFunnel from '@/components/gyms/gyms-funnel';

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <GymsFunnel locale={locale} />
      </div>
    </main>
  );
}