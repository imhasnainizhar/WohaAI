import SignupFlow from "@/components/auth/signup/SignupFlow";
import { AuthCacheProvider } from "@/providers/AuthCacheProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>
    <AuthCacheProvider>
    <div className="z-110 w-full h-full absolute flex items-center justify-center bg-bg-primary">
      <SignupFlow />
    </div>
    {children}
    </AuthCacheProvider>
  </main>;
}