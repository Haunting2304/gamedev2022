//<meta meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
//fix right click keyboard input issue
//fix the issue with images needing to be cached first
//increase the fps counter time
var disp1 = ''
var disp2 = ''
var disp3 = ''
var debug = false
var FPSCounter = []
var then = Date.now()
var now = then
var aspectRatio = 16/9
var canvasAspectRatio
var drawWidth
var drawHeight
var xOffset
var yOffset
var cameraX = 0
var cameraY = 0
var keyPressed = {}
var canvasElement = document.querySelector('canvas');
var canvasContext = canvasElement.getContext('2d');
// canvasContext.lineCap = 'round' //Doesn't work for some reason
var mouse = {
    x:0,
    y:0,
    internalX:function(){return drawToInternalX(this.x)},
    internalY:function(){return drawToInternalY(this.y)}
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
// function toCanvasX(input, arguments) {
//     if(arguments === undefined) {
//         arguments = {}
//     }
//     let work = input * drawWidth / 1000 / aspectRatio
//     if(arguments.draw || undefined) {
//         work = work + xOffset - toInternalnXold(cameraX, {draw:false})
//     }
//     return work
// }
function toCanvasX(input) {
    return (input * drawWidth / 1000 / aspectRatio)
}
function toCanvasY(input) { //Maybe flip the sign so the internal coordinates work how I want
    return (input * drawHeight / 1000)
}
function toDrawX(input) {
    return (input * drawWidth / 1000 / aspectRatio)+xOffset-toCanvasX(cameraX)
}
function toDrawY(input) {
    return (input * drawHeight / 1000)+yOffset-toCanvasY(cameraY)
}
function drawToInternalX(input) { //these functions suck to look at so probably do something about it //only use if input has the offset applied already
    return (input-xOffset+toCanvasX(cameraX)) / drawWidth * 1000 * aspectRatio
}
function drawToInternalY(input) {
    return (input-yOffset+toCanvasY(cameraY)) / drawHeight * 1000
}
function toInternalX(input) { //these functions suck to look at so probably do something about it //only use if input has the offset applied already
    return (input) / drawWidth * 1000 * aspectRatio
}
function toInternalY(input) {
    return (input) / drawHeight * 1000
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
    // canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    //Temp for testing
    canvasContext.lineWidth = 1
    canvasContext.strokeStyle = '#222'
    canvasContext.fillStyle = '#222'
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height)
    for(let i=0; i<drawList.length; i++) {
        let property = drawList[i].id
        let item = itemsList[property]
        canvasContext.lineWidth = item.lineWidth !== undefined ? item.lineWidth : 1
        canvasContext.strokeStyle = item.color !== undefined ? item.color : '#000'
        canvasContext.fillStyle = item.fillColor !== undefined ? item.fillColor : canvasContext.strokeStyle
        canvasContext.setLineDash(item.lineDash !== undefined ? item.lineDash : [])
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
            case 'circle':
                canvasContext.beginPath()
                canvasContext.arc(toDrawX(item.x), toDrawY(item.y), toCanvasX(item.radius), item.startAngle, item.endAngle)
                canvasContext.stroke()
                break
            case 'fillCircle':
                canvasContext.beginPath()
                canvasContext.arc(toDrawX(item.x), toDrawY(item.y), toCanvasX(item.radius), item.startAngle, item.endAngle)
                canvasContext.fill()
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
    if(debug === true) {
        canvasContext.fillStyle = '#fff'
        canvasContext.font = `${toCanvasX(50)}px serif`
        canvasContext.fillText(`FPS: ${Math.floor(getAvgFPS())}`, toCanvasX(10), toCanvasY(50))
        canvasContext.fillText(`MouseX: ${Math.floor(mouse.internalX())}`, toCanvasX(10), toCanvasY(100))
        canvasContext.fillText(`MouseY: ${Math.floor(mouse.internalY())}`, toCanvasX(10), toCanvasY(150))
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
    if(event.clientX < xOffset) { //Bounds for mouse position
        mouse.x = xOffset
    }
    else if(event.clientX > drawWidth+xOffset) {
        mouse.x = drawWidth+xOffset
    }
    else {
        mouse.x = event.clientX / parseInt(getComputedStyle(canvasElement).width) * canvasElement.width
    }
    if(event.clientY < yOffset) {
        mouse.y = yOffset
    }
    else if(event.clientY > drawHeight+yOffset) {
        mouse.y = drawHeight+yOffset
    }
    else {
        mouse.y = event.clientY / parseInt(getComputedStyle(canvasElement).height) * canvasElement.height
    }
})

document.addEventListener("keydown", (e)=>{
    e = e || window.event;
    keyPressed[e.code] = true
});

document.addEventListener("keyup", (e)=>{
    e = e || window.event;
    delete keyPressed[e.code]
});

window.addEventListener("blur", ()=>{
    keyPressed = {}
});

function createItem(arguments) {
    let id = createID()
    itemsList[id] = {}
    for(let i in arguments) {
        itemsList[id][i] = arguments[i]
    }
    updateDrawList() //May needlessly tank performance if making many new items in one frame because of excessive sorting
}
function removeItem(id) {
    delete itemsList[id]
    deleteID(id)
    updateDrawList()
}
createItem({
    type:'line',
    x:-10000,
    y:0,
    x2:10000,
    y2:0,
    lineDash:[15,5],
    z:-100,
    lineWidth:'1',
    color:'#f00'
})
createItem({
    type:'line',
    x:0,
    y:-10000,
    x2:0,
    y2:10000,
    lineDash:[15,5],
    z:-100,
    lineWidth:'1',
    color:'#0f0'
})
// createItem({
//     type:'rect',
//     x:10,
//     y:10,
//     update:function(){
//         this.x2 = mouse.internalX()
//         this.y2 = mouse.internalY()
//         this.width = this.x2 - this.x
//         this.height = this.y2 - this.y
//     },
//     color:'#f00',
//     lineWidth:'5'
// })
// createItem({
//     type:'line',
//     x:10,
//     y:10,
//     update:function(){
//         this.x2 = mouse.internalX()
//         this.y2 = mouse.internalY()
//     },
//     z:-1,
//     lineWidth:'10',
// })
createItem({
    type:'fillCircle',
    update:function(){
        this.x = mouse.internalX()
        this.y = mouse.internalY()
    },
    radius:5,
    startAngle:0,
    endAngle:2*Math.PI,
    color:'#f00',
    fillColor:this.color,
    z:100
})
function setCameraPos(input) {
    switch(input.mode) {
        case 'center':
            cameraX = input.x - toInternalX(drawWidth) / 2
            cameraY = input.y - toInternalY(drawHeight) / 2
            break
        default:
            cameraX = input.x
            cameraY = input.y
            break
    }
}
createItem({
    type:'fillCircle',
    x:100,
    y:100,
    update:function(){
        if(keyPressed.KeyW) {
            this.y -= 5
        }
        if(keyPressed.KeyA) {
            this.x -= 5
        }
        if(keyPressed.KeyS) {
            this.y += 5
        }
        if(keyPressed.KeyD) {
            this.x += 5
        }
        setCameraPos({x:this.x, y:this.y, mode:'center'})
    },
    radius:15,
    startAngle:0,
    endAngle:2*Math.PI,
    color:'#f00',
    fillColor:this.color,
    z:100
})
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
createItem({ //image sometimes doesnt draw, really bad and idk why
    type:'image',
    image:createImage({src:'TestImage.png'}),
    x:100,
    y:100,
    z:-5,
    onSpawn:function(){
        let image = createImage({src:'TestImage.png'}) //Idk why I can't use this.image instead //eg. code
        let ratio = image.naturalWidth/image.naturalHeight
        this.width = 500
        this.height = this.width * ratio
        this.width = this.height / ratio
    }
})
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
    // if(keyPressed.KeyW) {
    //     cameraY -= 5
    // }
    // if(keyPressed.KeyA) {
    //     cameraX -= 5
    // }
    // if(keyPressed.KeyS) {
    //     cameraY += 5
    // }
    // if(keyPressed.KeyD) {
    //     cameraX += 5
    // }
    let elapsed = now - then
    FPSCounter[FPSCounter.length] = {delay:1000/elapsed, time:now}
    disp1 = `Avg FPS: ${Math.floor(getAvgFPS())}`
    for(let i in itemsList) {
        if(itemsList[i].onSpawn !== undefined) {
            itemsList[i].onSpawn()
            delete itemsList[i].onSpawn
        }
        if(itemsList[i].update !== undefined) {
            itemsList[i].update()
        }
    }
    drawCanvas()
    then = now
    window.requestAnimationFrame(frameUpdate)
}
frameUpdate()
