"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getStoredUser, getToken } from "@/lib/api";
import type { User } from "@/types/finance";

export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
    setReady(true);
  }, [router]);

  return { user, ready };
}

