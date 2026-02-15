"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
    { href: "/builder", label: "빌더" },
    { href: "/community", label: "커뮤니티" },
];

export function SiteHeader() {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    return (
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                        KeyboardBuilder
                    </Link>
                    <nav className="hidden sm:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700"
                                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {!isLoading && (
                        user ? (
                            <UserMenu />
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition"
                            >
                                로그인
                            </Link>
                        )
                    )}
                </div>
            </div>
            {/* Mobile nav */}
            <div className="sm:hidden border-t dark:border-gray-700 px-4 sm:px-6 py-2 flex gap-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </header>
    );
}
