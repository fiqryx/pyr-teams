'use client';
import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

interface ReactionType {
    id: number;
    value: string;
    position: string;
    offset: number;
}

type ReactionOptions = {
    position?: ReactionPosition
}

interface ReactionContextType {
    showReaction: (value: string, options?: ReactionOptions) => void;
}

type ReactionPosition =
    | "bottom-left"
    | "bottom-right"
    | "top-left"
    | "top-right"
    | "bottom-center"
    | "top-center";

const reactionVariants = cva("fixed xduration-100 z-50", {
    variants: {
        size: {
            default: "text-[3rem]",
            xs: "text-[1.5rem]",
            sm: "text-[2rem]",
            lg: "text-[3.5rem]",
            xl: "text-[4rem]"
        },
        position: {
            "bottom-left": "bottom-0 left-0 animate-float-up",
            "bottom-right": "bottom-0 right-0 animate-float-up",
            "top-left": "top-0 left-0 animate-float-down",
            "top-right": "top-0 right-0 animate-float-down",
            "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 animate-float-up",
            "top-center": "top-0 left-1/2 -translate-x-1/2 animate-float-down"
        }
    },
    defaultVariants: {
        size: "default",
        position: "bottom-center"
    }
});

interface ReactionContainerProps extends VariantProps<typeof reactionVariants> {
    children?: React.ReactNode;
    className?: string;
}

const ReactionContext = React.createContext<ReactionContextType | undefined>(undefined);

export const ReactionContainer: React.FC<ReactionContainerProps> = ({
    children, className, position = "bottom-right", size
}) => {
    const [state, setState] = React.useState<ReactionType[]>([]);

    const showReaction = (value: string, op?: ReactionOptions) => {
        const offset = Math.random() * 30 + 10; // random 10% to 40% offset

        setState((prev) => [
            ...prev,
            {
                id: Date.now(),
                value,
                position: op?.position ?? position!,
                offset
            }
        ]);
    };

    const handleAnimationEnd = (id: number) => {
        setState((prev) => prev.filter((reaction) => reaction.id !== id));
    };

    return (
        <ReactionContext.Provider value={{ showReaction }}>
            {children}
            {state.map(({ id, value, position: post, offset }) => {
                const isRight = ["top-right", "bottom-right"].includes(post);
                const isCenter = ["top-center", "bottom-center"].includes(post);

                return (
                    <div
                        key={id}
                        className={cn(reactionVariants({ position, size }), className)}
                        style={{
                            left: isRight ? "auto" : isCenter ? "50%" : `${offset}%`,
                            right: isRight ? `${offset}%` : "auto",
                            transform: isCenter ? "translateX(-50%)" : "none"
                        }}
                        onAnimationEnd={() => handleAnimationEnd(id)}
                    >
                        {value}
                    </div>
                );
            })}
        </ReactionContext.Provider>
    );
};

export const useReaction = (): ReactionContextType => {
    const context = React.useContext(ReactionContext);
    if (!context) {
        throw new Error("useReaction must be used within a ReactionContainer");
    }
    return context;
};
