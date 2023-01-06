//disabling zoom didnt work
//fix right click keyboard input issue
//fix the issue with images needing to be cached first
//everything is linked to framerate
//maybe preload all images needed
var disp1 = ''
var disp2 = ''
var disp3 = ''
var debug = true
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
var itemsList = {}
var drawList = []
var idList = []
var canvasElement = document.querySelector('canvas')
var canvasContext = canvasElement.getContext('2d')
// canvasContext.lineCap = 'round' //Doesn't work for some reason


//Handles mouse position
var mouse = {
    x:0,
    y:0,
    internalX:function(){return drawToInternalX(this.x)},
    internalY:function(){return drawToInternalY(this.y)}
}
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

//Handles input detection
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


/**
  * Creates a locally unique ID based off of the time.
  *
  * @return {number} Numeric ID
**/
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
/**
  * Removes an ID from the list of used IDs.
  *
  * @param {number} id Numeric ID to remove
  * @return {undefined} 
**/
function deleteID(id) {
    if(idList.indexOf(id) !== -1) {
        idList.splice(idList.indexOf(id), 1)
    }
}


/**
  * Checks for collisions between two items. Must have an x2 and y2, width and height, or radius. Radius collisions assume the item is a circle.
  *
  * @param {object} in1 An object from itemslist
  * @param {object} in2 An object from itemslist
  * @return {boolean} true if they are colliding, false otherwise
**/
function collisionCheck(in1,in2){
    let left1 = in1.x
    let top1 = in1.y
    let right1
    let bottom1
    if(in1.x2 !== undefined && in1.y2 !== undefined) {
        right1  = in1.x2
        bottom1 = in1.y2
    }
    else if(in1.width !== undefined && in1.height !== undefined) {
        right1  = left1 + in1.width
        bottom1 = top1 + in1.height
    }
    else if(in1.radius !== undefined) {
        right1  = left1 + in1.radius*2
        bottom1 = top1 + in1.radius*2
    }
    let left2   = in2.x
    let top2 = in2.y
    let right2
    let bottom2
    if(in2.x2 !== undefined && in2.y2 !== undefined) {
        right2  = in2.x2
        bottom2 = in2.y2
    }
    else if(in2.width !== undefined && in2.height !== undefined) {
        right2  = left2 + in2.width
        bottom2 = top2 + in2.height
    }
    else if(in2.radius !== undefined) {
        right2  = left2 + in2.radius*2
        bottom2 = top2 + in2.radius*2
    }
    // console.log(left1)
    // console.log(right1)
    // console.log(top1)
    // console.log(bottom1)
    // console.log(left2)
    // console.log(right2)
    // console.log(top2)
    // console.log(bottom2)
    if ((right1  >=  left2  ) &&
        (bottom1 >=  top2   ) &&
        (left1   <=  right2 ) &&
        (top1    <=  bottom2)){
        return true
    }
    else {
        return false
    }
}


// Attempt at making these functions less messy, I gave up
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
/**
  * Converts an internal size on the x axis to a size on the canvas. Used for things like an items width.
  *
  * @param {number} input Internal size in pixels
  * @return {number} Canvas size in pixels
**/
function toCanvasX(input) {
    return (input * drawWidth / 1000 / aspectRatio)
}

/**
  * Converts an internal size on the y axis to a size on the canvas. Used for things like an items height.
  *
  * @param {number} input Internal size in pixels
  * @return {number} Canvas size in pixels
**/
function toCanvasY(input) {
    return (input * drawHeight / 1000)
}

/**
  * Converts an internal position on the x axis to a position on the canvas. Used for things like an x position.
  *
  * @param {number} input Internal position in pixels
  * @return {number} Canvas position in pixels
**/
function toDrawX(input) {
    return (input * drawWidth / 1000 / aspectRatio)+xOffset-toCanvasX(cameraX)
}

/**
  * Converts an internal position on the y axis to a position on the canvas. Used for things like an y position.
  *
  * @param {number} input Internal position in pixels
  * @return {number} Canvas position in pixels
**/
function toDrawY(input) {
    return (input * drawHeight / 1000)+yOffset-toCanvasY(cameraY)
}

/**
  * Converts a canvas position on the x axis to an internal position. Used for things like an x position.
  *
  * @param {number} input Canvas position in pixels
  * @return {number} Internal position in pixels
**/
function drawToInternalX(input) { //only use drawtointernal if input has offsets applied already
    return (input-xOffset+toCanvasX(cameraX)) / drawWidth * 1000 * aspectRatio
}

/**
  * Converts a canvas position on the y axis to an internal position. Used for things like an y position.
  *
  * @param {number} input Canvas position in pixels
  * @return {number} Internal position in pixels
**/
function drawToInternalY(input) {
    return (input-yOffset+toCanvasY(cameraY)) / drawHeight * 1000
}

/**
  * Converts a canvas size on the x axis to an internal size. Used for things like an items width.
  *
  * @param {number} input Canvas size in pixels
  * @return {number} Internal size in pixels
**/
function toInternalX(input) {
    return (input) / drawWidth * 1000 * aspectRatio
}

/**
  * Converts a canvas size on the y axis to an internal size. Used for things like an items height.
  *
  * @param {number} input Canvas size in pixels
  * @return {number} Internal size in pixels
**/
function toInternalY(input) {
    return (input) / drawHeight * 1000
}

/**
  * Sorts all objects in itemsList into drawList, based on z position.
  *
  * @return {undefined}
**/
function updateDrawList() {
    drawList = []
    for(let i in itemsList) {
        let index = itemsList[i].z !== undefined ? itemsList[i].z : 0
        drawList.push({z:index, id:i})
    }
    drawList.sort((a,b)=>{return a.z-b.z})
}

/**
  * Draws all items in drawList onto the canvas.
  *
  * @return {undefined}
**/
function drawCanvas() {
    // canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
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
                console.log('draw')
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
    if(yOffset>0) {
        canvasContext.fillRect(0, 0, canvasElement.width, yOffset)
        canvasContext.fillRect(0, yOffset+drawHeight, canvasElement.width, canvasElement.height)
    }
    if(debug === true) {
        canvasContext.fillStyle = '#fff'
        canvasContext.font = `${toCanvasX(50)}px serif`
        canvasContext.fillText(`FPS: ${Math.floor(getAvgFPS())}`, toCanvasX(10), toCanvasY(50))
        canvasContext.fillText(`mouseX: ${Math.floor(mouse.internalX())}`, toCanvasX(10), toCanvasY(100))
        canvasContext.fillText(`mouseY: ${Math.floor(mouse.internalY())}`, toCanvasX(10), toCanvasY(150))
        canvasContext.fillText(`cameraX: ${Math.floor(cameraX)}`, toCanvasX(10), toCanvasY(200))
        canvasContext.fillText(`cameraY: ${Math.floor(cameraY)}`, toCanvasX(10), toCanvasY(250))
    }
}

/**
  * Sets canvas to display at screen resolution. Also sets the drawHeight, drawWidth, xOffset, and yOffset
  *
  * @return {undefined}
**/
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

//these functions arent very useful
function createItem(arguments, arguments2) {
    if(arguments2 === undefined) {
        arguments2 = {}
    }
    let id = arguments2.id !== undefined ? arguments2.id : createID()
    itemsList[id] = {}
    for(let i in arguments) {
        itemsList[id][i] = arguments[i]
    }
    // updateDrawList() //May needlessly tank performance if making many new items in one frame because of pointless sorting
}
function removeItem(id) {
    delete itemsList[id]
    deleteID(id)
    // updateDrawList()
}

updateCanvasSize()
window.addEventListener('resize', updateCanvasSize)

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
}, {id:'pointer'})
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
}, {id:'player'})
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
createItem({
    type:'image',
    image:createImage({src:'TestImage.png'}),
    x:100,
    y:100,
    width:500,
    height:500,
    z:5,
    onSpawn:function(){
        let image = createImage({src:'TestImage.png'}) //Idk why I can't use this.image instead //eg. code
        let ratio = image.naturalWidth/image.naturalHeight //Append the image first probably then get rid of it again
        console.log(image.width)
        this.width = 500
        this.height = this.width * ratio
        this.width = this.height / ratio
    }
}, {id:'image'})
function getAvgFPS() {
    let total = 0
    let now = Date.now()
    for(let i=0; i<FPSCounter.length; i++) {
        if(now - FPSCounter[i].time > 2000) {
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
    if(now - (then - 1000/1) < 1000/1) {
        window.requestAnimationFrame(frameUpdate)
        return
    }
    if(drawList.length !== Object.keys(itemsList).length) {
        updateDrawList()
    }
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









// /**
//  * Returns image dimensions for specified URL.
//  */
// export const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.onload = () => resolve({
//         width: img.width,
//         height: img.height,
//       });
//       img.onerror = (error) => reject(error);
//       img.src = url;
//     });
//   };



// function getMeta(url){   
//     var img = new Image();
//     img.onload = function(){
//         alert( this.width+' '+ this.height );
//     };
//     img.src = url;
// }