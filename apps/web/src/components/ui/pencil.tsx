
import React from 'react';

export const RoundedCornersPencilIcon =
    ({ size = 24, color = "currentColor" }: { size?: string | number; color?: string }) => {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* The square boundary with rounded corners */}
                <path d="M10 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-4" />
                
                {/* The pencil/edit tip */}
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        );
    };