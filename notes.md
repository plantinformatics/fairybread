## Known issues from AI code review

### use-mobile.tsx

Hydration mismatch in `useIsMobile` hook due to undefined initial state
The hook initializes isMobile state as undefined, then converts it with !!isMobile before the effect runs. On server-side render, this returns false, but after client hydration when the effect executes, it might return true. This hydration mismatch will cause a warning in Next.js and potential layout shift. The initial state should match what the effect will set.

### sheet.tsx

Hydration mismatch in `useIsMobile` hook due to undefined initial state
The hook initializes isMobile state as undefined, then converts it with !!isMobile before the effect runs. On server-side render, this returns false, but after client hydration when the effect executes, it might return true. This hydration mismatch will cause a warning in Next.js and potential layout shift. The initial state should match what the effect will set.
----

### badge.tsx
The `BadgeButton` component accepts `React.ComponentProps<'button'>` which includes button-specific properties like `onClick`, but when `asChild` is false (the default), it renders a `span` element. Span elements don't properly handle button event handlers and don't provide semantic button behavior. Consumers passing button props will see them silently ignored. @components/ui/badge.tsx:202-218 
----

### card.tsx
The `useCardContext` hook checks if context is falsy, but the context is initialized with a default value at creation, so the check will never be true. The error will never be thrown even when used outside of a Card component. @components/ui/card.tsx:16-23 
---

### button.tsx
The `Button` component passes `className` to the `buttonVariants()` CVA function instead of composing it with `cn()`. This causes any custom `className` prop to be ignored. The CVA function only recognizes its defined variant keys, so passing an unknown `className` key results in it being discarded. The className should be passed directly to `cn()` after the variants result. @components/ui/button.tsx:388-403 