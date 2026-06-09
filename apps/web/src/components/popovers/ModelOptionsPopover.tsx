import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useAgentOptions } from "@/providers/AgentOptionsProvider"
import { MODELS } from "@/lib/constants/models-map"
import { useState } from "react"
import { Switch } from "../ui/switch"
import { useAppContext } from '@/providers/AppProvider';
import { motion } from "framer-motion"

const getModelName = (id: string) => MODELS.find((model) => model.id === id)?.name

export default function ModelOptionsPopover() {

    const { modelSelected, setModelSelected, thinkingEnabled, setThinkingEnabled } = useAgentOptions()
    const [open, setOpen] = useState<boolean>(false)
    const { isSmallDevice } = useAppContext()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                    <motion.button layout className={`flex gap-1 items-center cursor-pointer text-fluid-base px-3 py-2 rounded-lg hover:bg-black ${open ? "bg-black" : ""}`}>
                    {getModelName(modelSelected)}
                    <span
                        className={`
                            hidden sm:block
                            text-muted-foreground
                            text-fluid-sm

                            overflow-hidden
                            whitespace-nowrap

                            transition-all
                            duration-300
                            ease-in-out

                            ${thinkingEnabled
                                ? "max-w-20 opacity-100 ml-1"
                                : "max-w-0 opacity-0 ml-0"
                            }
                        `}
                    >
                        Thinking
                    </span>
                    <span className={
                        `-rotate-90 text-muted-foreground`
                    }>›</span>
                    </motion.button>
            </PopoverTrigger>
            <PopoverContent align="center" className={
                `px-2.5 py-3 rounded-popover`
            }>
                <PopoverHeader className={
                    `px-2`
                }>
                    <PopoverDescription>Select a model</PopoverDescription>
                </PopoverHeader>
                <div className={
                    `w-full flex flex-col gap-1 my-2`
                }>

                    {MODELS.map((model) => (
                        <Button key={model.id} className={
                            `w-full h-12 flex justify-start px-2 cursor-pointer`
                        } variant="ghost" onClick={() => setModelSelected(model.id)}>
                            <span className={
                                `flex flex-col gap-0.5 text-left`
                            }>
                                <span className={
                                    `text-foreground text-fluid-base`
                                }>
                                    {model.name}
                                </span>
                                <span className={
                                    `text-muted-foreground font-light text-fluid-sm`
                                }>
                                    {model.description}
                                </span>
                            </span>
                        </Button>
                    ))}
                </div>
                <Separator />
                <label
                    className="
        mt-2
        flex
        cursor-pointer
        items-center
        justify-between
        rounded-md
        p-2
        hover:bg-accent
    "
                >
                    <div className={
                        `flex flex-col`
                    }>
                        <span className={
                            `text-sm font-medium`
                        }>
                            Thinking
                        </span>

                        <span className={
                            `text-xs text-muted-foreground`
                        }>
                            Can think for more complex tasks
                        </span>
                    </div>

                    <Switch
                        checked={thinkingEnabled}
                        onCheckedChange={setThinkingEnabled}
                        className={
                            `cursor-pointer`
                        }
                    />
                </label>            </PopoverContent>
        </Popover>
    )
}