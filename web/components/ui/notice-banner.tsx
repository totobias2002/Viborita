import type { ReactNode } from "react";

type NoticeBannerProps = {
  children: ReactNode;
  variant?: "notice" | "error";
};

export function NoticeBanner({
  children,
  variant = "notice",
}: NoticeBannerProps) {
  const className = variant === "error" ? "error-box" : "notice";

  return <p className={className}>{children}</p>;
}
