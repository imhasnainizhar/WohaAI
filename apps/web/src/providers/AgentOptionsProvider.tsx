import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TAIModel } from "@/lib/constants/models-map";

type ModelSelected = TAIModel['id']

export type StyleSelected = "normal" | "casual" | "explanatory" | "learning"

type TAgentOptionsContext = {
    modelSelected: ModelSelected
    setModelSelected: (modelSelected: ModelSelected) => void

    styleSelected: StyleSelected
    setStyleSelected: (styleSelected: StyleSelected) => void

    webSearchEnabled : boolean;
    setWebSearchEnabled: (webSearchEnabled: boolean) => void

    thinkingEnabled : boolean;
    setThinkingEnabled: (thinkingEnabled: boolean) => void
}

const AgentOptionsContext = createContext<TAgentOptionsContext | undefined>(undefined)

export default function AgentOptionsProvider({ children } : { children: ReactNode}) {
    const [modelSelected, setModelSelected] = useState<ModelSelected>("claude-sonnet-4-6")
    const [styleSelected, setStyleSelected] = useState<StyleSelected>("normal")
    const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(true)
    const [thinkingEnabled, setThinkingEnabled] = useState<boolean>(false)
    
    useEffect(() => {
        const savedModel = localStorage.getItem("modelSelected")
        const savedStyle = localStorage.getItem("styleSelected")
        const savedWebSearchEnabled = localStorage.getItem("webSearchEnabled")
        const savedThinkingEnabled = localStorage.getItem("thinkingEnabled")

        if (savedModel) {
            setModelSelected(savedModel as ModelSelected)
        }

        if (savedStyle) {
            setStyleSelected(savedStyle as StyleSelected)
        }

        if (savedWebSearchEnabled) {
            setWebSearchEnabled(savedWebSearchEnabled === "true")
        }

        if (savedThinkingEnabled) {
            setThinkingEnabled(savedThinkingEnabled === "true")
        }
    }, [])

    return (
        <AgentOptionsContext.Provider value={{
            modelSelected,
            setModelSelected, 
            styleSelected, 
            setStyleSelected, 
            webSearchEnabled, 
            setWebSearchEnabled, 
            thinkingEnabled, 
            setThinkingEnabled 
        }}>
            {children}
        </AgentOptionsContext.Provider>
    )
}

export const useAgentOptions = () => {
    const context = useContext(AgentOptionsContext)
    if (!context) {
        throw new Error("useAgentOptions must be used within an AgentOptionsProvider")
    }
    return context
}