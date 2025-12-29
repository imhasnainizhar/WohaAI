import SignupFlow from "@components/auth/signup/flow";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>
    <div className="z-110 w-full h-full absolute flex items-center justify-center bg-bg-primary">
      <SignupFlow />
    </div>
    {children}
  </main>;
}