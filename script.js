// Store code for each tab
const codeData = { html:"", css:"", js:"", python:"" };
let currentLang = "html";

const editor = document.getElementById("editor");
const output = document.getElementById("output");
const tabHeaders = document.querySelectorAll(".tab-header");

// Switch tabs
tabHeaders.forEach(tab => {
    tab.addEventListener("click", () => {
        codeData[currentLang] = editor.value;
        tabHeaders.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentLang = tab.dataset.lang;
        editor.value = codeData[currentLang];
        if(currentLang === "python") output.innerText = "";
        else updateLivePreview();
    });
});

// Capture console.log for JS
(function(){
    const oldLog = console.log;
    console.log = function(...args){
        oldLog.apply(console, args);
        if(currentLang === "js") {
            output.innerText += args.join(" ") + "\n";
        }
    }
})();

// Update Live Preview for HTML/CSS/JS
function updateLivePreview(){
    if(currentLang === "python") return;
    const iframeCode = `
        <!DOCTYPE html>
        <html>
        <head>
        <style>${codeData.css}</style>
        </head>
        <body>
        ${codeData.html}
        <script>
        try{${codeData.js}}catch(e){document.body.innerText=e;}
        <\/script>
        </body>
        </html>
    `;
    output.innerHTML = "<iframe id='live-frame'></iframe>";
    const iframe = document.getElementById("live-frame");
    iframe.contentDocument.open();
    iframe.contentDocument.write(iframeCode);
    iframe.contentDocument.close();
}

// Auto-update HTML/CSS/JS
editor.addEventListener("input", () => {
    codeData[currentLang] = editor.value;
    if(currentLang !== "python") updateLivePreview();
});

// Run Python Code
function runCode(){
    codeData[currentLang] = editor.value;
    if(currentLang !== "python") return;

    output.innerText = "";
    Sk.configure({ output:text => output.innerText+=text+"\n", read:builtinRead });
    Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody("<stdin>", false, codeData.python,true))
    .catch(err => { output.innerText="Error: "+err.toString(); });
}

// Skulpt helper
function builtinRead(x){
    if(Sk.builtinFiles===undefined || Sk.builtinFiles["files"][x]===undefined)
        throw "File not found: '"+x+"'";
    return Sk.builtinFiles["files"][x];
}

// Download current tab
function downloadCode(){
    const blob = new Blob([editor.value], { type:"text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const ext = currentLang==="js"?"js":currentLang==="python"?"py":currentLang==="css"?"css":"html";
    link.download = "code."+ext;
    link.click();
}

// Toggle theme
function toggleTheme(){
    document.body.classList.toggle("light");
}

// Keyboard shortcuts
document.addEventListener("keydown", e => {
    if(e.ctrlKey && e.key === "Enter") runCode();
    if(e.ctrlKey && e.key === "s") { e.preventDefault(); downloadCode(); }
    if(e.ctrlKey && e.key === "1") switchTab("html");
    if(e.ctrlKey && e.key === "2") switchTab("css");
    if(e.ctrlKey && e.key === "3") switchTab("js");
    if(e.ctrlKey && e.key === "4") switchTab("python");
});

function switchTab(lang){
    tabHeaders.forEach(tab => {
        if(tab.dataset.lang === lang) tab.click();
    });
}
 