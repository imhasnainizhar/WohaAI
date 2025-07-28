import { cookies } from "next/headers"
import "@styles/components/layouts/about.style.css"
import TransitionalLink from "@utils/TransitionalLink";


export default async function About () {
    const cookieStore = await cookies();
    const theme = cookieStore.get("theme")?.value || "dark";
    const darkTheme = theme === "dark" ? true : false;
    
    return (
        <div className={`about-section ${darkTheme ? "dark-bg-secondary dark-text-secondary" : "light-bg-secondary light-text-secondary"}`}>
            <div className={`about-container`}>
                <div className={`about-heading ${darkTheme ? "dark-text-primary" : "light-text-primary"}`}>About Us ?</div>
                <div className={`about-content`}>
                    <div className={`about-para`}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quibusdam ex expedita iure commodi doloremque eveniet enim nulla deserunt ipsa? Voluptatem id eum quod, debitis rem assumenda eaque dolore tempora.
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi ipsum doloribus unde, accusantium porro harum eaque debitis beatae nesciunt illo veniam quo vel tempora minus mollitia optio est non ad aliquid quis perferendis animi sunt! Hic cupiditate nesciunt doloremque fugit.
                    </div>
                    <div className={`about-support-s`}>
                        Dear Customer, If you face any problem use can get support here:
                        <div><TransitionalLink href="/support">Get Support</TransitionalLink></div>
                    </div>
                </div>
            </div>
        </div>
    )
}