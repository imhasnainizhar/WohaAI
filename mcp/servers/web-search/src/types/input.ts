export type WebSearchParams = {
    prompt : string,
    requiredResults? : number;
}

export type WebScraperOptions = {
    timeoutMS?: number,
    maxRetries: number,
    renderJS: boolean
    partialSelector?: string
}

export type WebScraperParams = {
    url: string,
    WebScraperOptions: WebScraperOptions
}