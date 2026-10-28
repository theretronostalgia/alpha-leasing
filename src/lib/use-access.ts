import { useEffect, useState } from "react";
import { myAccess } from "@/lib/access.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isStaffEmail } from "@/lib/staff";
import { OFFICE_PERMISSIONS, type Permission } from "@/lib/access";

export function useAccess() {
  const { user, isPending } = useCurrentUserState();
  const [permissions, setPermissions] = useState<Permission[] | null>(null);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      return;
    }
    if (isStaffEmail(user.primaryEmail)) {
      setPermissions(OFFICE_PERMISSIONS);
      return;
    }
    void myAccess()
      .then((result) => setPermissions(result.permissions))
      .catch(() => setPermissions([]));
  }, [user]);

  return { user, isPending, permissions };
}
