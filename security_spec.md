# Security Specification: HAMBAK TECH & SERVICES Firestore Rules

## 1. Data Invariants
1. A user can only access, update, or read their own `/users/{userId}` record, unless they are the verified administrator (`fatimohmusbau34@gmail.com`).
2. Only verified administrators can create, update, or delete entries in `/services/{serviceId}`. Anyone (public) can read active services.
3. Anyone can submit an `/inquiries/{inquiryId}` or `/registrations/{registrationId}` with proper schema validation. Authenticated users can list and view their own registrations using their tracking ID or userId match; admins can list and update status.
4. `/transactions/{transactionId}` and `/vtu_orders/{orderId}` must be tied to either the authenticated user's ID or created with a valid reference. Once a transaction status is `successful` or `failed`, non-admin users cannot alter the amount, reference, or recipient.
5. Administrative rights are strictly bound to verified admin emails (`fatimohmusbau34@gmail.com`).

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated User Profile Overwrite**: Unauthenticated write to `/users/any-uid` with arbitrary data. (Must reject).
2. **Identity Spoofing on User Profile**: Authenticated User A attempting to write `/users/userB-uid`. (Must reject).
3. **Ghost / Shadow Field Injection**: Writing extra unauthorized properties like `role: "admin"` into user profiles during standard customer updates. (Must reject).
4. **Service Mutation by Non-Admin**: Non-admin client attempting to change pricing in `/services/{serviceId}`. (Must reject).
5. **Transaction Tampering**: Non-admin user updating a completed transaction amount from ₦5,000 to ₦50,000. (Must reject).
6. **Malicious ID Injection (Resource Poisoning)**: Submitting path with >128 chars or illegal characters for `{registrationId}`. (Must reject).
7. **Negative or Zero Amount in Transaction**: Submitting `amount: -5000` to manipulate balances. (Must reject).
8. **Inquiry with Excess String Size**: Attempting Denial-of-Wallet payload with 2MB message field. (Must reject).
9. **Registration Status Bypass**: Client attempting to self-mark a registration as `status: "approved"` without admin privileges. (Must reject).
10. **Blanket Read of All Transactions**: Client attempting `allow list` without user isolation or admin rights. (Must reject).
11. **VTU Tampering**: Mutating network provider or meter number after submission. (Must reject).
12. **PII Scraping on User Accounts**: Anonymous or non-owner user attempting to query all user profiles. (Must reject).
