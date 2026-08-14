import { getSavedMyGroupProfile } from "../lib/profile-storage";

export function useMyGroupProfileQuery() {
  return {
    data: getSavedMyGroupProfile(),
    isLoading: false,
  };
}
