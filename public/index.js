document.querySelector("body").style.marginTop = `${document.getElementById("repo").offsetHeight}px`
document.querySelector("body").style.minHeight = `calc(100vh - ${(document.querySelector("repo").offsetHeight)}px - 6em)`;
window.onresize = style;
function style() {
    var repo = document.getElementById("repo"));
    repo.style.left = `calc(50% - ${document.querySelector("body").offsetWidth / 2}px)`;
}
style()
