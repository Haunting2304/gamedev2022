var disp1 = ''
var disp2 = ''
var disp3 = ''
var FPSCounter = []
var then = Date.now()
var now = then
var fps = 60
var aspectRatio = 16/9
var canvasAspectRatio
var drawWidth
var drawHeight
var xOffset
var yOffset
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
function toCanvasX(input) {
    return (input * drawWidth / 1000)+xOffset
}
function toCanvasY(input) {
    return (input * drawHeight / 1000)+yOffset
}
function toInternalX(input) {
    return (input-xOffset) / drawWidth * 1000
}
function toInternalY(input) {
    return (input-yOffset) / drawHeight * 1000
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
                canvasContext.rect(toCanvasX(item.x), toCanvasY(item.y), toCanvasX(item.width), toCanvasY(item.height))
                canvasContext.stroke()
                break
            case 'line':
                canvasContext.beginPath()
                canvasContext.moveTo(toCanvasX(item.x), toCanvasY(item.y))
                canvasContext.lineTo(toCanvasX(item.x2), toCanvasY(item.y2))
                canvasContext.stroke()
                break
            case 'image':
                canvasContext.drawImage(item.image, toCanvasX(item.x), toCanvasY(item.y), toCanvasX(item.width), toCanvasY(item.height))
        }
    }
}
function updateCanvasSize() {
    canvasElement.width = parseInt(getComputedStyle(canvasElement).width)
    canvasElement.height = parseInt(getComputedStyle(canvasElement).height)
    canvasAspectRatio = canvasElement.width/canvasElement.height
    if(canvasAspectRatio>aspectRatio) { //Bars on sides
        drawHeight = canvasElement.height
        drawWidth = canvasElement.height * aspectRatio
        xOffset = (canvasElement.width - drawWidth)/2
        yOffset = 0
    }
    else if(canvasAspectRatio<aspectRatio) { //Bars top and bottom
        drawWidth = canvasElement.width
        drawHeight = canvasElement.width / aspectRatio
        yOffset = (canvasElement.height - drawHeight)/2
        xOffset = 0
    }
    else { //No bars
        drawWidth = canvasElement.width
        drawHeight = canvasElement.height
        xOffset = 0
        yOffset = 0
    }
    drawCanvas()
}
updateCanvasSize()
window.addEventListener('resize', updateCanvasSize)
document.querySelector('html').addEventListener('mousemove', (event)=>{
    mouse.x = toInternalX(event.clientX / parseInt(getComputedStyle(canvasElement).width) * canvasElement.width)
    mouse.y = toInternalY(event.clientY / parseInt(getComputedStyle(canvasElement).height) * canvasElement.height)
})



itemsList[createID()] = {
    type:'rect',
    x:10,
    y:10,
    update:function(){
        this.width = mouse.x - this.x
        this.height = mouse.y - this.y
    },
    color:'#f00',
    lineWidth:'5'
}
itemsList[createID()] = {
    type:'line',
    x:10,
    y:10,
    update:function(){
        this.x2 = mouse.x
        this.y2 = mouse.y
    },
    z:-1,
    lineWidth:'10'
}
itemsList[createID()] = {
    type:'rect',
    x:10,
    y:1000,
    width:20,
    height:20,
    yVelocity:0,
    xVelocity:0,
    color:'#f00',
    update:function(){
        // this.xVelocity += 1
        // this.x += this.xVelocity
        this.yVelocity -= 1
        this.y += this.yVelocity
        if(this.y < 0) {
            this.y = 0
            this.yVelocity = 0
        }
    },
    z:-1,
    lineWidth:'10'
}
itemsList[createID()] = {
    type:'line',
    x:10,
    y:10,
    yVelocity:0,
    update:function(){
        this.yVelocity += 1
        this.y += this.yVelocity
        this.x2 = this.x+100
        this.y2 = mouse.y
        if(this.y > 1000) {
            this.y = 1000
            this.yVelocity = 0
        }
    },
    color:'#0f0'
}
function createImage(input) {
    let img = new Image()
    for(let i in input) {
        img[i] = input[i]
    }
    return img
}
itemsList[createID()] = {
    type:'image',
    image:createImage({src:'TestImage.png'}),
    x:100,
    y:100,
    x2:200,
    y2:200,
    z:-5,
    update:function(){
        this.width = this.x2 - this.x
        this.height = this.y2 - this.y
    }
}
updateDrawList()
function getAvgFPS() {
    let total = 0
    let now = Date.now()
    for(let i=0; i<FPSCounter.length; i++) {
        if(now - FPSCounter[i].time > 1000) {
            FPSCounter.splice(i, 1)
            i--
        }
        else {
            total += FPSCounter[i].delay
        }
    }
    return total / FPSCounter.length
}
function frameUpdate() {
    now = Date.now()
    let elapsed = now - then
    FPSCounter[FPSCounter.length] = {delay:1000/elapsed, time:now}
    disp1 = `Avg FPS: ${Math.floor(getAvgFPS())}`
    window.requestAnimationFrame(frameUpdate)
    for(let i in itemsList) {
        if(itemsList[i].update !== undefined) {
            itemsList[i].update()
        }
    }
    drawCanvas()
    then = now
}
frameUpdate()