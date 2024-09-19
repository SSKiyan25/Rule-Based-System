<script setup lang="ts"></script>
<template>
  <div class="min-h-screen min-w-screen mx-auto">
    <div class="flex flex-col sm:grid sm:grid-cols-2 sm:gap-5 p-5">
      <div
        class="flex flex-col border sm:col-span-0.5 h-auto sm:min-h-screen bg-neutral-50 rounded-sm"
      >
        <DashboardCard header="Rule Base System" subheader="Rules">
          <RuleData />
        </DashboardCard>
      </div>

      <div
        class="flex-flex-col sm:mt-0 border sm:col-span-1 min-h-screen bg-neutral-50 rounded-sm"
      >
        <DashboardCard header="Generate Diagnosis">
          <SymptomForwardContent />
        </DashboardCard>
      </div>
    </div>
  </div>
</template>
