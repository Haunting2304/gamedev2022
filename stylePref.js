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
if(darkMode) {
    document.getElementById("styleMode").href="/gamedev2022/styleDark.css";
}
else {
    document.getElementById("styleMode").href="/gamedev2022/styleLight.css";
}
function toggleDarkMode() {
    darkMode = !darkMode
    if(darkMode) {
        localStorage.setItem('darkModePref', true);
        document.getElementById("styleMode").href="/gamedev2022/styleDark.css";
    }
    else {
        localStorage.setItem('darkModePref', false);
        document.getElementById("styleMode").href="/gamedev2022/styleLight.css";
    }
}