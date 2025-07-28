"use client";

import { useState } from "react";
import "@styles/components/functional-comps/shop-filter-tag.style.css"

export const ShopFilterTagUtil = () => {

    type FilterType = {
        filterTags: string[];
    }

    const [filter, setFilter] = useState<FilterType>({
        filterTags: [],
    });

    const handleFilter = (tag: string) => {
        if (filter.filterTags.length < 3)
            setFilter({
                ...filter,
                filterTags: [...filter.filterTags, tag]
            });
    }
    const handleFilterCancle = (tag: string) => {
        setFilter({
            ...filter,
            filterTags: filter.filterTags.filter((t) => t !== tag)
        });
    }


    return (
        <div className="shop-filter-tag-util">
            <div className="shop-filter">
                <div className="filter-tags-display">
                    {filter.filterTags.length > 0 ? filter.filterTags.map((tag) => (
                        <div className="filter-tag" key={tag}><span onClick={() => handleFilterCancle(tag)} className="filter-tag-cancle-icon">X</span>{tag}</div>
                    )) : <div className="filter-tag">No Filter Tags</div>}
                </div>
                <div className="filter-selector">
                    <div className="filter-menu-open-button" onClick={() => handleFilter("Tag")}><span>Filter</span><span className="filter-menu-open-button-icon">☰</span></div>
                </div>
            </div>

        </div>
    )
}
