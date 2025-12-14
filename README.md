# NoteSphere - Connect your ideas, control your time

A unified workspace for notes, tasks, and calendars built with Next.js, Neon.tech, and Clerk.

## Features

- **Notes**: Rich text editor with Tiptap for creating and managing notes
- **Tasks**: Task management with due dates and project association
- **Projects**: Organize notes and tasks into projects with color coding
- **Calendar**: Visualize tasks on a calendar view
- **Note-to-Task Conversion**: Convert selected text from notes directly to tasks
- **Authentication**: Secure user authentication with Clerk

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **Rich Text Editor**: Tiptap
- **Calendar UI**: Custom calendar implementation
- **Database**: Neon.tech (PostgreSQL 16)
- **Authentication**: Clerk
- **Deployment**: Vercel
- **ORM**: Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon.tech account for PostgreSQL database
- A Clerk account for authentication

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/notesphere.git
cd notesphere
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local` to `.env` and update the values:
   
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_neon_database_url
```

4. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/notesphere)

### Manual Deployment

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
4. Deploy!

## Database Schema

The application uses the following main tables:

- `users`: Stores user information (via Clerk)
- `projects`: Organizes notes and tasks into projects
- `notes`: Contains note content with rich text support
- `tasks`: Manages tasks with due dates and completion status

## API Routes

The application includes the following API routes:

- `/api/auth`: Handles authentication (via Clerk)
- Additional API routes can be added in `src/app/api`

## Development

### Project Structure

```
src/
├── app/                  # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── editor/         # Text editor components
│   ├── notes/          # Note-related components
│   ├── tasks/          # Task-related components
│   └── projects/       # Project-related components
├── lib/               # Utility functions and DB connection
│   └── db/            # Database schema and connection
├── providers/         # React context providers
└── services/          # Business logic services
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/feature-name`
5. Submit a PR

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.