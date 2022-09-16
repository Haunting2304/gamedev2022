document.querySelector("body").style.paddingTop = `${parseInt(window.getComputedStyle(document.querySelector("body"), null).getPropertyValue('padding-top')) + document.getElementById("repo").clientHeight}px`;
document.querySelector("body").style.minHeight = `calc(100vh - ${parseInt(window.getComputedStyle(document.querySelector("body"), null).getPropertyValue('padding-top')) + parseInt(window.getComputedStyle(document.querySelector("body"), null).getPropertyValue('padding-bottom'))}px)`;
window.onresize = style;
function style() {
    var repo = document.getElementById("repo");
    repo.style.left = `calc(50% - ${document.querySelector("body").offsetWidth / 2}px)`;
}
style()
