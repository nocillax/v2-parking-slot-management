import { ReactNode } from "react";

interface FormContainerProps {
  children: ReactNode;
}

export function FormContainer({ children }: FormContainerProps) {
  return (
    <main className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12">
      {children}
    </main>
  );
}
