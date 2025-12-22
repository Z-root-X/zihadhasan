import { MetadataRoute } from 'next';
import { CMSService } from '@/lib/cms-service';

export const dynamic = 'force-static';



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://zihadhasan.web.app'; // Updated to current Firebase domain

    // Static Routes
    const routes = [
        '',
        '/about',
        '/projects',
        '/tools',
        '/blog',
        '/events',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Blog Posts
    const posts = await CMSService.getPosts(true);
    const blogRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt.seconds * 1000) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic Projects (if we had detailed project pages, but we mostly have external links)
    // Dynamic Events? Maybe not critical for SEO if they expire, but good to have if we have detail pages.
    // For now, let's keep it simple.

    return [...routes, ...blogRoutes];
}
