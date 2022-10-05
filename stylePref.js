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
var light
var dark
if(document.getElementById("customTheme") != undefined) {
    light = document.getElementById("customThemeLight").innerHTML
    dark = document.getElementById("customThemeDark").innerHTML
}
else {
    light = "/gamedev2022/styleLight.css"
    dark = "/gamedev2022/styleDark.css"
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
    document.getElementById("styleMode").href = dark;
    }
    else {
        document.getElementById("styleMode").href = light;
    }
}
function onPageLoad() {
    if(document.getElementById("darkModeButton") != undefined) {
    document.getElementById("darkModeButton").checked = darkMode
    }
}
