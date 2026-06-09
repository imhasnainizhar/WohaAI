import { AuthCacheProvider } from "@/providers/AuthCacheProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return ( 
  <main>
    <AuthCacheProvider>
      {children}
    </AuthCacheProvider>
  </main>
  );
}