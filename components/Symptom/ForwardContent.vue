<script setup lang="ts">
import { useFacts } from "~/composables/useFacts";
import { useChatLogic } from "~/composables/useChatLogic";

// Refs for user input, chat messages, and the current phase
const userInput = ref<string>("");
const chatMessages = ref<any[]>([]);
const isProcessing = ref(false);
const currentPhase = useState<number>("currentPhase", () => 1);

// Composables for managing facts, forward chaining, and chat logic
const { facts, error, addFact } = useFacts();
const { handleUserResponse, initChat, isStopped } = useChatLogic(
  chatMessages,
  currentPhase,
  addFact
);

onMounted(() => {
  reset();
});

// Computed property to check if facts is empty
const isFactsEmpty = computed(() => !facts.value || facts.value.length === 0);
const isDone = computed(() => currentPhase.value === 8);

watchEffect(async () => {
  if (isFactsEmpty.value) {
    await initChat();
  }
});

// Function to send user message and process response
const sendMessage = async () => {
  if (userInput.value.trim() && !isProcessing.value) {
    isProcessing.value = true; // Prevent multiple sends during processing
    // Add user's input to the chatMessages array
    chatMessages.value.push({
      sender: "user",
      text: userInput.value,
    });
    // Process the user's input and continue chat flow
    await handleUserResponse(userInput.value);
    // Clear user input after processing
    userInput.value = "";
    isProcessing.value = false;
  }
};

// Function to reset the chat, including facts and consequences
const reset = async () => {
  try {
    await $fetch("/api/facts", { method: "DELETE" });
    await $fetch("/api/consequences", { method: "DELETE" });

    // Clear frontend state for facts and chat
    facts.value = [];
    chatMessages.value = [];
    currentPhase.value = 1;
    isStopped.value = false;
  } catch (error) {
    console.error("Error resetting chat:", error);
  }
};

// Watch for errors in the facts composable and alert user
watch(error, (err) => {
  if (err) {
    console.error("Error from useFacts:", err);
    alert(`Error: ${err.message}`);
  }
});
</script>

<template>
  <div class="flex flex-col justify-center pb-8 mt-3">
    <div
      class="flex flex-row justify-between items-centers px-4 sm:px-12 py-3 border-b"
    >
      <div><h2 class="text-md sm:text-xl font-semibold">Symptom/s</h2></div>
      <div class="flex flex-row">
        <Button
          :disabled="isFactsEmpty"
          @click="reset"
          variant="destructive"
          class="ml-2"
          >Reset</Button
        >
      </div>
    </div>

    <!-- Chatbox -->
    <div
      class="flex flex-col w-4/5 border-2 rounded-sm mx-auto mt-5 bg-white h-[36rem] shadow-md overflow-y-auto"
    >
      <!-- Chat messages -->
      <div class="flex-grow flex flex-col-reverse h-full overflow-y-auto p-4">
        <div
          v-for="message in chatMessages.slice().reverse()"
          :key="message.text"
          class="flex flex-col w-full"
        >
          <div
            v-if="message.sender === 'bot' && message.text"
            class="inline-block bg-neutral-200 p-2 rounded-xl mb-2"
          >
            <div class="flex flex-row items-center">
              <IconsDuck />
              <div class="flex flex-col pl-2">
                <p class="font-semibold">Quack Doctor</p>
                <p class="text-[10px] sm:text-sm">{{ message.text }}</p>
              </div>
            </div>
          </div>
          <div
            v-if="message.sender === 'user'"
            class="flex flex-col items-end justify-end mt-4 bg-emerald-100 p-2 rounded-xl mb-2"
          >
            <div class="flex flex-row items-center">
              <div class="flex flex-col items-end pr-2">
                <p class="font-semibold">You</p>
                <p class="text-[10px] sm:text-sm">{{ message.text }}</p>
              </div>
              <IconsUserAvatar />
            </div>
          </div>
        </div>
      </div>
      <!-- Input box -->
      <div class="flex flex-row justify-center items p-4">
        <input
          v-model="userInput"
          type="text"
          :disabled="isDone || isStopped ? true : undefined"
          :class="{ 'opacity-50 cursor-not-allowed': isDone || isStopped }"
          class="w-11/12 rounded-sm text-sm sm:text-md"
          placeholder="Respond here..."
          @keydown.enter="sendMessage"
          title="If disabled, click reset button to restart"
        />
        <div v-if="!isDone || !isStopped">
          <Button
            @click="sendMessage"
            :disabled="isDone || isStopped"
            class="ml-2"
            :class="{ 'cursor-not-allowed opacity-50': isDone || isStopped }"
            >Send</Button
          >
        </div>

        <div v-if="isDone || isStopped">
          <Button @click="reset" variant="destructive" class="ml-2"
            >Reset</Button
          >
        </div>
      </div>
    </div>
    <div class="pl-[3rem] sm:pl-[5rem] pt-2">
      <p class="italic text-[10px] sm:text-[12px] text-gray-500">
        See the consequent column for the facts consequent generated.
      </p>
    </div>
  </div>
</template>
