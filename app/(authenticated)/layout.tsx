export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication requirement bypassed for direct preview & testing
  return <>{children}</>;
}
