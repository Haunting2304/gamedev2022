var darkMode = true;
debugger;
if(darkMode == true) {
    var a = document.createElement(link);
    a.rel="stylesheet";
    a.type="text/css";
    a.href="/gamedev2022/public/style.css";
}
else {
    var a = document.createElement(link);
    a.rel="stylesheet";
    a.type="text/css";
    a.href="/gamedev2022/public/styleLight.css";
}
window.onresize = style;
function style() {
}
style()
