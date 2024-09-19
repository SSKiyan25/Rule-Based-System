<script setup lang="ts">
const props = defineProps<{
  header: string;
  subheader?: string;
}>();
</script>

<template>
  <div class="flex flex-col justify-center">
    <div
      class="flex justify-center items-center border-b pb-3 pt-3 bg-neutral-200"
    >
      <p class="text-2xl font-semibold">{{ props.header }}</p>
    </div>
    <div class="flex flex-col justify-center">
      <div
        v-if="props.subheader"
        class="flex flex-row justify-between items-center px-12 pt-8 pb-4"
      >
        <p class="text-md font-semibold sm:text-xl">
          {{ props.subheader }}
        </p>
      </div>
      <div class="flex justify-center items-center">
        <hr class="w-11/12 px-2" />
      </div>
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>
