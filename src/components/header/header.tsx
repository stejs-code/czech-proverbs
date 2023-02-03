import { component$ } from '@builder.io/qwik';

export default component$(() => {

  return (
    <header id={"tm-nav"} class={"py-4 flex border-b-2 border-sky-500 text-slate-800 px-6 items-center"}>
      <div class={"flex items-center mx-auto max-w-3xl w-full"}>
        <h1 className={"text-5xl font-bold"}>Přísloví</h1>
        <div className={"ml-auto text-lg"}>streak: <span className={"font-bold"} id={"tm-proverb-streak"}>0</span></div>
      </div>
    </header>
  );
});
