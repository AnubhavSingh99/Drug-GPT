import { FlaskConical } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <FlaskConical className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-semibold text-primary">Drug GPT</h1>
      </div>
    </header>
  );
}
