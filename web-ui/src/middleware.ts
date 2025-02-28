import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
}

const ignore = [
    '/',
    '/auth/*',
]

const publicRoutes = [
    '/sign-in',
    '/sign-up',
]

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refreshing the auth token
    const { data } = await supabase.auth.getUser()

    // redirect if authenticated on public routes
    if (publicRoutes.includes(pathname) && data.user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    const skip = ignore.some((v) =>
        new RegExp('^' + v.replace(/\*/g, '.*') + '$').test(pathname)
    )

    // redirect if not authenticated
    if (!skip && !publicRoutes.includes(pathname) && !data.user) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    return supabaseResponse
}