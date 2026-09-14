import { forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
    {
        className,
        children,
        onClick,
        onKeyDown,
        interactive = false,
        ...rest
    },
    ref,
) {
    const clickable = typeof onClick === "function";

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (
            clickable &&
            !e.defaultPrevented &&
            (e.key === "Enter" || e.key === " ")
        ) {
            e.preventDefault();
            onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                "rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl",
                interactive && clickable ? "cursor-pointer transition-all hover:bg-slate-800/50 hover:border-white/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500/50" : "",
                className
            )}
            onClick={onClick}
            onKeyDown={clickable ? handleKeyDown : onKeyDown}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            {...rest}
        >
            {children}
        </div>
    );
});

export default Card;
