import Link from 'next/link';
import { Building } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-foreground">Find Your Hostel</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
