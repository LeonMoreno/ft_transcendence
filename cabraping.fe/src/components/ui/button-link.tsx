import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";

interface ButtonLinkProps
  extends LinkProps,
    VariantProps<typeof buttonVariants> {}

export const ButtonLink = ({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ButtonLinkProps) => {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  );
};

ButtonLink.displayName = "ButtonLink";
