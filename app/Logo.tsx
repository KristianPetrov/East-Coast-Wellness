import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  priority?: boolean;
  href?: string;
};

export function Logo({
  className = "h-auto w-48 sm:w-64",
  priority,
  href,
}: LogoProps) {
  const content = (
    <span className="logo-glow relative inline-block">
      <span className="logo-glow-aura" aria-hidden="true" />
      <Image
        src="/ecw-logo-horizontal.PNG"
        alt="East Coast Wellness"
        width={832}
        height={225}
        className={`relative z-10 ${className}`}
        priority={priority}
      />
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
