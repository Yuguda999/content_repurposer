# Content Repurposer Frontend

This is the frontend application for the Content Repurposer service. It provides a user interface for submitting blog content for repurposing into various social media formats, viewing job status, and downloading generated content.

## Features

- User authentication
- Submit blog content for repurposing
- Select target social media platforms
- View job status and history
- Download generated content and images
- Responsive design for desktop and mobile

## Technology Stack

- React 19
- TypeScript
- Material UI
- React Router
- React Query
- Axios
- Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Content Repurposer API running on http://localhost:8001

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:8001/api
```

## Project Structure

- `src/components/`: Reusable UI components
- `src/pages/`: Page components
- `src/services/`: API services
- `src/hooks/`: Custom React hooks
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions
- `src/assets/`: Static assets

## Authentication

The application uses JWT-based authentication. The token is stored in localStorage and included in the Authorization header for API requests.
