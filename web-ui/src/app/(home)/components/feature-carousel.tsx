'use client'
import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

import Autoplay from "embla-carousel-autoplay"

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselIndicator,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

const content = [
    {
        label: 'Your meeting is safe',
        description: 'No one can join a meeting unless invited or admitted by the host',
        image: (
            <div className='relative size-72'>
                <Image fill priority alt="feature" src="/assets/images/feature-edu.svg" className='object-contain rounded-full' />
            </div>
        )
    },
    {
        label: 'Capture and share recordings',
        description: 'Once started, recordings are saved to your Google Drive and can be shared with others',
        image: (
            <div className='relative size-72'>
                <Image fill priority unoptimized alt="feature" src="/assets/images/feature-record.gif" className='object-contain' />
            </div>
        )
    },
    {
        label: 'Get a link you can share',
        description: (
            <>Click <span className='font-bold'>New meeting</span> to get a link you can send to people you want to meet with</>
        ),
        image: (
            <div className='relative size-72'>
                <Image fill priority alt="feature" src="/assets/images/feature-share.svg" className='object-contain' />
            </div>
        )
    },
]

export function FeatureCarousel({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)

    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    React.useEffect(() => {
        if (!api) return

        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    return (
        <div
            {...props}
            className={cn('flex flex-col gap-4 justify-center', className)}
        >
            <Carousel
                setApi={setApi}
                className="w-full max-w-sm"
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={() => plugin.current.play()}
            >
                <CarouselContent>
                    {content.map(({ label, description, image }, idx) => (
                        <CarouselItem key={idx}>
                            <div
                                className={cn(
                                    'flex flex-col aspect-square items-center gap-8 p-4',
                                    idx !== current && 'hidden sm:flex'
                                )}
                            >
                                {image}
                                <div className="flex flex-col text-center gap-1">
                                    <h2 className='text-lg font-semibold'>{label}</h2>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className='hidden sm:flex' />
                <CarouselNext className='hidden sm:flex' />
                <CarouselIndicator className='mt-4' />
            </Carousel>
        </div>
    )
}