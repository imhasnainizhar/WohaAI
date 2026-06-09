export default function IncognitoModeButton({color}: {color: string}) {
    return (
        <div className={`fixed top-3 right-3 z-10 w-7 h-7 cursor-pointer`}>
            <svg
                className="ghost-icon"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 12.5a8 8 0 0 0-16 0V20l2-1 2 1 2-1 2 1 2-1 2 1 2-1v-7.5" />

                <g className="eyes">
                    <circle cx="9" cy="11" r="1" fill={color} />
                    <circle cx="15" cy="11" r="1" fill={color} />
                </g>
            </svg>
        </div>
    )
}
