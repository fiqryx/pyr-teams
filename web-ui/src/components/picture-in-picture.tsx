"use client";

import { createPortal } from "react-dom"
import {
    ReactNode,
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useMemo
} from "react";

export type DocumentPipRef = {
    window: () => globalThis.Window | null;
    isOpen: boolean;
    close: () => void;
    open: () => void;
};

export enum UnsupportedReason {
    USING_UNSECURE_PROTOCOL = "USING_UNSECURE_PROTOCOL",
    API_NOT_SUPPORTED = "API_NOT_SUPPORTED",
};

export type DocumentPipButtonProps = {
    open: () => void
    close: () => void
    toggle: () => void
    isOpen: boolean
}

type Unsupported = (reason: UnsupportedReason) => ReactNode
type DocumentPipButton = (props: DocumentPipButtonProps) => ReactNode

export type DocumentPipProps = {
    width?: string | number;
    height?: string | number;
    shareStyles?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onResize?: (width: number, height: number) => void;
    featureUnavailableRenderer?: ReactNode | Unsupported;
    buttonRenderer?: ReactNode | DocumentPipButton;
    children?: ReactNode;
};

const DocumentPip = forwardRef<DocumentPipRef, DocumentPipProps>(
    (props, ref) => {
        const contentRef = useRef<HTMLDivElement>(null);
        const pipWindow = useRef<globalThis.Window>(null);

        const [isOpen, setIsOpen] = useState<boolean>(false);
        const [mount, setMount] = useState<HTMLElement | null>(null);

        const absoluteDimensions = useMemo(() => {
            let absoluteWidth: number = 500;
            let absoluteHeight: number = 400;

            if (typeof props.width === "number") absoluteWidth = props.width;
            else if (typeof props.width === "string") {
                if (props.width.endsWith('px')) absoluteWidth = parseInt(props.width);
                else if (props.width.endsWith('%')) absoluteWidth = window.innerWidth * (parseInt(props.width) / 100)
            }

            if (typeof props.height === "number") absoluteHeight = props.height;
            else if (typeof props.height === "string") {
                if (props.height.endsWith('px')) absoluteHeight = parseInt(props.height);
                else if (props.height.endsWith('%')) absoluteHeight = window.innerHeight * (parseInt(props.height) / 100)
            }

            return { width: absoluteWidth, height: absoluteHeight };
        }, [props.width, props.height]);

        const close = useCallback(() => {
            if (pipWindow.current == null) return;

            pipWindow.current?.close();

            setIsOpen(false)

            if (props.onClose) props.onClose();
        }, [contentRef, pipWindow, setIsOpen]);

        const open = useCallback(async () => {
            if (contentRef.current == null) return;

            const contentElement = contentRef.current;

            pipWindow.current = await window?.documentPictureInPicture.requestWindow({ ...absoluteDimensions });

            const pipDocument = pipWindow.current.document
            setMount(pipDocument.body)

            if (props.shareStyles) {
                [...document.styleSheets].forEach((styleSheet) => {
                    try {
                        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                        const style = document.createElement('style');

                        style.textContent = cssRules;
                        pipWindow.current?.document.head.appendChild(style);

                        // eslint-disable-next-line
                    } catch (e) {
                        const link = document.createElement('link');

                        link.rel = 'stylesheet';
                        link.type = styleSheet.type;
                        if (styleSheet.media.length > 0) {
                            link.media = styleSheet.media.mediaText;
                        }
                        link.href = styleSheet.href ?? '';
                        pipWindow.current?.document.head.appendChild(link);
                    }
                });
                syncStyles(pipDocument)
            }

            pipWindow.current?.document.body.append(contentElement);

            pipWindow.current?.addEventListener('pagehide', () => close());
            pipWindow.current?.addEventListener('resize', (event) => {
                if (props.onResize) props.onResize(
                    (event.target as any).innerWidth,
                    (event.target as any).innerHeight
                );
            });

            setIsOpen(true);

            if (props.onOpen) props.onOpen();
        }, [contentRef, pipWindow, setIsOpen, close, absoluteDimensions, props.shareStyles]);

        const syncStyles = useCallback((pipDocument: Document) => {
            Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach((node) => {
                pipDocument.head.appendChild(node.cloneNode(true));
            });

            const updateClasses = () => {
                pipDocument.documentElement.className = document.documentElement.className;
                pipDocument.body.className = document.body.className;
            };

            updateClasses();

            const observer = new MutationObserver(updateClasses);
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
            observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

            return () => observer.disconnect();
        }, []);

        const toggle = useCallback(() => isOpen ? close() : open(), [isOpen]);

        useImperativeHandle(ref, () => ({
            window: () => pipWindow.current,
            isOpen,
            close,
            open,
        }), [
            pipWindow,
            isOpen,
            close,
            open,
        ]);

        // eslint-disable-next-line
        let unsupported: UnsupportedReason | null = (() => {
            const isUsingSecureProtocol = window.location.protocol === 'https:';
            if (isUsingSecureProtocol === false) return UnsupportedReason.USING_UNSECURE_PROTOCOL;

            const featureIsAvailable = 'documentPictureInPicture' in window;
            if (featureIsAvailable === false) return UnsupportedReason.API_NOT_SUPPORTED;

            return null;
        })();

        if (unsupported != null && props.featureUnavailableRenderer == null) return;

        if (unsupported != null) {
            const featureUnavailableRenderer = typeof props.featureUnavailableRenderer === "function"
                ? props.featureUnavailableRenderer(unsupported) : props.featureUnavailableRenderer;

            return featureUnavailableRenderer;
        }

        const buttonRenderer = typeof props.buttonRenderer === "function"
            ? props.buttonRenderer({ open, close, toggle, isOpen }) : props.buttonRenderer;

        return (
            <div>
                {buttonRenderer}
                <div ref={contentRef} style={{
                    display: isOpen ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                }}>
                    {mount && createPortal(props.children, mount)}
                </div>
            </div>
        );
    }
)
DocumentPip.displayName = "DocumentPip"

export {
    DocumentPip
};