function stringToBool(x) {
    if(x == "true") {
        return true
    }
    else if(x == "false") {
        return false
    }
    else {
        return undefined
    }
}

if(localStorage.getItem('darkModePref') == undefined) {
    localStorage.setItem('darkModePref', true);
}
var darkMode = stringToBool(localStorage.getItem('darkModePref'))
getThemeSheet()
function updateTheme() {
    darkMode = document.getElementById("darkModeButton").checked
    localStorage.setItem('darkModePref', darkMode)
    getThemeSheet()
}
function getThemeSheet() {
    if(darkMode) {
    document.getElementById("styleMode").href="/gamedev2022/styleDark.css";
    }
    else {
        document.getElementById("styleMode").href="/gamedev2022/styleLight.css";
    }
}
function onPageLoad() {
    if(document.getElementById("darkModeButton") != undefined) {
    document.getElementById("darkModeButton").checked = darkMode
    }
}
