import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ComponentProps } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Anchor that routes internal paths through TanStack Router and keeps
 * hash / external links as plain anchors.
 */
export function A({ href, children, ...rest }: Props) {
  if (href && href.startsWith("/") && !href.startsWith("//")) {
    const linkProps = rest as ComponentProps<typeof Link>;
    return (
      <Link to={href as "/"} {...linkProps}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
