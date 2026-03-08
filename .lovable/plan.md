

## Plan: Remove Phone Auth Tab

Remove the phone authentication option from the Auth page, keeping only email-based signup/login.

### Changes

**`src/pages/Auth.tsx`**:
- Remove the `authMethod` state and `Tabs`/`TabsList`/`TabsTrigger` wrapper around email/phone
- Remove the phone `TabsContent` block entirely
- Remove `phone` state, `phoneSchema`, and phone-related validation/error handling
- Remove the phone auth branches in `handleAuth`
- Remove `Phone` and `Mail` icon imports (Mail no longer needed as tab icon)
- Keep the email input fields inline (no longer inside a `TabsContent`)

