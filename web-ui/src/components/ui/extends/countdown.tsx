'use client'
import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion";
import { cva, VariantProps } from "class-variance-authority";

const countdownVariants = cva(
    'relative', {
    variants: {
        variant: {
            default: "text-primary stroke-primary fill-primary/20",
            destructive: "text-destructive stroke-destructive fill-destructive/20",
            stealth: "text-secondary stroke-secondary fill-gray-500/20",
            vitality: "text-green-500 stroke-green-500 fill-green-500/20",
            ember: "text-yellow-500 stroke-yellow-500 fill-yellow-500/20",
            azure: "text-blue-500 stroke-blue-500 fill-blue-500/20",
        },
        size: {
            default: 'w-9 h-9',
            sm: 'w-8 h-8 text-sm',
            lg: 'w-10 h-10 text-lg',
            xs: 'w-6 h-6 text-xs',
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
})

export interface CountdownProps extends
    React.ComponentProps<'div'>,
    VariantProps<typeof countdownVariants> {
    timeleft: number
    onComplete?: VoidFunction
}

const Countdown = React.forwardRef<HTMLDivElement, CountdownProps>(
    ({ timeleft: initial, onComplete, variant, size, className, ...props }, ref) => {
        const [timeLeft, setTimeLeft] = React.useState(initial)

        const handleComplete = React.useCallback(() => {
            if (onComplete) onComplete();
        }, [onComplete]);

        React.useEffect(() => {
            if (timeLeft === 0) {
                handleComplete();
                return;
            }

            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            return () => clearInterval(timer);
        }, [timeLeft]);

        const circumference = 100 * Math.PI;
        const progress = Math.max((timeLeft / initial) * circumference, 0);

        return (
            <div
                ref={ref}
                {...props}
                className={cn(countdownVariants({ className, size, variant }))}
            >
                <svg className="size-full transform -rotate-90" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="48" strokeWidth="4" fill="none" stroke="gray" opacity={0.2} />
                    <motion.circle
                        cx="55"
                        cy="55"
                        r="48"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1, ease: "linear" }}
                        className={cn(countdownVariants({ variant }))}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-semibold">
                    {timeLeft}
                </span>
            </div>
        )
    }
)
Countdown.displayName = "Countdown"

export {
    Countdown
}