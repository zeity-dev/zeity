<script setup lang="ts">
const props = defineProps<{
  taskId: string;
}>();

const { loadAssignments, addAssignment, removeAssignment } = useTask();
const { userHasOrganisationRole, currentOrganisationId } = useOrganisation();

const assignments = ref<any[]>([]);
const isLoading = ref(false);

const canManage = computed(() =>
  userHasOrganisationRole(currentOrganisationId.value!, ['owner', 'admin']),
);

async function load() {
  isLoading.value = true;
  try {
    const data = await loadAssignments(props.taskId);
    assignments.value = data || [];
  } finally {
    isLoading.value = false;
  }
}

async function handleAdd(memberId: string) {
  try {
    await addAssignment(props.taskId, memberId);
    await load();
  } catch {
    // handled by caller
  }
}

async function handleRemove(memberId: string) {
  try {
    await removeAssignment(props.taskId, memberId);
    assignments.value = assignments.value.filter(a => a.organisationMemberId !== memberId);
  } catch {
    // handled by caller
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm font-semibold">
        {{ $t('tasks.assignments.title') }}
      </h4>
      <TaskAssignmentAdd
        v-if="canManage"
        :task-id="taskId"
        :existing-member-ids="assignments.map(a => a.organisationMemberId)"
        @add="handleAdd"
      />
    </div>

    <div v-if="isLoading" class="text-sm text-muted">{{ $t('common.loadMore') }}...</div>

    <div v-else-if="assignments.length === 0" class="text-sm text-muted">
      {{ $t('tasks.assignments.empty') }}
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="assignment in assignments"
        :key="assignment.organisationMemberId"
        class="flex items-center justify-between gap-2 p-2 rounded-md border border-default"
      >
        <div class="flex items-center gap-2 min-w-0">
          <UAvatar
            :src="getUserImagePath(assignment.user)"
            :alt="assignment.user?.name"
            size="sm"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">
              {{ assignment.user?.name || $t('user.deleted') }}
            </p>
          </div>
        </div>
        <UButton
          v-if="canManage"
          icon="i-lucide-x"
          color="error"
          variant="ghost"
          size="xs"
          @click="handleRemove(assignment.organisationMemberId)"
        />
      </div>
    </div>
  </div>
</template>
