export function Logo({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="12" />
      <path d="M12 7l5 8H7l5-8z" fill="white" />
    </svg>
  );
}
