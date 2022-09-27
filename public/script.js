var darkMode = true;
debugger;
if(darkMode == true) {
    document.getElementById("styleMode").href="/gamedev2022/public/style.css";
}
else {
    document.getElementById("styleMode").href="/gamedev2022/public/styleLight.css";
}
window.onresize = style;
function style() {
}
style()
