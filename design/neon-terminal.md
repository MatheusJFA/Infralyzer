# Design System Strategy: Terminal Editorial

## 1. Overview & Creative North Star
**Creative North Star: The Sovereign Console**

This design system rejects the "friendly" and "rounded" tropes of modern SaaS in favor of an elite, high-density hacker aesthetic. It is inspired by brutalist terminal interfaces and high-end editorial layouts. We are building a "Sovereign Console"—an interface that prioritizes raw data density, technical precision, and a sense of "under-the-hood" authority.

The system breaks the standard template look through **intentional asymmetry** and **brutalist structure**. We utilize zero-radius corners (`0px`) and high-contrast neon accents against deep-void backgrounds. The visual narrative is one of precision engineering: every pixel is accounted for, and every interaction feels like a command execution.

## 2. Colors & Surface Logic
The color palette is built on a "Terminal-Zero" philosophy. The background is a true deep black (`#0e0e0e`), allowing the primary neon green (`#9fff88`) to vibrate with intensity.

*   **Primary (`#9fff88`) & Primary Container (`#00fd00`):** Use these for critical data points and primary actions. The neon effect is amplified by a subtle outer glow (box-shadow) to simulate CRT phosphorus.
*   **The "No-Line" Rule:** Standard 1px solid dividers are strictly prohibited for sectioning. Separation must be achieved through background shifts using `surface-container-low` (`#131313`) or `surface-container-high` (`#1f1f1f`).
*   **Surface Hierarchy & Nesting:** Depth is achieved through tonal stacking. An input module (`surface-container-high`) should sit atop a section container (`surface-container-low`), creating a subtle, logical hierarchy without the clutter of borders.
*   **The "Glass & Gradient" Rule:** To avoid a flat "90s" look, use a subtle scanline gradient on large surfaces: `linear-gradient(rgba(159, 255, 136, 0.03) 50%, transparent 50%)`. This adds a "Signature Texture" that feels premium and intentional.
*   **Signature Glows:** CTAs should not just be flat green. Use a transition from `primary` to `primary_container` with a `box-shadow: 0 0 15px rgba(0, 253, 0, 0.4)` to simulate a glowing hardware button.

## 3. Typography
We utilize **Space Grotesk** (serving as a sophisticated alternative to JetBrains Mono) to bridge the gap between technical monospacing and editorial legibility.

*   **Display & Headlines:** Used for "Console Headers." These should always be uppercase to mimic command-line prompts. Use `headline-lg` (2rem) for major module titles to create a commanding presence.
*   **Data Inputs (Body-LG/MD):** All numerical data must be highly legible. Typography is the primary driver of the "Hacker" feel; use `body-lg` for input values to ensure high-density mobile scanning.
*   **Labels (Label-SM/MD):** These are the "Metadata" of the system. Use `on_surface_variant` (`#ababab`) for labels to keep the focus on the data (the green text), creating a clear functional hierarchy.

## 4. Elevation & Depth
In this system, elevation is not about "floating"; it is about "power states."

*   **The Layering Principle:** Depth is purely tonal. Use `surface_container_lowest` (`#000000`) for the base and `surface_container_highest` (`#262626`) for active input states. This creates "recessed" or "elevated" feel through light values alone.
*   **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., a complex data set), use a "Ghost Border": `outline_variant` (`#484848`) at 20% opacity. It should be felt, not seen.
*   **Scanline Overlay:** Apply a global fixed overlay with 5% opacity scanlines. This unifies the "Terminal" experience and adds a layer of sophisticated grit that distinguishes it from a standard dark mode.

## 5. Components

*   **Primary Buttons:** Full-width block buttons, `0px` radius. Background: `primary`. Text: `on_primary`. On hover/active, increase the glow intensity rather than changing the color.
*   **High-Density Inputs:** Use a "bracketed" design. Instead of a full box, use L-shaped corner accents in `primary` to frame the input area. This maximizes screen real estate while maintaining the aesthetic.
*   **Incremental Steppers:** Essential for mobile data input. Large touch targets for `-` and `+` symbols. The value in the center should use `display-sm` for maximum visibility.
*   **Data Chips:** Small, rectangular containers with `outline` borders. Used for quick-selection values (e.g., "10k", "100k"). When selected, the background fills with `primary_fixed` and the text flips to `on_primary_fixed`.
*   **Progress Sliders:** Custom thumb using a vertical block shape. The track should be `surface_container_highest` with the "filled" portion in glowing `primary`.
*   **Terminal Prompt Headers:** Every section should start with a `>` character in `primary` to reinforce the command-line narrative.

## 6. Do's and Don'ts

### Do:
*   **DO** use strict `0px` border radii everywhere.
*   **DO** embrace high-density layouts. Mobile users in this context value data over white space.
*   **DO** use "Terminal Green" (`#00FF00`) sparingly for functional highlights, while using the softer `primary` (`#9fff88`) for text to prevent eye strain.
*   **DO** use `Space Grotesk` at smaller scales for a "technical manual" feel.

### Don't:
*   **DON'T** use soft drop shadows. They break the "Hard-Tech" illusion.
*   **DON'T** use rounded corners. It instantly "consumerizes" the elite feel of the system.
*   **DON'T** use standard 1px borders to separate rows; use a `0.2rem` (Spacing 1) vertical gap or a color shift.
*   **DON'T** use animations like "slides" or "fades." Use "glitch" transitions or instant state changes to mimic terminal performance.