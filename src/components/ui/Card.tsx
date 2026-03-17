import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = "", title }: CardProps) {
  return (
    <div
      className={`bg-gea-card border border-gea-border p-5 ${className}`}
    >
      {title && (
        <h3 className="text-sm font-medium text-gea-muted mb-3 uppercase tracking-wide">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
