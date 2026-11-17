import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  href: string;
  children: ReactNode;
}

export default function NavLink({ href, children }: Props) {
  return (
    <Link
      href={href}
      className="text-white hover:text-gray-200 transition"
    >
      {children}
    </Link>
  );
}
