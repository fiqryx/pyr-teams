import React from "react";
import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function omit<T, K extends keyof T>(obj: T, ...args: K[]): T {
  const result = { ...obj };

  for (const k of args) {
    delete result[k];
  }

  return result;
}

/**
 * Getting a valid child on component by displayName
 * @param children
 * @param displayName 
 * @returns Element & Props
 */
export function vc<T = any>(children: React.ReactNode, displayName: string) {
  return React.Children.map(children, (element) => {
    if (React.isValidElement(element)) {
      const name = (element.type as React.ComponentType)?.displayName;

      if (name === displayName) {
        return {
          element,
          props: element.props as T
        }
      }
    }
  })?.[0]
}

export function extractURL(str: string) {
  try {
    const url = new URL(str);

    return {
      secure: url.protocol === "https:",
      host: url.hostname,
      port: parseInt(url.port || (url.protocol === "https:" ? "443" : "80")),
      path: url.pathname,
    };

    // eslint-disable-next-line
  } catch (error) {
    return;
  }
}