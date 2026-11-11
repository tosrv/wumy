import { Link } from "@tanstack/react-router";

type BrandLogoProps = {
  className?: string;
};

/** WUMY brand mark used in header and footer. */
export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`.trim()} aria-label="WUMY home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 48"
        fill="none"
        className="h-10 w-auto md:h-11"
        aria-hidden="true"
      >
        <rect x="2" y="6" width="36" height="36" rx="10" fill="#141413" />
        <path
          d="M12 16L16.5 30L20 20L23.5 30L28 16"
          stroke="#CAEF45"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="16" r="2" fill="#CAEF45" />
        <text
          x="48"
          y="31"
          fill="#141413"
          fontFamily="Space Grotesk, ui-sans-serif, system-ui, sans-serif"
          fontWeight="800"
          fontSize="24"
          letterSpacing="-0.04em"
        >
          WUMY
        </text>
        <rect x="134" y="16" width="16" height="16" rx="8" fill="#CAEF45" />
        <circle cx="142" cy="24" r="3" fill="#141413" />
      </svg>
    </Link>
  );
}
