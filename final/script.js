var fps = 30
var canvasElement = document.querySelector('canvas');
var canvasContext = canvasElement.getContext('2d');
canvasContext.lineCap = 'round'
var mouse = {
    x:0,
    y:0
}
var drawList = {}
drawList[Date.now()] = {
    type:'line',
    x:10,
    y:10,
    x2:mouse.x,
    y2:100
}
function drawCanvas() {
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    console.log('a')
    for(let i in drawList) {
        let item = drawList[i]
        switch(item.type) {
            case 'rect':
                canvasContext.rect(item.x, item.y, item.height, item.width)
                break
            case 'line':
                canvasContext.moveTo(item.x, item.y)
                canvasContext.lineTo(mouse.x, mouse.y)
        }
        canvasContext.stroke()
    }
}
function mouseMove(event) {
    mouse.x = (event.clientX-3)/parseInt(getComputedStyle(canvasElement).width)*canvasElement.width
    mouse.y = (event.clientY-3)/parseInt(getComputedStyle(canvasElement).height)*canvasElement.height
}
function updateCanvasSize() {
    canvasElement.width = parseInt(getComputedStyle(canvasElement).width)
    canvasElement.height = parseInt(getComputedStyle(canvasElement).height)
    drawCanvas()
}
updateCanvasSize()
window.addEventListener('resize', updateCanvasSize)
document.querySelector('html').addEventListener('mousemove', (event)=>{mouseMove(event)})
setInterval(()=>{
    drawCanvas()
}, 1000 / fps)