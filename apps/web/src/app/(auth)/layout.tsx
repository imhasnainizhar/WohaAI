import { WohaLogo } from "@/components/ui/WohaLogo";
import { AuthCacheProvider } from "@/providers/AuthCacheProvider";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCacheProvider>
      <div className={`flex flex-col w-full h-full`}>
        <div className={`flex justify-start mt-6 ml-6`}>
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center">
              <WohaLogo />
            </div>
            <span className={`leading-tight! font-bold font-gerogia-sans`}>WohaAI</span>
          </Link>
        </div>
        {children}
      </div>
    </AuthCacheProvider>
  );
}