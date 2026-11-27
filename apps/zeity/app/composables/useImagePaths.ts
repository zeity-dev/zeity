import type { Organisation } from '@zeity/database/organisation';
import type { User } from '@zeity/database/user';
import { useRequestOrigin } from '~/composables/useRequestOrigin';

export const useImagePaths = () => {
  const origin = useRequestOrigin();

  const getUserImagePath = (user: Partial<Pick<User, 'id' | 'image'>> | null | undefined) => {
    if (user?.image && user.id) {
      return `${origin}/user/${user.id}/image`;
    }
    return undefined;
  };

  const getOrganisationImagePath = (
    org: Partial<Pick<Organisation, 'id' | 'image'>> | null | undefined,
  ) => {
    if (org?.image && org.id) {
      return `${origin}/organisation/${org.id}/image`;
    }
    return undefined;
  };

  return {
    getUserImagePath,
    getOrganisationImagePath,
  };
};
