const prompt = require("prompt-sync")({sigint: true});
const fs = require("fs");

// const all = fs.readFileSync("bin/input.txt").toString().replace(/[[(0-9)]+]/g, "")
const all = JSON.parse(fs.readFileSync("bin/data.json").toString())
// all.split("\n").map((item, index) => {
all.map((item, index) => {
    //console.log(item.text, "–", item.blank)
    let finalText = "";
    item.text.split(" ").map((item, index) => {
        finalText = finalText + item + (index+1) + " ";
    })
    console.log(finalText, "——— ", item.blank)

    const blank = prompt("new blank space: ");

    if (blank === "") {
        return;
    }

    all[index] = {
        text: item.text,
        blank: Number(blank)
    }

    fs.writeFileSync("bin/data.json", JSON.stringify(all))
})

