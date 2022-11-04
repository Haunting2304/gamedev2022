var settingsOpen = false;
function toggleSettings() {
    settingsOpen = !settingsOpen
    if(settingsOpen) {
        document.getElementById("settingsMenu").hidden = false
    }
    else {
        document.getElementById("settingsMenu").hidden = true
    }
}
