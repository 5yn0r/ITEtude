# **App Name**: ITEtude (IT + Etude)

## Core Features:

- Resource Curation: Aggregate and categorize learning resources (links, tutorials, documentation) for Web Development, Cybersecurity, and Data Science/AI.
- Intelligent Filtering: Filter resources by difficulty level, language, and 'data weight' (estimated data consumption).
- Learning Path Constructor: Create sequential learning paths by ordering resources; stored as JSONB in Supabase.
- Dead Link Checker: Periodically checks HTTP status of resources (200, 404) to identify broken links; uses a serverless function to reduce cost.
- Adaptive Loading: Detects connection quality (navigator.connection API) and limits loading of heavy images on poor connections to favor textual content when applicable as a tool for end-users.
- User Dashboard: Displays favorite resources and progress bars for followed learning paths.
- Resource Management (CRUD): Admin interface to add/edit resources with automatic metadata extraction (title, description) via OpenGraph.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A) to convey professionalism and trust, reminiscent of educational institutions.
- Background color: Very light gray (#F9FAFB) to ensure readability and a clean interface, allowing content to stand out.
- Accent color: Light blue (#60A5FA) to highlight interactive elements and calls to action, creating a clear visual hierarchy.
- Body font: 'PT Sans' (sans-serif) for readability and a modern look. Headline font: 'PT Sans' (sans-serif).
- Lucide React icons for a consistent and clean visual language.
- Skeleton screens for loading states to improve perceived performance.
- Subtle transitions and animations for a smooth user experience.