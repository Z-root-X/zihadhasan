/**
 * Cloudinary Image Optimization Utility
 * Automatically applies f_auto and q_auto to Cloudinary URLs.
 */
export function getImageUrl(url: string | undefined | null): string {
    if (!url) return "/placeholder-image.jpg"; // Provide a valid local placeholder if needed

    // If it's already a Cloudinary URL, ensure it has optimization params
    if (url.includes("cloudinary.com")) {
        // If already optimized, return as is
        if (url.includes("f_auto,q_auto") || url.includes("/upload/v")) {
            // Apply aggressive optimization: format=auto, quality=auto, crop=scale, width=auto
            // Note: w_auto requires client-side support or specific sizes. 
            // We append it to ensure we don't fetch full-res originals unnecessarily.
            if (!url.includes("f_auto")) {
                return url.replace("/upload/", "/upload/f_auto,q_auto,c_scale,w_auto/");
            }
        }
        return url;
    }

    // If it's the specific Postimg fallback, replacing with a Cloudinary equivalent would be ideal,
    // but since we can't upload, we'll return it as is or a known high-perf CDN link if provided.
    return url;
}
