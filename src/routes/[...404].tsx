import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('[...404]')({
  component: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center text-2xl">
      404 Not Found
    </div>
  );
} 