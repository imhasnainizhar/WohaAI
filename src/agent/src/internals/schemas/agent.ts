import z from "zod"

// Response Schema for LLM
export const responseSchema = z.object({
    output: z.string().optional()
});

export const memorySchema = z.object({
    properties: z.
    object({
        memory: z.object({ 
            type: z.string() 
        })
    })
});