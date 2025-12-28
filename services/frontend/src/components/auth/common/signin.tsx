// "use client";

// import Image from "next/image";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signInSchema } from "@lib/schemas/signin";
// import { useTheme } from "@providers/theme";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import z from "zod";
// import ClassicButton from "@components/ui/buttons/classic-button";
// import { RoundedInputField } from "@components/ui/input/fields/rounded";

// type SignInInput = z.infer<typeof signInSchema>;

// export default function SignIn() {
//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<SignInInput>({
//         resolver: zodResolver(signInSchema),
//     });

//     const router = useRouter();
//     const { theme } = useTheme();
//     const darkTheme = theme === "dark";

//     const [rememberMe, setRememberMe] = useState<boolean>(false);
//     const [signInError, setSignInError] = useState<string>("");

//     const SIGNIN_API_URI = process.env.NEXT_PUBLIC_SIGNIN_API_URI!;

//     const onSignIn = async (SignInData: SignInInput) => {
//         setSignInError("");

//         try {
//             const res = await fetch(SIGNIN_API_URI, {
//                 method: "POST",
//                 credentials: "include",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     ...SignInData,
//                     rememberMe,
//                 }),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 setSignInError(data.message || "Failed to sign in.");
//                 return;
//             }
//         } catch (error) {
//             console.error("SignIn Error:", error);
//             setSignInError("An unexpected error occurred. Please try again.");
//         }
//     };

//     return (
//         <div
//             className={`w-full h-[750px] flex items-center justify-center bg-bg-primary`}
//             data-theme={theme}
//         >

//             <div className="p-6 flex flex-col items-center justify-center rounded-[16px] gap-[30px] w-full h-[500px] max-w-[500px]">
//                 <div className="w-full">
//                     <div onClick={() => router.back()} className="flex items-center justify-end
//           w-auto text-[14px] text-text hover:text-gray-500 cursor-pointer hover:bg-hover transition-all duration-300 ease-in-out">X</div>
//                 </div>
//                 <div className="flex flex-col max-w-[340px] w-full justify-center items-center gap-[8px] mt-50px">
//                     <div className="flex flex-col items-center justify-center gap-[14px]">
//                         <div
//                             className={`font-sans font-semibold text-[26px] text-center text-text w-auto`}
//                         >
//                             Sign In or Sign Up
//                         </div>
//                         <div className="font-sans font-small text-text-secondary text-center max-w-[340px] max-h-[50px] px-4 mb-2">
//                             You’ll get smarter responses and can upload files, images, and more.
//                         </div>
//                     </div>
//                     <div
//                         onClick={() => {
//                             const redirectUri = encodeURIComponent("https://yourdomain.com/auth/google/callback");
//                             const clientId = "YOUR_GOOGLE_CLIENT_ID";
//                             const scope = encodeURIComponent("openid email profile");
//                             const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&prompt=select_account`;
//                             window.location.href = url;
//                         }}
//                         className="flex items-center justify-center cursor-pointer gap-[15px] relative w-full max-w-[340px] h-[50px] rounded-[50px] border border-border-secondary border-solid font-sans font-medium hover:bg-bg-btn-hover transition-all duration-300 ease-in-out">
//                         <span><Image src="/logos/google-logo-svg.svg" alt="google" width={24} height={24} /></span>
//                         <span
//                             className="text-text"
//                         >
//                             Sign in with Google
//                         </span>
//                     </div>
//                     <div className="relative w-full max-w-[340px] h-[1px] mt-[20px] bg-border-secondary">
//                         <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-primary w-[50px] text-center text-text-gray-muted">OR</p>
//                     </div>
//                     <form
//                         className="my-[20px] flex flex-col items-center justify-start gap-[20px] w-full max-w-[340px] h-auto"
//                         method="POST"
//                         onSubmit={handleSubmit(onSignIn)}
//                     >
//                         <RoundedInputField
//                             label="Email"
//                             name="email"
//                             register={register("email")}
//                             error={errors.email}
//                             theme={darkTheme ? "dark" : "light"}
//                             type="email"
//                         />
//                         <ClassicButton />

//                         {signInError && (
//                             <p className="error-textabsolute top-[45px] left-2.5 text-[12px] text-[#ff3535] w-auto" style={{ textAlign: "center", marginTop: "10px" }}>
//                                 {signInError}
//                             </p>
//                         )}
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }