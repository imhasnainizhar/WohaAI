"use client"
import Image from "next/image";
import ShopItems from "../../db/db-obj";
import { useProductDataContext } from "@providers/ProductDataProvider";


interface ProductDataInterface {
    id: number;
    name: string;
    price: number;
    category: string;
    sale: boolean;
    itemImageUrl: string;
    rating: number;
    salePrice?: number;
    description: string;
}

export default function ProductCard(ProductData : ProductDataInterface) {

    const { setProductID } = useProductDataContext()

    const openShopProduct = (e: React.MouseEvent) => {
        e.preventDefault
        const ProductID = e.currentTarget.getAttribute('data-id')
        setProductID(String(ProductID));
    }
    return (
        <div className="marketplace-item" data-id={ProductData.id} onClick={(e: React.MouseEvent) => { openShopProduct(e) }}>
            <div className="marketplace-item-image">
                <Image src={ShopItems.top[0].itemImageUrl} alt={ProductData.name} width={100} height={100} />
            </div>
            <div className="marketplace-item-content">
                <div className="marketplace-item-name">{ProductData.name}</div>
                <div className="marketplace-item-predescription">{ProductData.description}</div>
                <div className="marketplace-item-review">Rating: {ProductData.rating} / 5</div>
                <div className="marketplace-item-price-container">
                    {ProductData.sale ?
                        <div className="marketplace-item-sale-price-container">
                            <div className="marketplace-item-price-container-price" style={{ textDecoration: "line-through" }}>{ProductData.price}$</div>
                            <div className="marketplace-item-price-container-sale-price">{ProductData.salePrice}$</div>
                        </div>
                        : <div className="marketplace-item-price-container-price non-sale-price">{ProductData.price}$</div>}
                </div>
                <div className="marketplace-item-action-btns">
                    <div className="add-to-cart-btn">
                        <button>Add To Cart</button>
                    </div>
                    <div className="but-now-btn">
                        <button>Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
}