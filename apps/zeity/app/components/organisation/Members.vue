<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Row } from '@tanstack/vue-table';
import type {
  OrganisationMember,
  OrganisationMemberRole,
} from '@zeity/types/organisation';
import {
  ORGANISATION_MEMBER_ROLE_ADMIN,
  ORGANISATION_MEMBER_ROLE_MEMBER,
  ORGANISATION_MEMBER_ROLE_OWNER,
} from '@zeity/types/organisation';
import {
  findRoleColor,
  findRoleIcon,
  findRoleLabel,
} from '~/utils/organisation';

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UDropdownMenu = resolveComponent('UDropdownMenu');

const { t } = useI18n();
const toast = useToast();

const params = defineProps({
  organisationId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['refresh']);

const { status, data, refresh } = await useFetch<OrganisationMember[]>(
  () => `/api/organisation/${params.organisationId}/member`,
);

const membersColumns: TableColumn<OrganisationMember>[] = [
  {
    id: 'name',
    accessorKey: 'user.name',
    header: 'Name',
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const icon = findRoleIcon(row.getValue('role'));
      const color = findRoleColor(row.getValue('role'));
      const label = findRoleLabel(row.getValue('role'));

      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color, icon },
        () => t(label),
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end',
            },
            items: getMemberActionItems(row),
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
            }),
        ),
      );
    },
  },
];

function getMemberActionItems(row: Row<OrganisationMember>) {
  return [
    {
      type: 'label',
      icon: 'i-lucide-sliders-vertical',
      label: t('common.actions'),
    },
    {
      type: 'separator',
    },
    {
      icon: findRoleIcon(ORGANISATION_MEMBER_ROLE_OWNER),
      label: t('organisations.members.setRole', {
        role: t('organisations.members.role.owner'),
      }),
      disabled:
        !row.original.userId ||
        row.original.role === ORGANISATION_MEMBER_ROLE_OWNER,
      onSelect() {
        setMemberRole(row.original.id, ORGANISATION_MEMBER_ROLE_OWNER);
      },
    },
    {
      icon: findRoleIcon(ORGANISATION_MEMBER_ROLE_ADMIN),
      label: t('organisations.members.setRole', {
        role: t('organisations.members.role.admin'),
      }),
      disabled:
        !row.original.userId ||
        row.original.role === ORGANISATION_MEMBER_ROLE_ADMIN,
      onSelect() {
        setMemberRole(row.original.id, ORGANISATION_MEMBER_ROLE_ADMIN);
      },
    },
    {
      icon: findRoleIcon(ORGANISATION_MEMBER_ROLE_MEMBER),
      label: t('organisations.members.setRole', {
        role: t('organisations.members.role.member'),
      }),
      disabled: row.original.role === ORGANISATION_MEMBER_ROLE_MEMBER,
      onSelect() {
        setMemberRole(row.original.id, ORGANISATION_MEMBER_ROLE_MEMBER);
      },
    },
    {
      icon: 'i-lucide-trash',
      label: t('common.delete'),
      onSelect() {
        deleteMember(row.original.id);
      },
    },
  ];
}

function deleteMember(memberId: string) {
  return $fetch(
    `/api/organisation/${params.organisationId}/member/${memberId}`,
    {
      method: 'DELETE',
    },
  )
    .then(() => {
      toast.add({
        color: 'success',
        title: t('organisations.members.deleteSuccess'),
      });
      refresh();
      emit('refresh');
    })
    .catch((error) => {
      console.error(error);
      toast.add({
        color: 'error',
        title: t('organisations.members.deleteError'),
      });
    });
}

function setMemberRole(memberId: string, role: OrganisationMemberRole) {
  $fetch(`/api/organisation/${params.organisationId}/member/${memberId}`, {
    method: 'PATCH',
    body: {
      role,
    },
  })
    .then(() => {
      toast.add({
        color: 'success',
        title: t('organisations.members.roleUpdateSuccess'),
      });
      refresh();
      emit('refresh');
    })
    .catch((error) => {
      console.error(error);
      toast.add({
        color: 'error',
        title: t('organisations.members.roleUpdateError'),
      });
    });
}
</script>

<template>
  <UPageCard :title="$t('organisations.members.title')">
    <UTable
      :loading="status === 'pending'"
      :data="data"
      :columns="membersColumns"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="getUserImagePath(row.original.user)"
            :alt="`${row.original.user?.name}`"
          />
          <p class="font-medium text-highlighted">
            {{ row.original.user?.name || t('user.deleted') }}
          </p>
        </div>
      </template>
    </UTable>
  </UPageCard>
</template>
