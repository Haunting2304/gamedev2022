if(localStorage.getItem('stylePref') == undefined) {
    localStorage.setItem('stylePref', true);
}
var darkMode = localStorage.getItem('stylePref')
if(darkMode) {
    document.getElementById("styleMode").href="/gamedev2022/public/style.css";
}
else {
    document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
}
function toggleStyle() {
    darkMode = !darkMode
    if(darkMode) {
        localStorage.setItem('stylePref', true);
        document.getElementById("styleMode").href="/gamedev2022/public/style.css";
    }
    else {
        localStorage.setItem('stylePref', false);
        document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
    }
}
window.onresize = style;
function style() {
}
style()
