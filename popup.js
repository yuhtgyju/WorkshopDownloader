document.getElementById("startPicker").addEventListener("click", () => {
    const allowAlert = document.getElementById("alertMe").checked;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        if (!tab || !tab.id) return;

        // Inject script if needed
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                files: ["content.js"]
            },
            () => {
                // Send alertAllowed flag WITH message
                chrome.tabs.sendMessage(tab.id, {
                    action: "startPicker",
                    alertAllowed: allowAlert
                });
            }
        );
    });
});
