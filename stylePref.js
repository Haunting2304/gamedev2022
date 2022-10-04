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
if(document.getElementById("darkModeButton") != undefined) {
    document.getElementById("darkModeButton").value = darkMode
}
if(darkMode) {
    document.getElementById("styleMode").href="/gamedev2022/styleDark.css";
}
else {
    document.getElementById("styleMode").href="/gamedev2022/styleLight.css";
}
function updateTheme() {
    darkMode = document.getElementById("darkModeButton").value
    localStorage.setItem('darkModePref', darkMode)
    
    if(darkMode) {
    document.getElementById("styleMode").href="/gamedev2022/styleDark.css";
    }
    else {
        document.getElementById("styleMode").href="/gamedev2022/styleLight.css";
    }
}
