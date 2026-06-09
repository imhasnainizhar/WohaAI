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
                bg-black
                text-text-primary
                cursor-pointer
                hover:bg-black/50
                active:scale-95!
            "
        >
            <ArrowUp className="size-5" />
        </Button>
    )
}