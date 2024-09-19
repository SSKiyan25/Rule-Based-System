<script setup lang="ts">
interface Rule {
  antecedent: string[];
  consequent: string;
}

const rules = ref<Rule[]>([]);
const coloredConsequents = ref<Set<string>>(new Set());

// Fetch rules from knowledge_base.json
const fetchRules = async () => {
  try {
    const url = "/knowledge_base.json";
    const response = await fetch(url);

    //const { data: response} = await useFetch('api/rules')
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    rules.value = data.rules;
  } catch (error) {
    console.error("Error fetching the knowledge base:", error);
  }
};

// Fetch consequences from consequences.json
const fetchConsequences = async (): Promise<string[]> => {
  try {
    const url = "/api/consequences";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching consequences:", error);
    return [];
  }
};

const updateColoredConsequents = (consequences: string[]) => {
  const colored = new Set<string>();

  rules.value.forEach((rule) => {
    if (consequences.includes(rule.consequent)) {
      colored.add(rule.consequent);
    }
  });

  coloredConsequents.value = colored;
};

// Load initial rules and consequences on mount
onMounted(async () => {
  await fetchRules();

  const initialConsequences = await fetchConsequences();
  updateColoredConsequents(initialConsequences);
  setInterval(async () => {
    const updatedConsequences = await fetchConsequences();
    updateColoredConsequents(updatedConsequences);
  }, 1000);
});
</script>

<template>
  <div class="overflow-x-auto my-8 px-8">
    <table class="min-w-full bg-white border border-gray-300">
      <thead>
        <tr class="text-sm sm:text-lg">
          <th class="px-4 py-2 border-b text-left">No.</th>
          <th class="px-4 py-2 border-b text-left">Antecedent</th>
          <th class="px-4 py-2 border-b text-left">Consequent</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(rule, index) in rules"
          :key="index"
          class="text-[10px] sm:text-sm"
        >
          <td class="px-4 py-2 border-b">{{ index + 1 }}</td>
          <td class="px-4 py-2 border-b whitespace-normal break-words">
            {{ rule.antecedent.join(" AND ") }}
          </td>
          <td class="px-4 py-2 border-b whitespace-normal break-words">
            <!--If condition met/not-->
            <div
              class="rounded-xl py-1 text-center sm:text-left"
              :class="{
                'bg-emerald-200': coloredConsequents.has(rule.consequent),
              }"
            >
              <p class="text-[12px] pl-0 sm:pl-1">{{ rule.consequent }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
