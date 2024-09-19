export interface Fact {
  raw: string;
  interpreted: string;
  conclusion: string;
}

export interface Rule {
  antecedent: string[];
  consequent: string;
}

export function useFacts() {
  const {
    data: facts,
    error,
    refresh,
  } = useAsyncData<Fact[]>("/api/facts", () => $fetch("/api/facts"));

  const addFact = async (
    rawInput: string,
    currentPhase: number
  ): Promise<string> => {
    const interpreted = await interpretInput(rawInput, currentPhase);
    await setConclusion(interpreted);
    await checkConclusions();

    try {
      // Store fact in the Json
      const response = await $fetch("/api/facts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { raw: rawInput, interpreted },
      });

      if (response.status !== "success") {
        throw new Error("POST: Network response was not ok");
      }

      await refresh(); // Refresh the facts data
    } catch (error) {
      console.error(error);
    }

    return interpreted;
  };

  const interpretInput = async (
    input: string,
    currentPhase: number
  ): Promise<string> => {
    const normalizedInput = input.toLowerCase().trim();

    const yesNoMatch = (input: string) =>
      /yes|ye|yep|yeah|i think i have|opo/.test(input)
        ? "yes"
        : /no|nope|nah|hmm|dili|wala|i don't think i have|i dont think i have/.test(
            input
          )
        ? "no"
        : null;

    if (
      currentPhase === 1 ||
      currentPhase === 4 ||
      currentPhase === 5 ||
      currentPhase === 6 ||
      currentPhase === 7
    ) {
      const result = yesNoMatch(normalizedInput);
      if (result) {
        switch (currentPhase) {
          case 1:
            return result;
          case 4:
            return result === "yes" ? "headache" : "no headache";
          case 5:
            return result === "yes" ? "cough" : "no cough";
          case 6:
            return result === "yes" ? "soreThroat" : "not soreThroat";
          case 7:
            return result === "yes"
              ? "antibiotics allergy"
              : "not antibiotics allergy";
        }
      }
    }

    if (currentPhase === 2) {
      const tempMatch = normalizedInput.match(/(\d+(\.\d+)?)/);
      if (tempMatch) {
        const temperature = parseFloat(tempMatch[0]);
        if (temperature < 37 && temperature > 35) return "no fever";
        if (temperature < 38 && temperature > 37) return "low fever";
        if (temperature < 41 && temperature > 38) return "high fever";
        return "not in range";
      }
    }

    if (currentPhase === 3) {
      if (
        /lightnasalbreathing|light nasal breathing|light nasal|light/.test(
          normalizedInput
        )
      ) {
        return "lightNasalBreathing";
      }
      if (
        /heavynasalbreathing|heavy nasal breathing|heavy nasal|heavy/.test(
          normalizedInput
        )
      ) {
        return "heavyNasalBreathing";
      }
    }

    return normalizedInput;
  };

  const setConclusion = async (interpreted: string) => {
    let conclusion: string = "";

    // Phase 1: Handle individual conclusions based on the latest interpreted value
    if (interpreted === "low fever") {
      conclusion = "low fever";
    } else if (interpreted === "high fever") {
      conclusion = "high fever";
    } else if (interpreted === "no fever") {
      conclusion = "no fever";
    } else if (interpreted === "lightNasalBreathing") {
      conclusion = "nasal discharge";
    } else if (interpreted === "heavyNasalBreathing") {
      conclusion = "sinus membranes swelling";
    } else if (interpreted === "headache") {
      conclusion = "headache";
    } else if (interpreted === "cough") {
      conclusion = "cough";
    } else if (interpreted === "not cough") {
      conclusion = "not cough";
    } else if (interpreted === "soreThroat") {
      conclusion = "soreThroat";
    } else if (interpreted === "not soreThroat") {
      conclusion = "not soreThroat";
    } else if (interpreted === "antibiotics allergy") {
      conclusion = "antibiotics allergy";
    } else if (interpreted === "not antibiotics allergy") {
      conclusion = "not antibiotics allergy";
    }

    // Store the conclusion in the JSON file
    try {
      await $fetch("/api/consequences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { conclusion },
      });
    } catch (error) {
      console.error("Error sending conclusion to server:", error);
    }
  };

  const checkConclusions = async (): Promise<void> => {
    try {
      // Fetch existing facts
      const response = await $fetch("/api/consequences");
      const facts = response || [];

      if (!Array.isArray(facts)) {
        throw new Error("Invalid facts data");
      }

      // Only proceed if there is more than one fact
      if (facts.length === 0) {
        console.log("Not enough facts to proceed");
        console.log("Current conclusions:", Array.from(new Set(facts)));
        return;
      }

      const conclusionSet = new Set(facts);

      // Phase 2: Check combined conditions and add new conclusions if conditions are met
      const conditions = [
        {
          condition: () =>
            conclusionSet.has("low fever") &&
            conclusionSet.has("nasal discharge") &&
            conclusionSet.has("cough") &&
            conclusionSet.has("headache") &&
            !conclusionSet.has("cold"),
          conclusion: "cold",
        },
        {
          condition: () =>
            conclusionSet.has("soreThroat") &&
            conclusionSet.has("cold") &&
            !conclusionSet.has("treat"),
          conclusion: "treat",
        },
        {
          condition: () =>
            conclusionSet.has("not soreThroat") &&
            conclusionSet.has("cold") &&
            !conclusionSet.has("don't treat"),
          conclusion: "don't treat",
        },
        {
          condition: () =>
            conclusionSet.has("treat") && !conclusionSet.has("give medication"),
          conclusion: "give medication",
        },
        {
          condition: () =>
            conclusionSet.has("don't treat") &&
            !conclusionSet.has("don't give medication"),
          conclusion: "don't give medication",
        },
        {
          condition: () =>
            conclusionSet.has("give medication") &&
            conclusionSet.has("antibiotics allergy") &&
            !conclusionSet.has("give Tylenol"),
          conclusion: "give Tylenol",
        },
        {
          condition: () =>
            conclusionSet.has("give medication") &&
            conclusionSet.has("not antibiotics allergy") &&
            !conclusionSet.has("give antibiotics"),
          conclusion: "give antibiotics",
        },
      ];

      for (const { condition, conclusion } of conditions) {
        if (condition()) {
          await $fetch("/api/consequences", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              conclusion,
            },
          });
          // Update the conclusionSet with the new conclusion
          conclusionSet.add(conclusion);
        }
      }
    } catch (error) {
      console.error("Error fetching or processing facts:", error);
    }
  };

  return { facts, error, addFact, refresh };
}
