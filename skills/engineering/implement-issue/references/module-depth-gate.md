# Module Depth Gate

Use this gate before the first implementation slice. Its purpose is to keep a routine internal change routine while detecting work that needs an explicit module design.

Require `$design-modules` before coding when the Issue does one or more of the following:

- Introduces a product capability that can be named in domain language.
- Adds or materially expands a public interface.
- Makes a caller coordinate three or more ordered steps, intermediate values, or failure handling.
- Moves a business rule, lifecycle, persistence concern, or third-party integration across owners.
- Requires one rule to change in unrelated modules or creates a second owner for that rule.
- Lacks a stable public seam through which the requested behavior can be tested.

During design, prefer a boundary where callers use one small domain-facing interface and implementation changes remain behind it. Internal complexity may span multiple files; file length and file count are not evidence of module depth.

Do not require a design pass for a behavior change that stays behind an established public contract, or for mechanical edits that do not change ownership or dependency direction.
