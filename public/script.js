window.onresize = style;
function style() {
}


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
    document.getElementById("styleMode").href="/gamedev2022/public/style.css";
}
else {
    document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
}
function toggleStyle() {
    darkMode = !darkMode
    if(darkMode) {
        localStorage.setItem('darkModePref', true);
        document.getElementById("styleMode").href="/gamedev2022/public/style.css";
    }
    else {
        localStorage.setItem('darkModePref', false);
        document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
    }
}


style()
