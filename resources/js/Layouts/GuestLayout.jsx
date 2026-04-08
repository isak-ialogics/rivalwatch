import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#030912] pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo />
                </Link>
            </div>

            <div className="glass-card mt-6 w-full overflow-hidden px-6 py-4 sm:max-w-md sm:rounded-xl">
                {children}
            </div>
        </div>
    );
}
