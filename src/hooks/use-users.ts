import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { UserOut } from "@/types/api";

export function useUsers() {
  return useQuery<{ users: UserOut[] }, Error>({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
    staleTime: 60000, // Cache for 1 minute
  });
}
