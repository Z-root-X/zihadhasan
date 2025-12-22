"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
            {/* @ts-expect-error Lenis types mismatch with React 19 */}
            {children}
        </ReactLenis>
    );
}
