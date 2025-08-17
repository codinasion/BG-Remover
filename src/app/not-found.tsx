import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "Sorry, the page you're looking for doesn't exist or has been moved.",
};

export default function NotFoundPage() {
  return (
    <main className="w-full h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
      </div>
    </main>
  );
}
