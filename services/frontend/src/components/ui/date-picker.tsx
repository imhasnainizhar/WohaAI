"use client"

import { useState } from "react"
import { Calendar } from "@lib/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@lib/components/ui/popover"
import { format } from "date-fns"
import { Controller, useFormContext } from "react-hook-form"
import { RoundedDataSelector } from "./input/date/rounded-selector"

interface DatePickerProps {
    name: string
    placeholder?: string
    register: any
    theme?: string
    control: any
}

export function DatePicker({ name, placeholder = "Select date", register, theme, control  }: DatePickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <Controller
            name={name}
            control={control }
            render={({ field, fieldState }) => {
                const selectedDate = field.value

                return (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <RoundedDataSelector
                                label={placeholder}
                                name={name}
                                register={register}
                                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                                error={fieldState.error}
                                theme={theme}
                            />
                        </PopoverTrigger>

                        <PopoverContent className="z-[210] w-auto p-2">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                captionLayout="dropdown"
                                onSelect={(d) => {
                                    field.onChange(d)
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                )
            }}
        />
    )
}
