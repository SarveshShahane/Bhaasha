const fromText = document.querySelector(".from-text"),
  toText = document.querySelector(".to-text"),
  exchangeIcon = document.querySelector(".exchange"),
  selectTag = document.querySelectorAll("select"),
  icons = document.querySelectorAll(".row i"),
  translateBtn = document.querySelector("button");

selectTag.forEach((tag, id) => {
  for (let country_code in countries) {
    let selected =
      id == 0
        ? country_code == "en"
          ? "selected"
          : ""
        : country_code == "bn"
        ? "selected"
        : "";
    let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

selectTag.forEach((tag) => {
  tag.addEventListener("change", () => {
    if (fromText.value.trim()) {
      translateText(); 
    }
  });
});

exchangeIcon.addEventListener("click", () => {
  let tempText = fromText.value,
    tempLang = selectTag[0].value;
  fromText.value = toText.value;
  toText.value = tempText;
  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;

  translateText(); 
});

fromText.addEventListener("keyup", () => {
  if (!fromText.value) {
    toText.value = "";
  } else {
    translateText(); 
  }
});

function detectLanguage(text) {
  let detectUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=auto|en`;
  return fetch(detectUrl)
    .then((res) => res.json())
    .then((data) => data.responseData.detectedSourceLanguage);
}

function translateText() {
  let text = fromText.value.trim(),
    translateFrom = selectTag[0].value, // Get selected source language
    translateTo = selectTag[1].value; // Get target language

  if (!text) return;
  toText.setAttribute("placeholder", "Translating...");

  // If user selects "Auto-Detect", detect language first
  if (translateFrom === "auto") {
    detectLanguage(text).then((detectedLang) => {
      selectTag[0].value = detectedLang; // Update dropdown with detected language
      fetchTranslation(text, detectedLang, translateTo);
    });
  } else {
    fetchTranslation(text, translateFrom, translateTo);
  }
}

function fetchTranslation(text, translateFrom, translateTo) {
  let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      toText.value = data.responseData.translatedText;
    })
    .catch(() => {
      toText.value = "Translation Error!";
    });
}

icons.forEach((icon) => {
  icon.addEventListener("click", ({ target }) => {
    if (!fromText.value && !toText.value) return;

    if (target.classList.contains("fa-copy")) {
      let textToCopy = target.id == "from" ? fromText.value : toText.value;
      navigator.clipboard.writeText(textToCopy);
    } else if (target.classList.contains("fa-volume-up")) {
      let textToSpeak = target.id == "from" ? fromText.value : toText.value;
      let language =
        target.id == "from" ? selectTag[0].value : selectTag[1].value;

      if (!textToSpeak) return;

      let utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    }
  });
});

const micIcon = document.querySelector("#mic");
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  micIcon.addEventListener("click", () => {
    recognition.lang = selectTag[0].value;
    recognition.start();
    micIcon.style.color = "red";
  });

  recognition.onresult = (event) => {
    fromText.value = event.results[0][0].transcript;
    micIcon.style.color = "";
    translateText(); 
  };

  recognition.onerror = () => {
    micIcon.style.color = "";
  };
} else {
  micIcon.style.display = "none";
}
