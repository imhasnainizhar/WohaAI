import ShopItems from "../../db/db-obj";
import "@styles/pages/shop.style.css";
import "@styles/color-plates/color-plate.css"
// import { ShopFilterTagUtil } from "../../components/functional-comps/shop-filter-tag";
import React from "react";
import ProductCard from "@components/cards/product-card";
import { cookies } from "next/headers";

export default async function Shop() {
    const openShopProduct = (e: React.MouseEvent) => {
        console.log(e)
    }
    const cookieStore = await cookies();
    const theme = cookieStore.get("theme")?.value || "dark";
    const darkTheme = theme === "dark" ? true : false;
    return (
        <div className={`marketplace ${darkTheme ? "marketplace-dark" : "marketplace-light"}`}>
            <div className="marketplace-container">
                <div className="marketplace-content">
                    {/* <div className="marketplace-start">
                        <div className="shop-page-start-content">
                            <ShopFilterTagUtil />
                        </div>
                    </div> */}
                    <div className="marketplace-middle">
                        <div className="marketplace-items-container">
                            <div className="marketplace-items">
                                {Array.isArray(ShopItems.top) && ShopItems.top.map((item) => (
                                    <ProductCard key={item.id} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
