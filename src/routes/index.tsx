import { component$, useClientEffect$, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Config } from "~/config";

type Store = {
  enteredText: string,
  status: "guessing" | "correct" | "incorrect",
  element: {
    opacity: number
  },
  streak: number,
  activeProverb: {
    text: string,
    lastLetter: string,
    renderText: string[],
    blank: number,
    blankWord: string
  }
}
export const changeProverb = (store: Store) => {
  (async () => {
    return await (await fetch(Config.apiUrl + "/proverb/_random")).json();
  })();

  /**
   * IF correct
   * 0 start loading SAME
   * 0 start confetti
   * 2500 animate out
   * 3000 stop confetti
   * 3000 animate in
   *
   * ELSE
   * 0 start loading SAME
   * 0 animate out
   * 500 animate in
   */

  const newProverb = (async () => {
    return await (await fetch(Config.apiUrl + "/proverb/_random")).json();
  })();


  const animateOut = () => {
    store.element.opacity = 0;
    setTimeout(() => {
      // while invisible
      store.status = "guessing";
      store.enteredText = "";

      if (typeof document !== "undefined") {
        (document.getElementById("tm-proverb-input") as HTMLSpanElement).innerText = store.enteredText;
      }
    }, 300);
  };
  const animateIn = async () => {
    if (typeof document !== "undefined") {
      (document.getElementById("tm-proverb-input") as HTMLSpanElement).focus();
      (document.getElementById("tm-nav") as HTMLSpanElement).scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
    store.activeProverb = await newProverb;
    store.element.opacity = 1;
  };

  if (store.status === "correct") {
    const startConfetti = new Event("confetti-start");
    const stopConfetti = new Event("confetti-stop");
    document.dispatchEvent(startConfetti);
    setTimeout(animateOut, 2500);
    setTimeout(() => document.dispatchEvent(stopConfetti), 3000);
    setTimeout(animateIn, 3000);

  } else if (store.status === "incorrect") {
    animateOut();
    setTimeout(animateIn, 500);
  } else if (store.status === "guessing") {
    animateIn().then(() => null);
  }

};

export default component$(() => {


  const store = useStore<Store>({
    enteredText: "",
    status: "guessing",
    streak: 0,
    activeProverb: {
      text: "Když dub padne, kdekdo třísky sbírá.",
      lastLetter: "",
      renderText: ["Když dub padne, kdekdo", "sbírá."],
      blank: 5,
      blankWord: "třísky"
    },
    element: {
      opacity: 0
    }
  }, { recursive: true });


  /**
   * Check for correct answer
   */
  useTask$(({ track }) => {
    track(() => store.enteredText);
    if (simplifyLatin(store.enteredText) === simplifyLatin(store.activeProverb.blankWord) && store.status !== "incorrect") {
      store.status = "correct";
      store.streak = store.streak + 1;
      if (typeof document !== "undefined") {
        (document.getElementById("tm-proverb-input") as HTMLSpanElement).innerText = store.activeProverb.blankWord;
      }
      changeProverb(store);
    }
  });

  useTask$(({ track }) => {
    track(() => store.streak);

    if (typeof document !== "undefined") {
      (document.getElementById("tm-proverb-streak") as HTMLSpanElement).innerText = String(store.streak);
    }
  });

  useClientEffect$(() => {
    changeProverb(store);
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (document.getElementById("tm-proverb-button") as HTMLButtonElement).click();
      }
    });
  });


  return (
    <div class={"mx-auto mt-4 mb-20 "}>
      <div class={"flex flex-col"}>
        <button id={"tm-proverb-button"}
                class={"py-2 text-lg px-10 text-white bg-slate-800 mt-2 mb-2 rounded-2xl mx-auto"}
                onClick$={() => {
                  if (store.status === "guessing") {
                    store.status = "incorrect";
                    store.enteredText = store.activeProverb.blankWord;
                    store.streak = 0;
                    if (typeof document !== "undefined") {
                      (document.getElementById("tm-proverb-input") as HTMLSpanElement).innerText = store.enteredText;
                    }
                  } else {
                    changeProverb(store);
                  }
                }}
        >
          {(store.status === "guessing") ? "nevím" : "další"}
        </button>
        <p id={"tm-proverb-area"}
           class={"text-4xl text-center max-w-4xl leading-relaxed proverb-wrapper"}
           style={"opacity: " + store.element.opacity + ";"}>
          {store.activeProverb.renderText[0]}
          {/*@ts-ignore */}
          <span autofocus autocorrect="off" autocapitalize="off" contentEditable={store.status === "guessing"}
                id={"tm-proverb-input"}
                preventdefault:keyup
                onKeyUp$={(ev) => (store.enteredText = (ev.target as HTMLSpanElement).innerText)}
                value={store.enteredText}
                data-correct={(() => {
                  switch (store.status) {
                    case "correct":
                      return "true";
                    case "incorrect":
                      return "false";
                    case "guessing":
                      return "";
                  }
                })()}
                class={"relative magic-input outline-none w-auto"}
          ></span>
          &nbsp;{store.activeProverb.renderText[1]}
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


export function simplifyLatin(text: string) {
  const from = "úůěščřžýíéãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  const to = "uuescrzyieaaaaaeeeeeiiiiooooouuuunc------";
  text = text.toLowerCase();

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
