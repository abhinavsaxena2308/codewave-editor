declare const Prism: any;

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const highlightedCode = document.getElementById("highlightedCode") as HTMLElement;
const output = document.getElementById("output") as HTMLIFrameElement;
const consoleOutput = document.querySelector("#consoleOutput code") as HTMLElement;
const languageSelect = document.getElementById("language") as HTMLSelectElement;
const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
const tabsDiv = document.getElementById("tabs") as HTMLElement;
const addTabBtn = document.getElementById("addTab") as HTMLButtonElement;

// Tab management
interface Tab { id: number; name: string; code: string; language: string; }
let tabs: Tab[] = [];
let activeTabId = 0;
let tabCounter = 1;

// Create a new tab
function createTab(name = `File${tabCounter}`, language = 'html', code = '') {
    const tab: Tab = { id: tabCounter++, name: `${name} (${language})`, language, code };
    tabs.push(tab);
    renderTabs();
    switchTab(tab.id);
}
const lineNumbers = document.getElementById("lineNumbers") as HTMLElement;

function updateLineNumbers() {
  const lines = editor.value.split("\n").length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
}

// Add to event listeners
editor.addEventListener("input", () => {
  updateLineNumbers();
  updateHighlight();
});

// Initialize line numbers
updateLineNumbers();


// Render tab buttons
function renderTabs() {
    tabsDiv.innerHTML = '';
    tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.textContent = tab.name;
        tabEl.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
        tabEl.onclick = () => switchTab(tab.id);
        tabsDiv.appendChild(tabEl);
    });
}

// Switch active tab
function switchTab(id: number) {
    saveActiveTab();
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;
    editor.value = tab.code;
    languageSelect.value = tab.language.split(' ')[0]; // extract language
    updateAll();
}

// Save current tab content
function saveActiveTab() {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    tab.code = editor.value;
    tab.language = languageSelect.value + ` (${tab.language.split('(')[1] || ''}`; // keep role
}

// Syntax highlighting
function updateHighlight() {
    const lang = languageSelect.value;
    highlightedCode.className = `language-${lang}`;
    highlightedCode.textContent = editor.value;
    Prism.highlightElement(highlightedCode);
}

// Run code
function runCode() {
    saveActiveTab();
    const lang = languageSelect.value;
    const code = editor.value;
    consoleOutput.textContent = '';

    if (lang === 'html' || lang === 'css') {
        const iframeDoc = output.contentDocument || output.contentWindow?.document;
        if (!iframeDoc) return;
        let html = code;
        if (lang === 'css') html = `<style>${code}</style>`;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    } else if (lang === 'js') {
        const iframeWindow = output.contentWindow as any;
        if (!iframeWindow) return;
        try {
            iframeWindow.console.log = (...args: any[]) => {
                consoleOutput.textContent += args.join(' ') + '\n';
            };
            iframeWindow.eval(code);
        } catch (err) {
            consoleOutput.textContent = `Error: ${(err as Error).message}`;
        }
    } else if (lang === 'python') {
        try {
            const pyScript = document.createElement("script");
            pyScript.type = "text/python";
            pyScript.textContent = `
import sys
class Console:
    def write(self, msg):
        from browser import document
        document.getElementById("consoleOutput").textContent += str(msg)
sys.stdout = Console()
sys.stderr = Console()
${code}
`;
            document.body.appendChild(pyScript);
            (window as any).__BRYTHON__.run_scripts();
            document.body.removeChild(pyScript);
        } catch (err) {
            consoleOutput.textContent = `Error: ${(err as Error).message}`;
        }
    }
    updateHighlight();
}

// Update all (highlight + live preview)
function updateAll() {
    updateHighlight();
    const lang = languageSelect.value;
    if (lang === 'html' || lang === 'css') runCode(); // live preview
}

// Event listeners
editor.addEventListener('input', updateHighlight);
languageSelect.addEventListener('change', updateAll);
runBtn.addEventListener('click', runCode);
addTabBtn.addEventListener('click', () => createTab());

// Initialize with first tab
createTab();
