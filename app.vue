<script setup lang="ts">
useHead({
  title: "Quack",
  meta: [
    {
      name: "Quack",
      content: "Rule-based System for Intelligent Systems",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/logo.png",
    },
  ],
});
</script>
<template>
  <div class="">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
