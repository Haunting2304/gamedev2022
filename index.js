var settingsOpen = false;
function toggleSettings() {
    settingsOpen = !settingsOpen
    if(settingsOpen) {
        document.getElementById("settingsMenu").style.visibility = "visible"
    }
    else {
        document.getElementById("settingsMenu").style.visibility = "hidden"
    }
}
