"use client"

import { useState } from "react";

export default function SideCart() {

    const [isCart, setIsCart] = useState<boolean>(false)
    return (
        <div>
            <div>
                <div>
                    <div>X</div>
                    {isCart ? (
                        <div>This is cart</div>
                    ) : (
                        <div>
                            <div>No Item in Cart</div>
                            <button>Go To New Arrivals</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}