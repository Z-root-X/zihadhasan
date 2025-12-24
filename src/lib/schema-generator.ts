import { BlogPosting, WithContext, Person, Organization, Course, Event } from "schema-dts";
import { Course as CourseType, Event as EventType, BlogPost } from "./cms-service";

export function generatePersonSchema(): WithContext<Person> {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Zihad Hasan",
        url: "https://zihadhasan.web.app",
        jobTitle: "Software Engineer",
        sameAs: [
            "https://github.com/zihadhasan",
            "https://linkedin.com/in/zihadhasan"
        ],
        description: "Visionary Software Engineer building the future with AI and Next.js."
    };
}

export function generateBlogPostSchema(post: BlogPost): WithContext<BlogPosting> {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage ? [post.coverImage] : [],
        datePublished: post.publishedAt ? new Date(post.publishedAt.seconds * 1000).toISOString() : new Date().toISOString(),
        author: {
            "@type": "Person",
            name: "Zihad Hasan",
            url: "https://zihadhasan.web.app"
        },
        publisher: {
            "@type": "Organization",
            name: "Zihad Hasan",
            logo: {
                "@type": "ImageObject",
                url: "https://zihadhasan.web.app/logo.png"
            }
        },
        url: `https://zihadhasan.web.app/blog/${post.slug}`,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://zihadhasan.web.app/blog/${post.slug}`
        }
    };
}

export function generateCourseSchema(course: CourseType): WithContext<Course> {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: {
            "@type": "Organization",
            name: "Zihad Hasan",
            sameAs: "https://zihadhasan.web.app"
        },
        image: course.headerImage ? [course.headerImage] : [],
        offers: {
            "@type": "Offer",
            category: "Paid",
            price: Number(course.price),
            priceCurrency: "BDT",
            url: `https://zihadhasan.web.app/courses/view?id=${course.id}`
        },
        hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            inLanguage: "Bengali" // Assuming Bengali based on context
        }
    };
}

export function generateEventSchema(event: EventType): WithContext<Event> {
    const eventDate = event.date ? new Date(event.date.seconds * 1000).toISOString() : undefined;

    return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.description,
        startDate: eventDate,
        endDate: eventDate, // Assuming single day/time for now, or use duration if available
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: event.isVirtual
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        location: event.isVirtual
            ? {
                "@type": "VirtualLocation",
                url: "https://zihadhasan.web.app/events"
            }
            : {
                "@type": "Place",
                name: event.location || "TBD",
                address: {
                    "@type": "PostalAddress",
                    addressLocality: "Dhaka",
                    addressCountry: "BD"
                }
            },
        image: event.imageUrl ? [event.imageUrl] : [],
        organizer: {
            "@type": "Person",
            name: "Zihad Hasan",
            url: "https://zihadhasan.web.app"
        },
        offers: {
            "@type": "Offer",
            price: "0", // Assuming free registration or price needs to be added to Event model
            priceCurrency: "BDT",
            url: "https://zihadhasan.web.app/events",
            availability: (event.registeredCount || 0) >= event.totalSeats
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock"
        }
    };
}
