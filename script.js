const editor = document.getElementById("editor");
const highlightedCode = document.getElementById("highlightedCode");
const output = document.getElementById("output");
const consoleOutput = document.querySelector("#consoleOutput code");
const languageSelect = document.getElementById("language");
let logs = [];
function updateHighlight() {
    const lang = languageSelect.value;
    highlightedCode.className = `language-${lang}`;
    highlightedCode.textContent = editor.value;
    Prism.highlightElement(highlightedCode);
}
function updatePreview() {
    var _a;
    const lang = languageSelect.value;
    const code = editor.value;
    if (lang === "html" || lang === "css") {
        const iframeDoc = output.contentDocument || ((_a = output.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
        if (!iframeDoc)
            return;
        let html = code;
        if (lang === "css")
            html = `<style>${code}</style>`;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    }
    else if (lang === "js") {
        logs = [];
        consoleOutput.textContent = "";
        const iframeWindow = output.contentWindow; // cast to any
        if (!iframeWindow)
            return;
        try {
            iframeWindow.console.log = (...args) => {
                logs.push(args.join(" "));
                consoleOutput.textContent = logs.join("\n");
            };
            iframeWindow.eval(code); // run JS
        }
        catch (err) {
            consoleOutput.textContent = `Error: ${err.message}`;
        }
    }
}
function updateAll() {
    updateHighlight();
    updatePreview();
}
editor.addEventListener("input", updateAll);
languageSelect.addEventListener("change", updateAll);
updateAll();
