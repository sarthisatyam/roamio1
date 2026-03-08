

## Add More Gender Options to Profile Dropdown

### What changes

**File: `src/components/dialogs/AccountSectionDialogs.tsx`**

Update the `GENDER_OPTIONS` array (line 857-861) to include more preset options:

```typescript
const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non-binary" },
  { label: "Genderfluid", value: "genderfluid" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
  { label: "Other", value: "other" },
];
```

No other changes needed. The PlanBuilder gender gating already works correctly — it checks for "male" or "female" to enable gender-restricted plan creation. Users who select other options will only be able to create "Everyone" plans, which is the expected behavior.

