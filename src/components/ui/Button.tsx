import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-gea-accent text-white hover:bg-gea-accent-hover disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-gea-border text-gea-text hover:bg-gea-bg disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-gea-muted hover:text-gea-text disabled:opacity-50 disabled:cursor-not-allowed",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
