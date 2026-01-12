## Known issues from AI code review

### use-mobile.tsx

Hydration mismatch in `useIsMobile` hook due to undefined initial state
The hook initializes isMobile state as undefined, then converts it with !!isMobile before the effect runs. On server-side render, this returns false, but after client hydration when the effect executes, it might return true. This hydration mismatch will cause a warning in Next.js and potential layout shift. The initial state should match what the effect will set.

### sheet.tsx

Hydration mismatch in `useIsMobile` hook due to undefined initial state
The hook initializes isMobile state as undefined, then converts it with !!isMobile before the effect runs. On server-side render, this returns false, but after client hydration when the effect executes, it might return true. This hydration mismatch will cause a warning in Next.js and potential layout shift. The initial state should match what the effect will set.
----
