var fps = 60
var canvasElement = document.querySelector('canvas');
var canvasContext = canvasElement.getContext('2d');
canvasContext.lineCap = 'round'
var mouse = {
    x:0,
    y:0
}
var itemsList = {}
var drawList = []
var idList = []
function createID() {
    let i=0
    while(true) {
        if(idList.indexOf(Date.now()) === -1) {
            idList.push(Date.now())
            return Date.now()
        }
        i++
    }
}
function deleteID(id) {
    if(idList.indexOf(id) !== -1) {
        idList.splice(idList.indexOf(id), 1)
    }
}
function docToCanvas(input) {
    return input / parseInt(getComputedStyle(canvasElement).width) * canvasElement.width
}
function canvasToDoc(input) {
    return input * parseInt(getComputedStyle(canvasElement).width) / canvasElement.width
}
function updateDrawList() {
    drawList = []
    for(let i in itemsList) {
        let index = itemsList[i].z !== undefined ? itemsList[i].z : 0
        drawList.push({z:index, id:i})
    }
    drawList.sort((a,b)=>{return a.z-b.z})
}
function drawCanvas() {
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    for(let i=0; i<drawList.length; i++) {
        let property = drawList[i].id
        let item = itemsList[property]
        canvasContext.lineWidth = item.lineWidth !== undefined ? item.lineWidth : 1
        canvasContext.strokeStyle = item.color !== undefined ? item.color : '#000'
        switch(item.type) {
            case 'rect':
                canvasContext.beginPath()
                canvasContext.rect(item.x, item.y, mouse.x-item.x, mouse.y-item.y)
                canvasContext.stroke()
                break
            case 'line':
                canvasContext.beginPath()
                canvasContext.moveTo(item.x, item.y)
                canvasContext.lineTo(mouse.x, mouse.y)
                canvasContext.stroke()
                break
            case 'image':
                canvasContext.drawImage(item.image, item.x, item.y)
        }
        
    }
}
function mouseMove(event) {
    mouse.x = docToCanvas(event.clientX)
    mouse.y = docToCanvas(event.clientY)
}
function updateCanvasSize() {
    canvasElement.width = parseInt(getComputedStyle(canvasElement).width)
    canvasElement.height = parseInt(getComputedStyle(canvasElement).height)
    drawCanvas()
}
updateCanvasSize()
window.addEventListener('resize', updateCanvasSize)
document.querySelector('html').addEventListener('mousemove', (event)=>{mouseMove(event)})



itemsList[createID()] = {
    type:'rect',
    x:10,
    y:10,
    x2:100,
    y2:100,
    color:'#f00',
    lineWidth:'5'
}
itemsList[createID()] = {
    type:'line',
    x:10,
    y:10,
    z:-1,
    x2:100,
    y2:100,
    lineWidth:'10'
}
itemsList[createID()] = {
    type:'line',
    x:10,
    y:10,
    x2:100,
    y2:100,
    color:'#0f0'
}
function createImage(src) {
    let img = new Image()
    img.src = src
    return img
}
itemsList[createID()] = {
    type:'image',
    image:createImage('te_ctrl3.png'),
    x:100,
    y:100,
    z:-5
}
updateDrawList()



setInterval(()=>{
    drawCanvas()
}, 1000 / fps)