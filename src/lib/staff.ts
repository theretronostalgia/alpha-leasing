/** Work emails that open the office inbox. Matching is case-insensitive. */
const STAFF_EMAILS = [
  "richbell@alphaleasingllc.com",
  "kenbell@alphaleasingllc.com",
  "alphaleasing@outlook.com",
  "sharonschoppman@alphaleasingllc.com",
  "sharonschoppman@alphaleasing.llc",
  "123456@staff.alphaleasing.test",
];

export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return STAFF_EMAILS.includes(email.trim().toLowerCase());
}
