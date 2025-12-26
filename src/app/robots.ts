import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://zihadhasan.web.app";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard/", "/my-account/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
