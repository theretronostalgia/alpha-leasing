export const PERMISSIONS = [
  { key: "users.manage", label: "Manage Users" },
  { key: "roles.manage", label: "Manage Roles" },
  { key: "pages.edit", label: "Edit Pages" },
  { key: "applications.view", label: "View Applications" },
  { key: "quotes.view", label: "View Rate Quotes" },
  { key: "orders.view", label: "View Store Orders" },
  { key: "positions.manage", label: "Manage Positions" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["key"];

export const OFFICE_PERMISSIONS: Permission[] = PERMISSIONS.map((item) => item.key);

export function employeeEmail(employeeNumber: string) {
  return `${employeeNumber.trim()}@staff.alphaleasing.test`;
}
