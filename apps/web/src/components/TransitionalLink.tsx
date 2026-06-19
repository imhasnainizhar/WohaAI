'use client';

import { useRouter } from "next/navigation";
import React, { AnchorHTMLAttributes } from "react";
import Link from "next/link";

interface TransitionalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TransitionalLink: React.FC<TransitionalLinkProps> = ({
  href,
  children,
  className,
  style,
  onClick,
  ...rest 
}) => {
  const router = useRouter();
  const [MainPageView, setMainPageView] = React.useState<Element | null>(null);

  React.useEffect(() => {
    setMainPageView(document.querySelector('.app-page-view'));
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    MainPageView?.classList.add('app-page-transition');
    // await sleep(100);
    router.push(href);
    await sleep(100);
    MainPageView?.classList.remove('app-page-transition');
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      style={style}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default TransitionalLink;