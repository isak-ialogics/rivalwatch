import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 focus:border-cyan-300 focus:bg-cyan-500/15 focus:text-cyan-200'
                    : 'border-transparent text-slate-400 hover:border-slate-600 hover:bg-white/[0.03] hover:text-slate-200 focus:border-slate-600 focus:bg-white/[0.03] focus:text-slate-200'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
