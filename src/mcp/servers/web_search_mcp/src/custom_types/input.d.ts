export type WebSearchParams = {
    prompt : string,
    requiredResults? : number;
}

export type WebScraperOptions = {
    timeoutMs: number,
    maxRetries: number,
    renderJS: boolean
}

export type WebScraperParams = {
    url: string,
    WebScraperOptions
}