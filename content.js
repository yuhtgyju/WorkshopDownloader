let RealAppID = "";
let alertAllowed = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Picker primed");
    if (msg.action === 'startPicker') {
        console.log("Picker fired");
        alertAllowed = !!msg.alertAllowed;
        startDomPicker();
    }
});

function getAlertAllowness() {
    return alertAllowed;
}

function getCurrentTabUrl() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, (response) => {
            if (response && response.url) {
                resolve(response.url);
            } else {
                console.warn("No URL found!");
                resolve("");
            }
        });
    });
}

function extractAppIDFromUrl(rawUrl) {
    let appID = "";
    try {
        const urlObj = new window.URL(rawUrl); // 🔥 use window.URL explicitly!
        appID = urlObj.searchParams.get("appid");
    } catch (e) {
        console.error("Failed to parse URL:", e);
    }
    return appID || "";
}

async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// This is your MAIN logic
async function doSomething() {
    const URL = await getCurrentTabUrl();
    if (URL === "") {
        console.log("No URL found!");
    } else {
        console.log("Got URL: ", URL);
        const appID = extractAppIDFromUrl(URL);
        if (appID) {
            console.log("Got appID: ", appID);
            RealAppID = appID;
        } else {
            console.warn("appID not found in URL");
        }
    }
}

function startDomPicker() {
    const box = document.createElement('div');
    Object.assign(box.style, {
        position: 'fixed',
        border: '2px dashed magenta',
        zIndex: '9999999',
        pointerEvents: 'none',
        backgroundColor: 'rgba(255,0,255,0.1)'
    });
    document.body.appendChild(box);

    let currentEl = null;

    function onMove(e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);

        if (!el || el.tagName !== 'IMG') {
            box.style.display = 'none';
            currentEl = null;
            return;
        }

        const r = el.getBoundingClientRect();
        Object.assign(box.style, {
            left: `${r.left}px`,
            top: `${r.top}px`,
            width: `${r.width}px`,
            height: `${r.height}px`,
            display: 'block'
        });
        currentEl = el;
    }

    async function onClick(e) {
        if (!currentEl) return;

        e.preventDefault();
        e.stopPropagation();

        const parent = currentEl.parentElement;
        let itemID = parent.id.split('_')[1];
        console.log("Selected: " + itemID);

        await doSomething(); // 👈 WAAAAIT FOR ITTTTTTTT

        if (RealAppID !== "") {
            let command = `download_item ${RealAppID} ${itemID}`;
            await copyTextToClipboard(command);
            if (getAlertAllowness()) {
                alert(`Copied to clipboard: ${command}`);
            }
            console.log(`Copied to clipboard: ${command}`);
        }

        RealAppID = "";
        box.remove();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('click', onClick);
    }


    document.addEventListener('mousemove', onMove);
    document.addEventListener('click', onClick);
}
