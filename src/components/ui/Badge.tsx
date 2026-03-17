interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "neutral";
  className?: string;
}

const variants = {
  success: "bg-gea-success/10 text-gea-success",
  danger: "bg-gea-danger/10 text-gea-danger",
  warning: "bg-gea-warning/10 text-gea-warning",
  neutral: "bg-gea-bg text-gea-muted",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
