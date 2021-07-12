const initText = chrome.i18n.getMessage('InitText');
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
// Filter
const filterDisplay = document.getElementById("filter-display");
const filterButton = document.getElementById("filter-button");
const filterActiveButton = document.getElementById("filter-active");
const filterNoActiveButton = document.getElementById("filter-no-active");

window.onload = () => {
  const height = window.innerHeight - 70;
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

  modeHandler.setModeFromSavedMode();
  filterStatusHandler.setFilterStatus()
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

// 他のタブが更新されたら現在のタブの表示も更新するように
window.addEventListener("storage", (event) => {
  if (event.key === "new_tab_note") {
    const newVal = event.newValue
    editInput.value = newVal.replace(/\s+$/, "");
    previewWindow.innerHTML = marked(newVal);
  }
})

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

// Mode button
modeEditButton.addEventListener("click", (e) => {
  editWindow.classList.remove("none");
  previewWindow.classList.add("none");
  modeHandler.saveMode("mode-edit");
  modeButtonStatus(e);
});
modeSplitButton.addEventListener("click", (e) => {
  editWindow.classList.remove("none");
  previewWindow.classList.remove("none");
  modeHandler.saveMode("mode-split");
  modeButtonStatus(e);
});
modePreviewButton.addEventListener("click", (e) => {
  editWindow.classList.add("none");
  previewWindow.classList.remove("none");
  modeHandler.saveMode("mode-preview");
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
  // ローカルストレージに保存
  localStorage.setItem("new_tab_note", value);
  // マークダウンに変換
  convertedText = marked(value);
  // - [] , - [x] をチェックボックス変換
  previewWindow.innerHTML = convertedText.replace(
    /\[x\]/g,
    '<input type="checkbox" checked="checked">'
  );
  previewWindow.innerHTML = convertedText.replace(
    /\[ \]/g,
    '<input type="checkbox">'
  );
}

// モード状態の保持
const createModeHandler = () => {
  const MODE_KEY = "new_tab_note:mode";

  const getSavedMode = () => {
    if (localStorage.hasOwnProperty(MODE_KEY)) {
      return localStorage.getItem(MODE_KEY)
    }
    return null;
  }

  // modeには"mode-edit", "mode-split", "mode-preview"を使う
  const saveMode = (mode) => {
    localStorage.setItem(MODE_KEY, mode);
  }

  const clickModeElement = (modeElementId) => {
    document.getElementById(modeElementId).click()
  }

  const setModeFromSavedMode = () => {
    const currentMode = getSavedMode()
    if (currentMode === null) return;
    clickModeElement(currentMode);
  }

  return {
    saveMode,
    setModeFromSavedMode
  }
}

const modeHandler = createModeHandler();

// フィルター状態の保持
const createFilterStatusHandler = () => {
  const FILTER_KEY = "new_tab_note:filter";

  const getSavedFilterStatus = () => {
    if (localStorage.hasOwnProperty(FILTER_KEY)) {
      return localStorage.getItem(FILTER_KEY)
    }
    return null;
  }

  const saveFilterStatus = (status) => {
    localStorage.setItem(FILTER_KEY, status);
  }

  const setFilterStatus = () => {
    const status = getSavedFilterStatus();
    if (status === 'true') {
      onFilter();
    } else {
      offFilter();
    }
  }

  return {
    saveFilterStatus,
    setFilterStatus
  }
}

const filterStatusHandler = createFilterStatusHandler();


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

// filter
filterButton.addEventListener('change', (e) => {
  if (e.target.checked) {
    onFilter();
    filterStatusHandler.saveFilterStatus(true);
  } else {
    offFilter();
    filterStatusHandler.saveFilterStatus(false);
  }
});

function onFilter() {
  filterActiveButton.style.display = 'none';
  filterNoActiveButton.style.display = 'block';
  editInput.classList.add('filter');
  editInput.readOnly = true;
  previewWindow.classList.add('filter');
  filterDisplay.style.display = 'block';
  filterButton.checked = true;
}

function offFilter() {
  filterNoActiveButton.style.display = 'none';
  filterActiveButton.style.display = 'block';
  editInput.classList.remove('filter');
  editInput.readOnly = false;
  previewWindow.classList.remove('filter');
  filterDisplay.style.display = 'none';
  filterButton.checked = false;
}