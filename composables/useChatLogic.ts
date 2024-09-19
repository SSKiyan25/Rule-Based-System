interface Response {
  phase: number;
  condition: string[];
  response: string;
}

interface Question {
  phase: number;
  condition: string[];
  question: string;
}

export function useChatLogic(
  chatMessages: Ref<any[]>,
  currentPhase: Ref<number>,
  addFact: (rawInput: string, currentPhase: number) => Promise<string>
) {
  const questions = useState<Question[]>("questions", () => []);
  const isStopped = useState<Boolean>("isStopped", () => false);
  const responses = useState<Response[]>("responses", () => []);

  const loadResponses = async () => {
    const responsesData = await $fetch<Response[]>("/api/responses");
    responses.value = responsesData || [];
  };

  const deadEndResponses: Response[] = [
    {
      phase: 1,
      condition: ["no"],
      response: "Okay then get out Quack!! You're wasting my time*",
    },
    {
      phase: 2,
      condition: ["not in range"],
      response:
        "That's impossible quack! Are you even a human? If so, let's go to the Emergency room right away!!!",
    },
    { phase: 2, condition: ["no fever"], response: "Oh just take a rest." },
    {
      phase: 2,
      condition: ["high fever"],
      response:
        "Oh my goodness! You have a HIGH fever quack! Let's proceed to the hospital immediately!",
    },
    { phase: 2, condition: ["invalid"], response: "What?! Are you a human?" },
    {
      phase: 3,
      condition: ["heavyNasalBreathing"],
      response:
        "Quack that's tough! you have a sinus membranes swelling! We must go the Hospital so it can be treated better!",
    },
    {
      phase: 4,
      condition: ["no headache"],
      response:
        "Quack, at least you don't have a headache! Just drink a lot of water, eat healthy and have a good rest!",
    },
    {
      phase: 5,
      condition: ["no cough"],
      response:
        "Phew, that would be bad quack! Just drink a lot of water, eat healthy and have a good rest!",
    },
    {
      phase: 6,
      condition: ["cold", "not soreThroat"],
      response:
        "Quack seems like I don't have to treat you just drink a lot of water, eat healthy and have a good rest!",
    },
  ];

  const loadQuestions = async () => {
    const questionsData = await $fetch<Question[]>("/api/questions");
    questions.value = questionsData || [];
  };

  const getNextQuestion = async (phase: number) => {
    const question = questions.value.find((q) => q.phase === phase);
    return question ? question.question : null;
  };

  const getDeadEndResponse = (
    phase: number,
    condition: string
  ): string | null => {
    const deadEndResponse = deadEndResponses.find(
      (res) => res.phase === phase && res.condition.includes(condition)
    );
    return deadEndResponse ? deadEndResponse.response : null;
  };

  const getResponsesForCondition = async (phase: number, condition: string) => {
    const matchingResponses = responses.value.filter(
      (res) => res.phase === phase && res.condition.includes(condition)
    );

    // Return null if no matching responses are found
    if (matchingResponses.length === 0) {
      return null;
    }

    // Join the responses with newline characters
    return matchingResponses.map((res) => res.response).join("\n");
  };

  // Validate input based on the question type and possible range for numbers
  const validateInput = async (input: string) => {
    const validInputs: { [key: number]: string[] } = {
      1: ["yes", "no"],
      2: ["no fever", "low fever", "high fever", "not in range"],
      3: ["lightNasalBreathing", "heavyNasalBreathing"],
      4: ["headache", "no headache"],
      5: ["cough", "no cough"],
      6: ["soreThroat", "not soreThroat"],
      7: ["antibiotics allergy", "not antibiotics allergy"],
    };

    return validInputs[currentPhase.value]?.includes(input) || false;
  };

  const isDeadEndResponse = (phase: number, condition: string): boolean => {
    return deadEndResponses.some(
      (res) => res.phase === phase && res.condition.includes(condition)
    );
  };

  const refreshChat = async () => {
    const currentQuestion = await getNextQuestion(currentPhase.value);
    chatMessages.value.push({
      sender: "bot",
      text: currentQuestion,
    });
  };

  const initChat = async () => {
    chatMessages.value.push({
      sender: "bot",
      text: "Quack quack! Do you want a checkup?",
    });
  };

  const stopChat = async (responseText: string) => {
    isStopped.value = true;
    chatMessages.value.push({
      sender: "bot",
      text: responseText,
    });
  };

  const handleUserResponse = async (userInput: string) => {
    const interpretedFact = await addFact(userInput, currentPhase.value);
    const flag = await validateInput(interpretedFact);

    if (flag) {
      const responseText = await getResponsesForCondition(
        currentPhase.value,
        interpretedFact
      );
      if (responseText || currentPhase.value > 0) {
        if (isDeadEndResponse(currentPhase.value, interpretedFact)) {
          const deadEndResponse = getDeadEndResponse(
            currentPhase.value,
            interpretedFact
          );
          if (deadEndResponse) {
            await stopChat(deadEndResponse);
          }
          return;
        }
        chatMessages.value.push({ sender: "bot", text: responseText });
      }

      // Move to the next phase and refresh chat
      currentPhase.value++;
      await refreshChat();
    } else {
      // Handle invalid input
      const invalidResponse = await getNextQuestion(-1); // Phase -1 is invalid input phase
      chatMessages.value.push({
        sender: "bot",
        text: invalidResponse,
      });
      await refreshChat();
    }
  };
  loadQuestions();
  loadResponses();
  return { refreshChat, handleUserResponse, initChat, isStopped };
}
