import { cookies } from "next/headers";
import { Metadata } from "next";
import Image from "next/image";
import "@styles/theme/main.global.css";
import "boxicons/css/boxicons.min.css";
import TextArea from "@components/functional-comps/textareaa";
import SideBar from "@components/layout/sidecart";

export const metadata: Metadata = {
  title: "Woah AI",
  description: "Chat with you AI Partner with Privacy.",
};

type Theme = "dark" | "light";

export default async function Home() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("theme")?.value;
  console.log("SSR Theme Cookie:", cookieTheme);
  const darkTheme = cookieTheme === "dark";

  return (
    <main
      className={`home-page ${
        darkTheme
          ? "bg-dark-black-primary text-dark-white-secondary"
          : "bg-light-white-primary text-light-black-secondary"
      } h-[100vh] w-[100%]`}
    >
      <div className="h-full flex items-center justify-center w-[100%]">
        <div className="w-[20%] h-[100%] max-[640px]:w-[0%]">  {/* transform max-[640px]:-translate-x-[100%] */}
          <SideBar />
        </div>
        <div className="w-[80%] p-0.5 h-full flex items-center justify-center max-[640px]:w-[100%]">
          <div className="flex flex-col h-[40%] min-h-[380px] max-h-[1980px] gap-7 items-center mt-[10%] w-[100%]">
            <div className="flex items-center justify-center">
              <span>
                <Image
                  src={`/logos/${darkTheme ? "logo-white" : "logo-black"}.png`}
                  alt="Woah AI"
                  width={60}
                  height={60}
                />
              </span>
            </div>
            <div className="w-full max-w-[690px] px-[8px]">
              <TextArea />
            </div>
            <div
              className={`flex justify-center items-center gap-4 flex-wrap ${
                darkTheme ? "text-white-primary" : "text-black-primary"
              }`}
            >
              <div
                className={`border border-solid border-gray-dark rounded-[90px] w-[125px] h-[35px] flex items-center justify-center cursor-pointer ${
                  darkTheme
                    ? "text-dark-white-primary"
                    : "text-light-black-primary"
                }`}
              >
                Create Image
              </div>
              <div
                className={`border border-solid border-gray-dark rounded-[90px] w-[125px] h-[35px] flex items-center justify-center cursor-pointer ${
                  darkTheme
                    ? "text-dark-white-primary"
                    : "text-light-black-primary"
                }`}
              >
                Edit Image
              </div>
              <div
                className={`border border-gray-dark border-solid rounded-[90px] w-[125px] h-[35px] flex items-center justify-center cursor-pointer ${
                  darkTheme
                    ? "text-dark-white-primary"
                    : "text-light-black-primary"
                }`}
              >
                Create Music
              </div>
              <div
                className={`border border-gray-dark border-solid rounded-[90px] w-[125px] h-[35px] flex items-center justify-center cursor-pointer ${
                  darkTheme
                    ? "text-dark-white-primary"
                    : "text-light-black-primary"
                }`}
              >
                Edit Music
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
