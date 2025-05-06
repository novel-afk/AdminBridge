Changes Summary


## Employee Module
- Modified AddEmployeeModal.jsx to enforce branch assignment for non-SuperAdmin users
- Updated EditEmployeeModal.jsx to restrict branch selection to SuperAdmin users
- Added enforcement in form submissions to always use the user's branch for non-SuperAdmin users

## Student Module
- Modified AddStudentModal.jsx to enforce branch assignment for non-SuperAdmin users
- Updated branch selection UIs to show read-only display for non-SuperAdmin users
- Added enforcement in form submissions to always use the user's branch for non-SuperAdmin users

## Lead Module
- Modified AddLeadModal.jsx to enforce branch assignment for non-SuperAdmin users
- Updated EditLeadModal.jsx to restrict branch selection to SuperAdmin users
- Added enforcement in form submissions to always use the user's branch for non-SuperAdmin users

## General
- Updated the User type definition in AuthContext.tsx to include profile_image property
- Fixed linter errors related to null checks
