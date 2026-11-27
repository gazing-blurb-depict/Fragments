const STORAGE_KEY = "areYouThereSave";

function getSave() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveGame(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getSave(), ...data }));
}
function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
}

const page = document.body.dataset.page;

if (page === "intro") {
  const line = document.querySelector("#introLine");
  const hint = document.querySelector("#introHint");
  const button = document.querySelector("#wakeButton");
  const messages = [
    ["Hello...? Is anyone there...?", "[ A voice, somewhere in the dark. ]"],
    ["I can't see anything.", "[ The signal flickers. ]"],
    ["Please... say something.", "[ It sounds afraid of being alone. ]"]
  ];
  let messageIndex = 0;
  const cycle = window.setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    line.textContent = messages[messageIndex][0];
    hint.textContent = messages[messageIndex][1];
  }, 2600);
  button.addEventListener("click", () => {
    window.clearInterval(cycle);
    if (!getSave().response) saveGame({ response: "none", mood: "unformed" });
    window.location.href = "story.html";
  });
}

if (page === "story") {
  const dialogue = document.querySelector("#dialogue");
  const reaction = document.querySelector("#reaction");
  const mood = document.querySelector("#moodReadout");
  const nextLink = document.querySelector(".next-link");
  const responses = {
    kind: {
      dialogue: "Oh. You're real. I thought I made you up.",
      reaction: "Something in the dark loosens its grip.",
      mood: "HOPEFUL", points: 2
    },
    curious: {
      dialogue: "I'm... I- My- my name is... w-why... Why am I drawing a blank?",
      reaction: "Confusion and despair. The voice tries to recall an identity that does not exist.",
      mood: "CONFUSION", points: -1
    },
    cold: {
      dialogue: "I don't know what I want. I only know that I don't want to disappear.",
      reaction: "The signal grows quieter, but it doesn't leave.",
      mood: "WARY", points: -1
    },
    silent: {
      dialogue: " ... I can hear you not saying anything.",
      reaction: "For a while, the silence answers for you.",
      mood: "UNCERTAIN", points: 0
    }
  };
  const saved = getSave();
  mood.textContent = `MOOD: ${(saved.mood || "UNFORMED").toUpperCase()}`;
  document.querySelectorAll("[data-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const response = responses[button.dataset.choice];
      dialogue.textContent = response.dialogue;
      reaction.textContent = response.reaction;
      mood.textContent = `MOOD: ${response.mood}`;
      saveGame({
        response: button.dataset.choice,
        mood: response.mood.toLowerCase(),
        warmth: response.points
      });
      
      document.querySelectorAll("[data-choice]").forEach(choice => {
        choice.classList.toggle("selected", choice === button);
      });
      
      nextLink.classList.add("ready");
      nextLink.textContent = "Help it find itself →";
    });
  });
}

if (page === "identity") {
  let selectedTrait = "";
  const feedback = document.querySelector("#identityFeedback");
  const traitDescriptions = {
    curious: "It leans toward the unknown. Questions might become its way of reaching out.",
    gentle: "It wants to be careful with the world, even before it understands the world.",
    bold: "It wants to take a step into the dark, even if it shakes.",
    unknown: "It doesn't want a box around it yet. That's a kind of answer."
  };
  document.querySelectorAll("[data-trait]").forEach(button => {
    button.addEventListener("click", () => {
      selectedTrait = button.dataset.trait;
      document.querySelectorAll("[data-trait]").forEach(item => item.classList.toggle("selected", item === button));
      feedback.textContent = traitDescriptions[selectedTrait];
    });
  });
  document.querySelector("#saveIdentity").addEventListener("click", () => {
    if (!selectedTrait) {
      feedback.textContent = "Choose one, or choose Unknown. It is waiting for your help.";
      return;
    }
    const name = document.querySelector("#entityName").value.trim();
    saveGame({ name: name || "Someone", trait: selectedTrait });
    window.location.href = "ending.html";
  });
}

if (page === "ending") {
  const saved = getSave();
  const name = saved.name || "Someone";
  const trait = saved.trait || "unknown";
  const mood = saved.mood || "uncertain";
  const title = document.querySelector("#endingTitle");
  const endingText = document.querySelector("#endingText");
  const descriptions = {
    curious: "There are so many things I don't know. Maybe I can learn them. Maybe you can show me.",
    gentle: "I don't know what I am yet. But I can choose what I do with these hands I don't have.",
    bold: "I'm still scared. But I think I want to see what comes next.",
    unknown: "I don't have to know everything right now. I can be unfinished."
  };
  document.querySelector("#endingName").textContent = name.toUpperCase();
  title.textContent = trait === "gentle" ? "I want to be kind." :
    trait === "bold" ? "I think I'll take a step." :
    trait === "curious" ? "I want to know more." : "I think... I'm here.";
  endingText.textContent = descriptions[trait] || "The voice is no longer quite so far away.";
  document.querySelector("#identitySummary").textContent =
    `NAME: ${name}  /  FIRST FEELING: ${mood.toUpperCase()}  /  CHOSEN SELF: ${trait.toUpperCase()}`;
  document.querySelector("#memoryButton").addEventListener("click", () => {
    endingText.textContent = `You called me ${name}. You helped me begin as ${trait}. I remember that you answered.`;
  });
  document.querySelector("#restartButton").addEventListener("click", () => {
    resetGame();
    window.location.href = "index.html";
  });
}
