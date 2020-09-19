const initText =
  "## Welcome to NewTabNote!!\n\nThank you for downloading NewTabNote! 🎉\nNewTabNote a new tab extension for notes 📖\nLet's edit by pressing the pencil mark in the upper left!\n\n## Example\n\n### Emphasis\n*This text will be italic.*\n**This text will be bold.**\n*You **can** combine them.*\n\n### Lists\n\n####  Unordered\n* Item 1\n* Item 2\n  * Item 2a\n  * Item 2b\n\n#### Ordered\n1. Item 1\n2. Item 2\n3. Item 3\n\n### Link\n[Chrome Web Store](https://chrome.google.com/webstore/category/extensions?hl=en&)\n\n### Task Lists\n- [ ] Task 1\n- [X] Task 2\n\n### Blockquote\n> **note**\n> element is used to indicate the quotation of a large section of text from another source.\n\n### Code\n```\nif (isAwesome) {\n  return true\n}\n```\n";

// Input
const editInput = document.getElementById("edit-input");
// Window
const editWindow = document.getElementById("edit-window");
const previewWindow = document.getElementById("preview-window");
// Mode Buttons
const modeButtons = Array.from(document.getElementsByClassName("mode-button"));
const modeEditButton = document.getElementById("mode-edit");
const modeSplitButton = document.getElementById("mode-split");
const modePreviewButton = document.getElementById("mode-preview");

window.onload = () => {
  const height = window.innerHeight - 35;
  editWindow.style.height = height + "px";
  previewWindow.style.height = height + "px";

  if (localStorage.getItem("new_tab_note")) {
    editInput.innerText = localStorage.getItem("new_tab_note");
    previewWindow.innerHTML = marked(localStorage.getItem("new_tab_note"));
  } else {
    localStorage.setItem("new_tab_note_init", initText);
    editInput.innerText = localStorage.getItem("new_tab_note_init");
    previewWindow.innerHTML = marked(localStorage.getItem("new_tab_note_init"));
  }
};

editInput.addEventListener("input", () => {
  // Save to local storage
  localStorage.setItem("new_tab_note", editInput.innerText);

  // Convert to markdown
  convertedText = marked(editInput.innerText);

  // Convert [] [x] to checkbox
  previewWindow.innerHTML = convertedText.replace(
    /\[x\]/g,
    '<input type="checkbox" checked="checked">'
  );
  previewWindow.innerHTML = convertedText.replace(
    /\[ \]/g,
    '<input type="checkbox">'
  );
});

// Mode button click
modeEditButton.addEventListener("click", (e) => {
  editWindow.classList.remove("none");
  previewWindow.classList.add("none");
  modeButtonStatus(e);
});
modeSplitButton.addEventListener("click", (e) => {
  editWindow.classList.remove("none");
  previewWindow.classList.remove("none");
  modeButtonStatus(e);
});
modePreviewButton.addEventListener("click", (e) => {
  editWindow.classList.add("none");
  previewWindow.classList.remove("none");
  modeButtonStatus(e);
});

function modeButtonStatus(e) {
  modeButtons.forEach((buttonLabel) => {
    if (buttonLabel.htmlFor === e.target.id) {
      buttonLabel.classList.add("active");
    } else {
      buttonLabel.classList.remove("active");
    }
  });
}

// Window risize
window.addEventListener(
  "resize",
  function () {
    const height = window.innerHeight - 35;
    editWindow.style.height = height + "px";
    previewWindow.style.height = height + "px";
  },
  false
);

marked.setOptions({
  breaks: true,
  langPrefix: "",
});
