debugger;
document.querySelector("body").style.paddingTop = `${document.getElementById("repo").offsetHeight}px`;
document.querySelector("body").style.minHeight = `100vh`;
window.onresize = style;
function style() {
    var repo = document.getElementById("repo"));
    repo.style.left = `calc(50% - ${document.querySelector("body").offsetWidth / 2}px)`;
}
style()
