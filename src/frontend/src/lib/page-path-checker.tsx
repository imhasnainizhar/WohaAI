'use client'; // Required for client components using hooks

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';



const PathChecker = () => {

    const pathname = usePathname();
    useEffect(() => {

    }, [pathname]);
    return null;
}
export default PathChecker;

