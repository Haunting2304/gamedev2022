var darkMode = true;
if(darkMode) {
    document.getElementById("styleMode").href="/gamedev2022/public/style.css";
}
else {
    document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
}
toggleStyle() {
    darkMode = !darkMode
    if(darkMode) {
        document.getElementById("styleMode").href="/gamedev2022/public/style.css";
    }
    else {
        document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
    }
}
window.onresize = style;
function style() {
}
style()
