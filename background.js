let AlertMe = true;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "steamcmd-helper",
        title: "Get SteamCMD command from image",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "steamcmd-helper-alert",
        title: "Toggle AlertMe",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "steamcmd-helper") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (imageUrl, alertOn) => {
                const images = document.querySelectorAll("img");
                let matchedImg = null;
                for (const img of images) {
                    if (img.src === imageUrl) {
                        matchedImg = img;
                        break;
                    }
                }

                const parent = matchedImg?.parentElement;
                const itemID = parent?.id?.split('_')[1];
                const url = window.location.href;
                const urlObj = new URL(url);
                const appID = urlObj.searchParams.get("appid");

                if (appID && itemID) {
                    const command = `download_item ${appID} ${itemID}`;
                    navigator.clipboard.writeText(command).then(() => {
                        if (alertOn) alert(`Copied to clipboard: ${command}`);
                    });
                } else {
                    if (alertOn) alert("Could not extract appID or itemID.");
                }
            },
            args: [info.srcUrl, AlertMe]
        });
    }

    if (info.menuItemId === "steamcmd-helper-alert") {
        AlertMe = !AlertMe;
        console.log(`AlertMe is now: ${AlertMe}`);
        chrome.action.setBadgeText({ text: AlertMe ? "ON" : "OFF" });
    }
});
