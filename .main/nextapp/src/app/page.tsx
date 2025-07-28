import "@styles/pages/home.page.css";
import "@styles/color-plates/color-plate.css";
import "@styles/fonts/fonts.css";
import { cookies } from "next/headers";
import { Metadata } from "next";
import HomeParallax from "@components/Parallax/HomeParallax"
export const metadata: Metadata = {
  title: "Home || Barlon",
  description:
    "Home showcases and other big events showcases are on this home page.",
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
        darkTheme ? "dark-bg-primary" : "dark-bg-primary"
      }`}
    >
      <HomeParallax />
      <section className="home-showcase-slider">
        <div className="home-slides-container">
          <div className={`home-slide slide-1 parallax-layer`} data-speed="0.4">
            <div className="slide-1-container">
              <div className="slide-1-content">
                <h1 className={`heading-primary dark-text-primary parallax-layer`} data-speed="0.1">
                  Get Our New Car Model Y2
                </h1>
                <p className={`slide-1-text dark-text-secondary parallax-layer`} data-speed="0.1">
                  What about Model Y2? - We are thrilled to unveil my new car –
                  the Y2 Model – a perfect fusion of innovation, style, and
                  performance. Designed with precision engineering and advanced
                  features, the Y2 offers a smooth, powerful ride with
                  state-of-the-art technology for comfort and safety. With its
                  sleek design and bold presence on the road, this model marks a
                  new chapter in modern driving. Here's to new journeys and
                  unforgettable miles ahead!
                </p>
                <div className="slide-1-btns parallax-layer" data-speed="0.1"><button className="order-btn">Order Y2 Now</button><button className="learn-btn">Learn More</button></div>
              </div>
            </div>
          </div>
          <div className="home-slide slide-2 parallax-layer" data-speed="0.3">
            <h1>52% Rival Discount</h1>
          </div>
          <div className="home-slide slide-3 parallax-layer" data-speed="0.3">
            <h1>52% Rival Discount</h1>
          </div>
          <div className="home-slide slide-4">
            <h1>52% Rival Discount</h1>
          </div>

          <div
            className={`home-elevation-slate ${
              darkTheme
                ? "dark-bg-primary dark-text-secondary"
                : "light-bg-primary light-text-secondary"
            }`}
          >
            <div
              className={`home-heading ${
                darkTheme ? "dark-text-primary" : "light-text-primary"
              }`}
            >
              <h1>Driven by Innovation. Powered for the Journey</h1>
            </div>
            <div
              className={`home-intro ${
                darkTheme ? "dark-text-secondary" : "light-text-secondary"
              }`}
            >
              <p>
                Welcome to Woah, where innovation meets the open road. We are
                committed to redefining mobility with vehicles that blend
                cutting-edge technology, safety, and performance. Whether you're
                chasing adventure or everyday comfort, our cars are built to
                move you—confidently and responsibly. Join us and experience
                driving like never before. Ask ChatGPT
              </p>
            </div>
            <div
              className={`shop-button ${
                darkTheme
                  ? "light-bg-primary light-text-primary"
                  : "dark-bg-primary dark-text-primary"
              }`}
            >
              <p
                className={`${
                  darkTheme ? "light-text-primary" : "dark-text-primary"
                }`}
              >
                Marketplace
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
