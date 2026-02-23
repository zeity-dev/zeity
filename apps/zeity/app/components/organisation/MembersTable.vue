<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Column, Row } from '@tanstack/vue-table';
import type { OrganisationMember, OrganisationMemberRole } from '@zeity/types/organisation';
import {
  ORGANISATION_MEMBER_ROLE_ADMIN,
  ORGANISATION_MEMBER_ROLE_MEMBER,
  ORGANISATION_MEMBER_ROLE_OWNER,
} from '@zeity/types/organisation';
import type { PaginatedResponse } from '~~/shared/types/pagination';
import { findRoleColor, findRoleIcon, findRoleLabel } from '~/utils/organisation';

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const NuxtTime = resolveComponent('NuxtTime');

const { t } = useI18n();
const toast = useToast();

const params = defineProps({
  organisationId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['refresh']);

const sorting = ref([
  {
    id: 'name',
    desc: false,
  },
]);

const pagination = ref({
  pageIndex: 0,
  pageSize: 20,
});

const { status, data, refresh } = await useFetch<PaginatedResponse<OrganisationMember>>(
  () => `/api/organisation/${params.organisationId}/member`,
  {
    query: computed(() => ({
      offset: pagination.value.pageIndex * pagination.value.pageSize,
      limit: pagination.value.pageSize,

      sortingColumn: sorting.value[0]?.id,
      sortingOrder: sorting.value[0]?.desc ? 'desc' : 'asc',
    })),
  },
);

const membersColumns: TableColumn<OrganisationMember>[] = [
  {
    id: 'name',
    accessorKey: 'user.name',
    header: ({ column }) => getHeader(column, t('user.name')),
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: ({ column }) => getHeader(column, t('organisations.role')),
    cell: ({ row }) => {
      const icon = findRoleIcon(row.getValue('role'));
      const color = findRoleColor(row.getValue('role'));
      const label = findRoleLabel(row.getValue('role'));

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color, icon }, () => t(label));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => getHeader(column, t('organisations.members.addedAt')),
    cell: ({ row }) => {
      return h(NuxtTime, { datetime: row.original.createdAt });
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

function getHeader(column: Column<OrganisationMember>, label: string) {
  const isSorted = column.getIsSorted();

  const icon = isSorted
    ? isSorted === 'asc'
      ? 'i-lucide-arrow-up-narrow-wide'
      : 'i-lucide-arrow-down-wide-narrow'
    : 'i-lucide-arrow-up-down';

  return h(UButton, {
    label,
    icon,
    'trailing': true,
    'color': 'neutral',
    'variant': 'ghost',
    'class': '-mx-2.5 data-[state=open]:bg-elevated',
    'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`,
    'onClick': () => column.toggleSorting(),
  });
}

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
      disabled: !row.original.userId || row.original.role === ORGANISATION_MEMBER_ROLE_OWNER,
      onSelect() {
        setMemberRole(row.original.id, ORGANISATION_MEMBER_ROLE_OWNER);
      },
    },
    {
      icon: findRoleIcon(ORGANISATION_MEMBER_ROLE_ADMIN),
      label: t('organisations.members.setRole', {
        role: t('organisations.members.role.admin'),
      }),
      disabled: !row.original.userId || row.original.role === ORGANISATION_MEMBER_ROLE_ADMIN,
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
  return $fetch(`/api/organisation/${params.organisationId}/member/${memberId}`, {
    method: 'DELETE',
  })
    .then(() => {
      toast.add({
        color: 'success',
        title: t('organisations.members.deleteSuccess'),
      });
      refresh();
      emit('refresh');
    })
    .catch(error => {
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
    .catch(error => {
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
      v-model:sorting="sorting"
      :loading="status === 'pending'"
      :data="data?.items"
      :columns="membersColumns"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :src="getUserImagePath(row.original.user)" :alt="`${row.original.user?.name}`" />
          <p class="font-medium text-highlighted">
            {{ row.original.user?.name || t('user.deleted') }}
          </p>
        </div>
      </template>
    </UTable>

    <div
      class="flex items-center justify-center md:justify-end gap-3 border-t border-default pt-4 mt-auto"
    >
      <div class="flex items-center gap-1.5">
        <UPagination
          :default-page="(pagination.pageIndex || 0) + 1"
          :items-per-page="pagination.pageSize"
          :total="data?.total || 0"
          @update:page="(page: number) => (pagination.pageIndex = page - 1)"
        />
      </div>
    </div>
  </UPageCard>
</template>
