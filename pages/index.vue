<script setup lang="ts"></script>
<template>
  <div
    class="min-h-screen max-w-[50rem] max-h-screen flex flex-col mx-auto justify-center items-center content-center"
  >
    <div class="text-center py-10 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-center items-center p-2">
        <img src="/logo.png" class="w-[100px] h-auto" />
        <h1
          class="block text-4xl font-bold text-secondary-foreground sm:text-6xl pl-4"
        >
          Quack
        </h1>
      </div>

      <p class="mt-3 text-lg text-secondary-foreground">
        A website for a simple rule-based system simulation made by using NuxtJS
        and Typescript.
      </p>
      <div
        class="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3"
      >
        <NuxtLink
          to="/dashboard"
          :transition="{
            name: 'bounce',
            mode: 'out-in',
          }"
        >
          <Button variant="outline" class="">
            Get Started
            <ArrowRightToLine class="pl-2" />
          </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
