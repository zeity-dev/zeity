import type { NewOrganisationTeam } from '@zeity/database/organisation-team';
import type {
  NewOrganisation,
  Organisation,
  OrganisationMemberRole,
} from '@zeity/types/organisation';

export function useOrganisation() {
  const store = useOrganisationStore();
  const { currentOrganisation, currentOrganisationId } = storeToRefs(store);

  async function createOrganisation(data: Organisation | NewOrganisation) {
    store.setLoading(true);
    return $fetch('/api/organisation', {
      method: 'POST',
      body: data,
    })
      .then(async (data) => {
        await useUser().reloadUser();
        return data;
      })
      .finally(() => {
        store.setLoading(false);
      });
  }

  async function createOrganisationTeam(
    orgId: string,
    data: Partial<NewOrganisationTeam>,
  ) {
    store.setLoading(true);
    return (
      $fetch(`/api/organisation/${orgId}/team`, {
        method: 'POST',
        body: data,
      })
        // TODO: add org team to store
        // .then((data) => {
        //   if (data?.id) {
        //     store.insertOrganisation(data);
        //   }
        //   return data;
        // })
        .finally(() => {
          store.setLoading(false);
        })
    );
  }

  function uploadOrganisationImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return $fetch(`/api/organisation/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  function getAllOrganisations() {
    return store.getAllOrganisations();
  }

  function userHasOrganisationRole(
    orgId: string | number,
    roles: OrganisationMemberRole[],
  ) {
    const organisation = store.findOrganisationById(orgId);
    return computed(() => {
      if (!organisation.value) return false;

      return roles.includes(organisation.value.member.role);
    });
  }

  return {
    loading: store.loading,
    currentOrganisation,
    currentOrganisationId,
    setCurrentOrganisationId: store.setCurrentOrganisationId,

    createOrganisation,
    uploadOrganisationImage,

    createOrganisationTeam,

    getAllOrganisations,
    findOrganisationById: store.findOrganisationById,

    userHasOrganisationRole,
  };
}
