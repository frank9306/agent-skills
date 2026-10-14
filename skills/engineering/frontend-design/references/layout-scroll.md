# Layout and Scroll

## Choose the owner

Choose scrolling from the task. Reading/detail/form pages generally grow with document scrolling. Workspaces can keep their shell in view and scroll named panes independently. Wide tables/code can scroll horizontally in their own region. One reading area usually has one vertical scroll owner; independent panes are legitimate.

Record regions, each axis's owner, available-size constraints, fixed/sticky elements, boundary chaining, overflow exceptions and small-screen reflow. Overlays also define background lock, internal scrolling, focus and closing/restoration. Example desktop workspace: document stationary; main/navigation independently scroll; toolbar stays visible; only the table scrolls horizontally. Mobile may deliberately return to document scrolling.

## Implement constraints

Trace available height/width through ancestors. Shrinking Flex/Grid items may need min-height/min-width: 0 and minmax(0, 1fr) tracks at the relevant owner. Scrolling needs constrained space as well as overflow. Key information grows or wraps and actions remain reachable.

Inspect computed sizes and overflow ancestors before adding offsets or z-index. Sticky position depends on its scroll context. Scoped clipping can be intentional; demonstrate that content and focus stay accessible. Overscroll containment controls chaining, not sizing. Stable scrollbar gutters reduce some classic-scrollbar width shifts. Test viewport units against low windows and mobile browser/keyboard behavior.

## Measure behavior

Use the contract in [visual review](visual-review.md). Wheel input must move its intended region, preserve stationary regions and honor the boundary rule. Empty/non-overflowing states cannot prove scrolling: prepare overflowing content or record a reasoned not-applicable check.

Pinned checks verify position while the named scroller actually moves. Reachability scrolls an action into view and hit-tests it. Overlay checks sample an exposed backdrop and current focus containment. Full focus trapping, closing and restoration require caller-owned interaction tests, checking before and after their actions.

Test long/localized content, viewport height as well as width, data pressure and state transitions. Default geometric tolerance is 1 CSS px; different tolerances need reasons. Express intentional overlaps/local scroll through scoped assertions rather than a global overflow ignore.

## Coverage boundary

The helper measures named targets in the current Page. `document` is the reserved scroll target. Cross-frame/native UI, closed shadow roots, touch physics and virtual keyboards require project/device tests. Reachability samples the element's center, not every pixel. Heuristic source findings cannot certify layout or all possible content.
