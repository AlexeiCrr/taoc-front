# Admin Components Index

| File                 | Contents (WHAT)                                                                                                  | Read When (WHEN)                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `AdminDataGrid.tsx`  | Data grid with pagination, sortable columns (User Data + dynamic Frequencies), date formatting, loading states, clickable rows navigating to /response/:id | Debugging table rendering, adding columns, modifying pagination, changing formats, modifying row navigation  |
| `AdminFilters.tsx`   | Filter inputs (name, email, licenseCode, date) with Apply/Clear buttons, controlled input state, Enter key support, Roboto font | Adding filter fields, debugging filter application, changing filter UX             |
| `AdminLayout.tsx`    | Dark theme wrapper for admin pages, applies `.dark` class to enable dark mode CSS variables | Adding admin pages, changing theme behavior, debugging dark mode |
| `ManageLicensesDialog.tsx` | Dialog for generating license codes with amount input (1-10000), tier selector (1/3/7), CSV download with timestamp filename, loading states, validation | Adding license generation, debugging license workflow, modifying license tiers, changing CSV format |
| `UserDataCard.tsx`   | Inline-editable user data (firstName, lastName, email, licenseTier display), view/edit/saving states, validation, API updates | Modifying edit behavior, adding user fields, debugging save errors, changing validation, displaying license tier |
| `README.md`          | Architecture decisions, data flow, invariants (sourced from plan Invisible Knowledge section)                    | Understanding component relationships, modifying integration, debugging state flow |
