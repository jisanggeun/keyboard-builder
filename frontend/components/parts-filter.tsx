"use client";

import { useMemo, useState, useRef, useEffect } from "react";

interface PartsFilterProps<T> {
    items: T[];
    activeFilters: Record<string, Set<string>>;
    onToggleFilter: (key: string, value: string) => void;
    onReset: () => void;
    filterConfig: FilterConfig<T>[];
}

interface FilterConfig<T> {
    key: string;
    label: string;
    getValue: (item: T) => string | boolean | null | undefined;
    type?: "string" | "boolean";
}

function getFilterOptions<T>(
    items: T[],
    config: FilterConfig<T>
): string[] {
    const values = new Set<string>();
    for (const item of items) {
        const val = config.getValue(item);
        if (val === null || val === undefined) continue;
        if (config.type === "boolean") {
            if (val === true) values.add(config.label);
        } else {
            values.add(String(val));
        }
    }
    return Array.from(values).sort();
}

function getActiveCount(activeFilters: Record<string, Set<string>>): number {
    return Object.values(activeFilters).reduce((sum, s) => sum + s.size, 0);
}

export function PartsFilter<T>({
    items,
    activeFilters,
    onToggleFilter,
    onReset,
    filterConfig,
}: PartsFilterProps<T>) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const filterOptions = useMemo(() => {
        return filterConfig.map((config) => ({
            ...config,
            options: getFilterOptions(items, config),
        }));
    }, [items, filterConfig]);

    const activeCount = getActiveCount(activeFilters);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative mb-3" ref={panelRef}>
            {/* Filter trigger button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeCount > 0
                        ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                필터
                {activeCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] leading-none dark:bg-blue-600">
                        {activeCount}
                    </span>
                )}
            </button>

            {/* Active filter summary badges */}
            {activeCount > 0 && !open && (
                <div className="inline-flex flex-wrap gap-1 ml-2">
                    {filterOptions.flatMap((filter) =>
                        filter.options
                            .filter((opt) => activeFilters[filter.key]?.has(opt))
                            .map((opt) => (
                                <span
                                    key={`${filter.key}-${opt}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                >
                                    {opt}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleFilter(filter.key, opt);
                                        }}
                                        className="hover:text-blue-900 dark:hover:text-blue-100"
                                    >
                                        x
                                    </button>
                                </span>
                            ))
                    )}
                    <button
                        onClick={onReset}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                        초기화
                    </button>
                </div>
            )}

            {/* Dropdown panel */}
            {open && (
                <div className="absolute top-full left-0 mt-1 z-30 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 space-y-3">
                    {filterOptions.map((filter) => (
                        <div key={filter.key}>
                            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
                                {filter.label}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {filter.options.map((option) => {
                                    const isActive = activeFilters[filter.key]?.has(option) ?? false;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => onToggleFilter(filter.key, option)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                                isActive
                                                    ? "bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600"
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Panel footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        {activeCount > 0 ? (
                            <button
                                onClick={onReset}
                                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium"
                            >
                                전체 초기화
                            </button>
                        ) : (
                            <span />
                        )}
                        <button
                            onClick={() => setOpen(false)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function applyFilters<T>(
    items: T[],
    activeFilters: Record<string, Set<string>>,
    filterConfig: FilterConfig<T>[]
): T[] {
    const activeKeys = Object.entries(activeFilters).filter(
        ([, values]) => values.size > 0
    );

    if (activeKeys.length === 0) return items;

    return items.filter((item) =>
        activeKeys.every(([key, values]) => {
            const config = filterConfig.find((c) => c.key === key);
            if (!config) return true;

            const val = config.getValue(item);
            if (config.type === "boolean") {
                return val === true && values.has(config.label);
            }
            if (val === null || val === undefined) return false;
            return values.has(String(val));
        })
    );
}

export function toggleFilter(
    prev: Record<string, Set<string>>,
    key: string,
    value: string
): Record<string, Set<string>> {
    const current = prev[key] ?? new Set<string>();
    const next = new Set(current);
    if (next.has(value)) {
        next.delete(value);
    } else {
        next.add(value);
    }
    return { ...prev, [key]: next };
}
