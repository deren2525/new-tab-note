const initText =
  "# Welcome to NewTabNote!!\n\nThank you for downloading NewTabNote! 🎉\nNewTabNote a new tab extension for notes 📖\nLet's edit by pressing the pencil mark in the upper left!\n\n## Example\n\n### ■ Emphasis\n*This text will be italic.*\n**This text will be bold.**\n*You **can** combine them.*\n\n### ■ Lists\n\n####  Unordered\n* Item 1\n* Item 2\n  * Item 2a\n  * Item 2b\n\n#### Ordered\n1. Item 1\n2. Item 2\n3. Item 3\n\n### ■ Link\n[Chrome Web Store](https://chrome.google.com/webstore/category/extensions?hl=en&)\n\n### ■ Task Lists\n- [ ] Task 1\n- [X] Task 2\n\n### ■ Blockquote\n> **note**\n> element is used to indicate the quotation of a large section of text from another source.\n\n### ■ Code\n```\nif (isAwesome) {\n  return true\n}\n```\n";

// Input
const editInput = document.getElementById("edit-input");
const editInputLineHeight = parseInt(editInput.style.lineHeight);
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
  editInput.style.height = height + "px";
  previewWindow.style.height = height + 35 + "px";

  if (localStorage.hasOwnProperty("new_tab_note")) {
    editInput.value = localStorage.getItem("new_tab_note").replace(/\s+$/, "");
    previewWindow.innerHTML = marked(localStorage.getItem("new_tab_note"));
  } else {
    localStorage.setItem("new_tab_note_init", initText);
    editInput.value = localStorage.getItem("new_tab_note_init");
    previewWindow.innerHTML = marked(localStorage.getItem("new_tab_note_init"));
  }
};

editInput.addEventListener("input", () => {
  if (!localStorage.hasOwnProperty("new_tab_note")) {
    localStorage.setItem("new_tab_note", "");
  }
  saveToLocalStorage(editInput.value);

  // 改行でテキストエリア の高さ自動調整
  const lines = (editInput.value + "\n").match(/\n/g).length;
  editInput.style.height = lines * editInputLineHeight;
});

editInput.addEventListener("keydown", (e) => {
  if (!e) return;

  // Tab
  if (e.keyCode === 9) {
    e.preventDefault();
    // 現在のカーソルの位置
    const cursorPosition = editInput.selectionStart;
    // カーソルの左右の文字列を取得
    const cursorLeft = editInput.value.substr(0, cursorPosition);
    const cursorRight = editInput.value.substr(cursorPosition, editInput.value.length);
    editInput.value = cursorLeft + "  " + cursorRight;
    // カーソルの位置を入力したタブの後ろにする
    editInput.selectionEnd = cursorPosition + 2;
    saveToLocalStorage(editInput.value);
  }

  // Enter
  if (e.keyCode === 13) {
    // 現在のカーソルの位置
    const cursorPosition = editInput.selectionStart;
    // カーソル位置までの文字を取得
    const text = editInput.value.substr(0, cursorPosition);
    const targetSentence = text.split("\n").pop();

    // list
    const regexList = /^[*-]\s+/;
    // listの小要素
    const regexListChild = /^\s+[*-]\s+/;
    // 数字のlist
    const regexNumberList = /^[0-9]+.\s+/;
    if (regexList.test(targetSentence)) {
      e.preventDefault();
      setListPoint(regexList, targetSentence, cursorPosition);
    } else if (regexListChild.test(targetSentence)) {
      e.preventDefault();
      setListPoint(regexListChild, targetSentence, cursorPosition);
    }
  }
})

function setListPoint(regex, targetSentence, cursorPosition) {
  const listPoint = targetSentence.match(regex)[0];
  editInput.value = editInput.value.substr(0, cursorPosition) + "\n" + listPoint + editInput.value.substr(cursorPosition, editInput.value.length);
  editInput.focus();
  var newCaret = cursorPosition + "\n".length + listPoint.length;
  editInput.setSelectionRange(newCaret, newCaret);
}

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

function saveToLocalStorage(value) {
  // Save to local storage
  localStorage.setItem("new_tab_note", value);
  // Convert to markdown
  convertedText = marked(value);
  // Convert [] [x] to checkbox
  previewWindow.innerHTML = convertedText.replace(
    /\[x\]/g,
    '<input type="checkbox" checked="checked">'
  );
  previewWindow.innerHTML = convertedText.replace(
    /\[ \]/g,
    '<input type="checkbox">'
  );
}

// Window risize
window.addEventListener(
  "resize",
  function () {
    const height = window.innerHeight - 35;
    editInput.style.height = height + "px";
    previewWindow.style.height = height + 35 + "px";
  },
  false
);

marked.setOptions({
  breaks: true,
  langPrefix: "",
});