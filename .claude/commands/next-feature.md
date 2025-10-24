# Next Feature Recommendation

Recommends the next feature to implement based on dependencies, priority, and complexity.

## Implementation

This command should intelligently recommend what to work on next:

1. **Analyze dependencies:**
   - Identify prerequisite features
   - Block features that depend on unimplemented prerequisites
   - Example: Can't implement notifications without SignalR setup

2. **Consider priority:**
   - High: Critical features, blockers for other features
   - Medium: Important but not blocking
   - Low: Nice-to-have enhancements

3. **Consider complexity:**
   - Mix quick wins (1-3 days) with complex features (1-2 weeks)
   - Suggest easier features for momentum
   - Suggest complex features when time available

4. **Consider phase progression:**
   - Prefer completing current phase before moving to next
   - But allow jumping ahead for urgent needs

5. **Recommendation output:**
   - Recommended feature with rationale
   - Why this feature now?
   - What it unlocks (dependent features)
   - Estimated effort
   - Alternative options (2-3 other candidates)

6. **Interactive mode:**
   - Show top 3 recommendations
   - Allow user to select or skip
   - Update tracking after selection

## Usage
```bash
/next-feature
```

## Example Output
```
🎯 Recommended Next Feature: /implement-multitenancy

Why now:
- Foundation for all enterprise features
- Blocks: subscriptions, organization settings, GDPR compliance
- High business value
- Estimated effort: 12-16 hours

This feature unlocks:
  ✓ /implement-subscriptions
  ✓ /add-gdpr-compliance
  ✓ All organization-specific features

Alternative options:
  2. /expose-export-ui (Quick win, 2-3 hours, high user value)
  3. /add-dark-mode (Quick win, 2-3 hours, UX improvement)
```

Execute this command to get intelligent feature recommendations.
