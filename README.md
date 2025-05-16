# Status Pulse

A modern status page and incident management system built with Next.js, Prisma, and Clerk authentication.

## Features

- Real-time service status monitoring
- Incident management and updates
- Maintenance scheduling and tracking
- Organization-based multi-tenancy
- Modern UI with dark mode support
- Role-based access control

## Tech Stack

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Date Handling**: date-fns

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database
- Clerk account for authentication
- pnpm package manager

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/status_pulse"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd status-pulse
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up the database:

```bash
pnpm prisma generate
pnpm prisma db push
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── app/                 # Next.js app directory
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Database Schema

The application uses the following main models:

- User: Authentication and user management
- Organization: Multi-tenant organization management
- Service: Service status tracking
- ServiceGroup: Grouping of related services
- Incident: Incident management and updates
- Maintenance: Scheduled maintenance tracking

## Available Scripts

- `pnpm dev`: Start development server with Turbopack
- `pnpm build`: Generate Prisma client and build the application
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm postinstall`: Generate Prisma client after installation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
