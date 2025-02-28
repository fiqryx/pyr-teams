"use client"
import { z } from "zod"
import React from "react"
import { toast } from "sonner";
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

import {
    signInWithOAuth,
    signInWithPassword
} from "../actions"
import {
    Card,
    CardContent
} from "@/components/ui/card"
import {
    Input,
    InputIcon
} from "@/components/ui/input"
import {
    EyeIcon,
    EyeOffIcon
} from "lucide-react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const schema = z.object({
    email: z.string({ required_error: "email is required" }).
        min(1, { message: "email is required" }).
        email({ message: 'invalid email address' }),
    password: z.string({ required_error: 'password is required' }).
        min(1, { message: "password is required" })
})

export function SignInForm({
    className,
    ...props
}: React.ComponentProps<typeof Card>) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [showPassword, setshowPassword] = React.useState<boolean>(false)

    const { setError, ...form } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof schema>) {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error } = await signInWithPassword(values)

        if (error) {
            console.log({ error });
            toast(error.message)
        }

        setIsLoading(false)
    }

    return (
        <Card
            {...props}
            className={cn("overflow-hidden", className)}
        >
            <CardContent className="p-0">
                <Form setError={setError} {...form}>
                    <form
                        className="grid p-6 md:p-8 gap-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">Sign in</h1>
                            <p className="text-sm text-muted-foreground">
                                Welcome back! Please sign in to continue
                            </p>
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            required
                                            type="email"
                                            disabled={isLoading}
                                            placeholder="Enter email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-4">
                                        <FormLabel>
                                            Password
                                        </FormLabel>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-2 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Enter password"
                                            type={showPassword ? 'text' : 'password'}
                                            {...field}
                                        >
                                            <InputIcon
                                                position="right"
                                                className="cursor-pointer"
                                                onClick={() => setshowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                                            </InputIcon>
                                        </Input>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in
                        </Button>
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => signInWithOAuth({ provider: 'discord' })}
                            >
                                <Icons.discord />
                                <span className="sr-only">Login with discord</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => signInWithOAuth({ provider: 'google' })}
                            >
                                <Icons.google />
                                <span className="sr-only">Login with Google</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => signInWithOAuth({ provider: 'github' })}
                            >
                                <Icons.gitHub />
                                <span className="sr-only">Login with GitHub</span>
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}