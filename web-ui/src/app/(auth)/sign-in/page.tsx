import { createMetadata } from "@/lib/metadata";
import { SignInForm } from "./components/form";
import { Icons } from "@/components/icons";

export const metadata = createMetadata({ title: 'Sign In' })

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center">
            <div className="flex flex-col w-full max-w-sm gap-6 p-4">
                <SignInForm />
                <div className="inline-flex text-sm font-semibold items-center justify-center text-muted-foreground gap-2">
                    Secured by
                    <a href="https://supabase.com/" target="_blank">
                        <Icons.supbase className="size-5" />
                    </a>
                </div>
            </div>
        </div>
    )
}