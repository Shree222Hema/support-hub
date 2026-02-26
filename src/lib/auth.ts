export function validateApiKey(request: Request): boolean {
    const apiKey = request.headers.get("x-api-key");
    const validKey = process.env.SUPPORT_HUB_API_KEY;

    if (!validKey) {
        console.warn("SUPPORT_HUB_API_KEY is not set in environment variables");
        return false;
    }

    return apiKey === validKey;
}
