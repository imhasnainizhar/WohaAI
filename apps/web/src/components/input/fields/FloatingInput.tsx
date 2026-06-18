"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { InputFieldProps } from "@/types/input-props"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { forwardRef } from "react"

export const FloatingInput = forwardRef<HTMLInputElement, InputFieldProps>(({
    label,
    error,
    className,
    ...props
}: InputFieldProps, ref) => {
    console.log(error)
    return (
        <div className={`flex flex-col items-start gap-2`}>
            <div className={`relative bg-background! ${className || null}`}>
                <Input
                    {...props}
                    ref={ref}
                    placeholder=" "
                    className={`
                    peer h-10 bg-transparent!
                    focus-visible:ring-0
                    focus-visible:ring-offset-0
                    focus-visible:border-border
                    focus:border-border
                    border-border transition-all duration-100
                    ${error ? "border-[#FF657B]! focus:border-[#FF657B]!" : null}
                    ${className || null}
                `}
                />
                <label
                    htmlFor={props.id}
                    className={`
                    whitespace-nowrap
                    absolute top-1/2 -translate-y-1/2 left-3 px-2 bg-background! text-muted-foreground
                    transition-all [transition:all_300ms_ease,color_100ms_ease] pointer-events-none
                    rounded-[20px]

                    peer-focus:top-0
                    peer-focus:text-xs
                    peer-focus:text-foreground

                    peer-not-placeholder-shown:top-0
                    peer-not-placeholder-shown:text-xs

                    ${error ? "text-[#FF657B]!" : null}
                `}
                >
                    {label}
                </label>
            </div>
            <data value={error?.message}>
                {error && (
                    <Alert
                        variant="destructive"
                        className="
                        bg-transparent border-none
                        p-0 gap-1!
                        w-fit
                    "
                    >
                        <AlertCircleIcon className="shrink-0" />

                        <AlertTitle className="pt-0.5 m-0 leading-3.25! text-[12px]!">
                            {error.message}
                        </AlertTitle>
                    </Alert>)}
            </data>
        </div>
    )
})