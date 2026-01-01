import { ProjectService, Project, Tool } from "./services/project-service";
import { BlogService, BlogPost } from "./services/blog-service";
import { EventService, Event } from "./services/event-service";
import { UserService, Message, UserNotification, Subscriber } from "./services/user-service";
import { CourseService, Course, Lesson } from "./services/course-service";
import { ShopService, Product } from "./services/shop-service";
import { CoreService, GlobalSettings, SocialLink } from "./services/core-service";
import { RegistrationService, Registration } from "./services/registration-service";

export type {
    Project,
    Tool,
    BlogPost,
    Event,
    Message,
    UserNotification,
    Subscriber,
    Course,
    Lesson,
    Product,
    GlobalSettings,
    SocialLink,
    Registration
};

// Re-export as a unified service for backward compatibility
export const CMSService = {
    ...ProjectService,
    ...BlogService,
    ...EventService,
    ...UserService,
    ...CourseService,
    ...ShopService,
    ...CoreService,
    ...RegistrationService
};
