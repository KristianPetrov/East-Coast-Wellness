import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  priority?: boolean;
  href?: string;
};

export function Logo({
  className = "h-auto w-40 sm:w-48",
  priority,
  href,
}: LogoProps) {
  const content = (
    <Image
      src="/ecw-logo-horizontal.PNG"
      alt="East Coast Wellness"
      width={853}
      height={274}
      className={className}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
