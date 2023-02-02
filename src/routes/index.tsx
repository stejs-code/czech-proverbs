import type { QwikKeyboardEvent } from "@builder.io/qwik";
import { $, component$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import * as fs from "fs";

export const surrender = (spanElement: HTMLSpanElement, button: HTMLButtonElement, blankWord: string, next: () => void) => {


  if (spanElement.dataset.correct === "false") {
    next();
    spanElement.dataset.correct = "";
    spanElement.innerText = "";
    button.innerText = "nevím";
    return;
  }
  spanElement.dataset.correct = "false";
  spanElement.innerText = blankWord;
  button.innerText = "další";
};

export default component$(() => {

  const store = useStore({
    active: {
      "text": "Když dub padne, kdekdo třísky sbírá.",
      "lastLetter": "",
      "renderText": ["Když dub padne, kdekdo", "sbírá."],
      "blank": 5,
      "blankWord": "trisky"
    },
    data: []
  });

  useTask$(() => {
    store.data = JSON.parse(fs.readFileSync("./bin/data.json").toString());
    store.active = getRandomItem(store.data);
  });


  const handleAnswerChange = $((event: QwikKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Escape") {
      // @ts-ignore
      surrender(event.target, document.getElementById("tm-surrender"), store.active.blankWord, () => {
        store.active = getRandomItem(store.data);
      });

      return;
    }

    // @ts-ignore
    if (event.target.dataset.correct === "false") {
      return;
    }
    // @ts-ignore
    if (slugify(event.target.innerText.toLowerCase()) === slugify(store.active.blankWord.toLowerCase())) {
      const startConfetti = new Event("confetti-start");
      const stopConfetti = new Event("confetti-stop");
      document.dispatchEvent(startConfetti);
      // @ts-ignore
      event.target.innerText = store.active.blankWord;
      // @ts-ignore
      event.target.dataset.correct = "true";
      setTimeout(function() {
        document.dispatchEvent(stopConfetti);
        store.active = getRandomItem(store.data);
        // @ts-ignore
        event.target.dataset.correct = "";
        // @ts-ignore
        event.target.innerText = "";
      }, 2000);
    }
  });
  // @ts-ignore
  return (
    <div class={"mx-auto mt-10 mb-20 "}>
      <div>
        <p class={"text-4xl text-center max-w-4xl leading-relaxed"}>{store.active.renderText[0]} <span
          id={"tm-magic-input"}
          onKeyUp$={handleAnswerChange}
          autofocus
          contentEditable={"true"}
          class={"relative magic-input outline-none w-auto"}
          autocorrect="off"
          autocapitalize="off"
        ></span> &nbsp;{store.active.renderText[1]} <br />
          <button id={"tm-surrender"}
                  class={"py-2 text-lg px-10 border-2 border-sky-600 rounded-2xl mt-8 mx-auto"}
                  onClick$={() => {
                    // @ts-ignore
                    surrender(document.getElementById("tm-magic-input"), document.getElementById("tm-surrender"), store.active.blankWord, () => {
                      store.active = getRandomItem(store.data);
                    });
                  }}
          >nevím
          </button>
        </p>

      </div>
      <div class={"max-w-lg m-auto px-4"}>
        <h2 class={"text-center mt-48 text-2xl font-bold mb-4"}>Ovládání</h2>
        <p class={""}>Správná odpověď se sama ukáže. Na diakritice a velikosti písmen nezáleží.</p>
        <ul class={"list-disc"}>
          <li>
            [esc] – ukáže správnou odpověď – nahrazuje tlačítko „nevím“
          </li>
          <li>
            [esc] * 2 – ukáže správnou odpověď a pokračuje na další příklad – nahrazuje tlačítko „další“
          </li>
        </ul>
      </div>
    </div>
  );
});

export function getRandomItem(data: any[]) {
  // const data = getData();
  let item: any = data[Math.floor(Math.random() * data.length)];

  const randomItem = () => {
    item = data[Math.floor(Math.random() * data.length)];
    if (item.blank <= 0 || item.blank === null) {
      randomItem();
    }
  };
  randomItem();


  const textArray = item.text.split(" ");


  let lastLetter = "";
  let word: string = textArray[item.blank - 1];
  // textArray = textArray.splice(item.blank - 1)
  try {
    if ([".", "!", ","].includes(word.substring(word.length - 1))) {
      lastLetter = word.substring(word.length - 1);
      word = word.substring(0, word.length - 1);
    }
  } catch (e) {
    console.log(e);
    console.log("WORD: ", word);
  }

  const renderText = ["", ""];

  textArray.map((currentWord: string, index: number) => {
    if (index === item.blank - 1) {

      renderText[1] = renderText[1] + lastLetter;
      if (lastLetter === ",") {
        renderText[1] = renderText[1] + " ";
      }
      return;
    }

    if (index < item.blank - 1) {
      renderText[0] = renderText[0] + currentWord + " ";
      return;
    }

    if (index > item.blank - 1) {
      renderText[1] = renderText[1] + currentWord + " ";
      return;
    }

  });

  return {
    text: item.text,
    renderText: renderText,
    blank: item.blank,
    lastLetter: lastLetter,
    blankWord: word
  };

}

export function slugify(text: string) {
  const from = "úůěščřžýíéãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  const to = "uuescrzyieaaaaaeeeeeiiiiooooouuuunc------";

  const newText = Array.from(text)
    .map((c) => {
      const index = [...from].indexOf(c);
      if (index > -1) {
        return c.replace(
          new RegExp(from.charAt(index), "g"),
          to.charAt(index)
        );
      }
      return c;
    })
    .join("");


  return newText
    .toString()                     // Cast to string
    .toLowerCase()                  // Convert the string to lowercase letters
    .trim();                         // Remove whitespace from both sides of a string
}

export const head: DocumentHead = {
  title: "Česká přísloví",
  meta: [
    {
      name: "description",
      content: "Rychlé procvičovní na česká přísloví. Ideální pro přijimací zkoušky."
    },
    {
      name: "keywords",
      content: "přijimací zkoušky, přísloví, čeština, procvičování"
    },
    {
      name: "author",
      content: "Tom Stejskal"
    }
  ]
};
