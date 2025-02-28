import type { Metadata } from 'next/types';

export const baseUrl =
    process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SITE_URL
        ? new URL('http://localhost:3001')
        : new URL(process.env.NEXT_PUBLIC_SITE_URL);

export function createMetadata(override: Metadata = {}): Metadata {
    return {
        ...override,
        metadataBase: baseUrl,
        title: override.title ?? process.env.APP_NAME,
        description: override.description,
        openGraph: {
            title: override.title ?? process.env.APP_NAME,
            description: override.description ?? '',
            url: baseUrl,
            images: '/thumbnail.png',
            siteName: 'Pry',
            ...override.openGraph,
        },
        twitter: {
            card: 'summary_large_image',
            creator: '@fiqryx',
            title: override.title ?? process.env.APP_NAME,
            description: override.description ?? '',
            images: '/thumbnail.png',
            ...override.twitter,
        },
    };
}
