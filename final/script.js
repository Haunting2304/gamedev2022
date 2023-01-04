var disp1 = ''
var disp2 = ''
var disp3 = ''
var FPSCounter = []
var then = Date.now()
var now = then
var aspectRatio = 16/9
var canvasAspectRatio
var drawWidth
var drawHeight
var xOffset
var yOffset
var canvasElement = document.querySelector('canvas');
var canvasContext = canvasElement.getContext('2d');
// canvasContext.lineCap = 'round' //Doesn't work for some reason
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
    return (input * drawWidth / 1000)
}
function toCanvasY(input) { //Maybe flip so the internal coordinates work how I want
    return (input * drawHeight / 1000)
}
function toDrawX(input) {
    return (input * drawWidth / 1000)+xOffset
}
function toDrawY(input) {
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
        canvasContext.fillStyle = item.fillColor !== undefined ? item.fillColor : canvasContext.strokeStyle
        switch(item.type) {
            case 'rect':
                canvasContext.beginPath()
                canvasContext.rect(toDrawX(item.x), toDrawY(item.y), toCanvasX(item.width), toCanvasY(item.height))
                canvasContext.stroke()
                break
            case 'fillRect':
                canvasContext.fillRect(toDrawX(item.x), toDrawY(item.y), toCanvasX(item.width), toCanvasY(item.height))
                break
            case 'line':
                canvasContext.beginPath()
                canvasContext.moveTo(toDrawX(item.x), toDrawY(item.y))
                canvasContext.lineTo(toDrawX(item.x2), toDrawY(item.y2))
                canvasContext.stroke()
                break
            case 'image':
                canvasContext.drawImage(item.image, toDrawX(item.x), toDrawY(item.y), toCanvasX(item.width), toCanvasY(item.height))
                break
        }
    }
    //Draws black bars                    
    canvasContext.lineWidth = 1
    canvasContext.strokeStyle = '#000'
    canvasContext.fillStyle = '#000'
    if(xOffset>0) {
        canvasContext.fillRect(0, 0, xOffset, canvasElement.height)
        canvasContext.fillRect(xOffset+drawWidth, 0, canvasElement.width, canvasElement.height)
    }
    else {
        canvasContext.fillRect(0, 0, canvasElement.width, yOffset)
        canvasContext.fillRect(0, yOffset+drawHeight, canvasElement.width, canvasElement.height)
    }
}
function updateCanvasSize() {
    canvasElement.width = parseInt(getComputedStyle(canvasElement).width)
    canvasElement.height = parseInt(getComputedStyle(canvasElement).height)
    canvasAspectRatio = canvasElement.width/canvasElement.height
    //Bigger aspect ratio means more width for each height
    if(canvasAspectRatio>aspectRatio) { //Bars on sides
        drawWidth = canvasElement.height * aspectRatio
        drawHeight = canvasElement.height
        xOffset = (canvasElement.width - drawWidth)/2
        yOffset = 0
    }
    else if(canvasAspectRatio<aspectRatio) { //Bars on top and bottom
        drawWidth = canvasElement.width
        drawHeight = canvasElement.width / aspectRatio
        xOffset = 0
        yOffset = (canvasElement.height - drawHeight)/2
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
window.addEventListener('mousemove', (event)=>{
    if(event.clientX < xOffset) {
        mouse.x = toInternalX(xOffset)
    }
    else if(event.clientX > drawWidth+xOffset) {
        mouse.x = toInternalX(drawWidth+xOffset)
    }
    else {
        mouse.x = toInternalX(event.clientX / parseInt(getComputedStyle(canvasElement).width) * canvasElement.width)
    }
    if(event.clientY < yOffset) {
        mouse.y = toInternalY(yOffset)
    }
    else if(event.clientY > drawHeight+yOffset) {
        mouse.y = toInternalY(drawHeight+yOffset)
    }
    else {
        mouse.y = toInternalY(event.clientY / parseInt(getComputedStyle(canvasElement).height) * canvasElement.height)
    }
})


function createItem(arguments, bypass) {
    let id = createID()
    itemsList[id] = {}
    for(let i in arguments) {
        itemsList[id][i] = arguments[i]
    }
    updateDrawList() //May needlessly tank performance if making multiple new items in one frame because of excessive sorting
}
function removeItem(id) {
    delete itemsList[id]
    deleteID(id)
    updateDrawList()
}
createItem({
    type:'rect',
    x:10,
    y:10,
    update:function(){
        this.x2 = mouse.x
        this.y2 = mouse.y
        this.width = this.x2 - this.x
        this.height = this.y2 - this.y
    },
    color:'#f00',
    lineWidth:'5'
})
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
// itemsList[createID()] = {
//     type:'rect',
//     x:10,
//     y:1000,
//     width:20,
//     height:20,
//     yVelocity:0,
//     xVelocity:0,
//     color:'#f00',
//     update:function(){
//         // this.xVelocity += 1
//         // this.x += this.xVelocity
//         this.yVelocity -= 1
//         this.y += this.yVelocity
//         if(this.y < 0) {
//             this.y = 0
//             this.yVelocity = 0
//         }
//     },
//     z:-1,
//     lineWidth:'10'
// }
// itemsList[createID()] = {
//     type:'line',
//     x:10,
//     y:10,
//     yVelocity:0,
//     update:function(){
//         this.yVelocity += 1
//         this.y += this.yVelocity
//         this.x2 = this.x+100
//         this.y2 = mouse.y
//         if(this.y > 1000) {
//             this.y = 1000
//             this.yVelocity = 0
//         }
//     },
//     color:'#0f0'
// }
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
    width:100,
    height:100,
    z:-5
}
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
    for(let i in itemsList) {
        if(itemsList[i].update !== undefined) {
            itemsList[i].update()
        }
    }
    drawCanvas()
    then = now
    window.requestAnimationFrame(frameUpdate)
}
frameUpdate()