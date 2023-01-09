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
var light = "/gamedev2022/styleLight.css"
var dark = "/gamedev2022/styleDark.css"
var darkMode
if(localStorage.getItem('darkModePref') == undefined) {
    if (window.matchMedia) {
        if(window.matchMedia('(prefers-color-scheme: dark)').matches){
            darkMode = true
        } else {
            darkMode = false
        }
      } else {
        darkMode = true
      }
    
}
else {
    darkMode = stringToBool(localStorage.getItem('darkModePref'))
}
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