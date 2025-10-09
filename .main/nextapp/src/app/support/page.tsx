import '@styles/pages/contact.style.css';
import "@styles/main/layout.main.css";
import Image from "next/image";


export default function ContactPage() {
    return (
        <div className="contact-page">
            <div className="contact-page-container">
                <div className="contact-page-content">
                    <div className="contact-page-image">
                        <Image
                            src="/images/contact-image.jpg"
                            alt="Contact Image"
                            width={100}
                            height={100}
                        />
                    </div>
                    <div className="contact-page-heading">
                        <h1>Contact With Us</h1>
                    </div>
                    <div className="contact-page-info">
                        <div className="contact-info-element"><div><i className="bx bx-map" style={{ color: "#ffffff", fontSize: "36px" }}></i></div><address>123 Main Street, City, Country</address></div>
                        <div className="contact-info-element"><div><i className="bx bx-envelope-open" style={{ color: "#ffffff", fontSize: "36px" }}></i></div><a href="mailto:info@example.com">info@example.com</a></div>
                        <div className="contact-info-element"><div><i className="bx bx-phone" style={{ color: "#ffffff", fontSize: "36px" }}></i></div><a href="tel:+12345678901">+1 (234) 567-8901</a></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
