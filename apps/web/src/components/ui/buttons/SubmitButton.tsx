import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SubmitButton() {
    return (
        <Button
            type="submit"
            size="icon"
            className="
                border-none!
                outline-none!
                rounded-full
                w-[35px]
                h-[35px]
                border
                border-primary
                transition-colors
                duration-300
                bg-black
                text-white
                cursor-pointer
                hover:bg-black/80
                active:scale-95!
            "
        >
            <ArrowUp className="size-5" />
        </Button>
    )
}