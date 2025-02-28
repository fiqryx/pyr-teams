"use client";
import React from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { cva, VariantProps } from "class-variance-authority";

interface DropdownContext {
    open: boolean
    setOpen: (state: boolean) => void
}

interface DropdownProps {
    className?: string;
    children: React.ReactNode;
}

const DropdownContext = React.createContext<DropdownContext | undefined>(undefined);

export const useDropdown = (): DropdownContext => {
    const context = React.useContext(DropdownContext);
    if (!context) {
        throw new Error("useDropdown must be used within a Dropdown provider");
    }
    return context;
};

const DropdownNative = React.forwardRef<HTMLDivElement, DropdownProps>(
    ({ className, children }, ref) => {
        const [open, setOpen] = React.useState(false);
        const dropdownRef = React.useRef<HTMLDivElement>(null);

        // @ts-expect-error: The expected type signature.
        React.useImperativeHandle(ref, () => dropdownRef.current)

        React.useEffect(() => {
            if (!open || !dropdownRef.current) return

            const { ownerDocument } = dropdownRef.current

            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setOpen(false);
                }
            };

            ownerDocument.addEventListener("mousedown", handleClickOutside);
            return () => ownerDocument.removeEventListener("mousedown", handleClickOutside);
        }, [open]);

        return (
            <DropdownContext.Provider value={{ open, setOpen }}>
                <div
                    ref={dropdownRef}
                    className={cn('relative inline-block text-left', className)}
                >
                    {children}
                </div>
            </DropdownContext.Provider>
        );
    }
)
DropdownNative.displayName = "DropdownNative"

const DropdownNativeTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(
    ({ onClick, children, asChild, ...props }, ref) => {
        const { open, setOpen } = useDropdown()

        if (asChild && React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)) {
            return React.cloneElement(children as React.ReactElement, {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    setOpen(!open);
                    if (children.props.onClick) {
                        children.props.onClick(e);
                    }
                },
                ...props,
            } as React.Attributes & React.DOMAttributes<HTMLElement>);
        }

        return (
            <Button
                ref={ref}
                onClick={(e) => {
                    setOpen(!open);
                    if (onClick) onClick(e);
                }}
                {...props}
            >
                {children}
            </Button>
        );
    }
)
DropdownNativeTrigger.displayName = "DropdownNativeTrigger"

const dropdownContentVariant = cva(
    'z-10 absolute grid min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
    {
        variants: {
            side: {
                // Top Positions
                "top-left": "bottom-full left-0 mb-2",
                "top-center": "bottom-full left-1/2 -translate-x-1/2 mb-2",
                "top-right": "bottom-full right-0 mb-2",

                // Right Positions
                "right-top": "left-full top-0 ml-2",
                "right-center": "left-full top-1/2 -translate-y-1/2 ml-2",
                "right-bottom": "left-full bottom-0 ml-2",

                // Bottom Positions
                "bottom-left": "top-full left-0 mt-2",
                "bottom-center": "top-full left-1/2 -translate-x-1/2 mt-2",
                "bottom-right": "top-full right-0 mt-2",

                // Left Positions
                "left-top": "right-full top-0 mr-2",
                "left-center": "right-full top-1/2 -translate-y-1/2 mr-2",
                "left-bottom": "right-full bottom-0 mr-2",
            },

        },
        defaultVariants: {
            side: "bottom-center",
        },
    }
)

interface DropdownNativeContentProps extends
    VariantProps<typeof dropdownContentVariant> {
    children?: React.ReactNode;
    className?: string;
}

const DropdownNativeContent = React.forwardRef<
    HTMLDivElement,
    DropdownNativeContentProps
>(
    ({ className, children, side, ...props }, ref) => {
        const { open } = useDropdown()

        return open && (
            <div
                ref={ref}
                className={cn(
                    dropdownContentVariant({ side }),
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DropdownNativeContent.displayName = "DropdownNativeContent"

const DropdownNativeItem = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & { inset?: boolean, disabled?: boolean }
>(
    ({ className, onClick, inset, disabled, ...props }, ref) => {
        const { setOpen } = useDropdown()

        return (
            <div
                ref={ref}
                role="menuitem"
                data-disabled={disabled}
                className={cn(
                    "relative min-w-40 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
                    inset && "pl-8",
                    className
                )}
                onClick={(e) => {
                    if (!disabled) {
                        if (onClick) onClick(e)
                        setOpen(false)
                    }
                }}
                {...props}
            />
        )
    }
)
DropdownNativeItem.displayName = "DropdownNativeItem"

export {
    DropdownNative,
    DropdownNativeTrigger,
    DropdownNativeContent,
    DropdownNativeItem
}
