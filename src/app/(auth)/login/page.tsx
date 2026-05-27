import { LoginFlow } from "@/components/onboarding/login-flow";

type PageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return <LoginFlow message={params.message} error={params.error} />;
}
