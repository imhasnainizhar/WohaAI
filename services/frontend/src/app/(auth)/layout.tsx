import Signup from "@components/auth/signup/signup";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>
    <div className="z-190 w-full h-full absolute flex items-center justify-center bg-bg-primary">
    <Signup />
    </div>
    {children}
    </main>;
}