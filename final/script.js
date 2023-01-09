//draw vectors?
//tabbing in should reset frame timer to stop intentional tunneling
//disabling zoom didnt work
//fix right click keyboard input issue
//maybe preload all images needed
var disp1 = ''
var disp2 = ''
var disp3 = ''
var disp4 = ''
var disp5 = ''
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
var cameraZoom = 2
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

function rotateQuad(quad, angle, rotationCenter) {
    let centerX
    let centerY
    if (rotationCenter === 'center') {
        let right = Math.max(quad.x, quad.x2, quad.x3, quad.x4)
        let left = Math.min(quad.x, quad.x2, quad.x3, quad.x4)
        let bottom = Math.max(quad.y, quad.y2, quad.y3, quad.y4)
        let top = Math.min(quad.y, quad.y2, quad.y3, quad.y4)
        centerX = left + (.5 * (right - left))
        centerY = top + (.5 * (bottom - top))
    }
    else if(rotationCenter === 'leftcenter') {
        let left = Math.min(quad.x, quad.x2, quad.x3, quad.x4)
        let bottom = Math.max(quad.y, quad.y2, quad.y3, quad.y4)
        let top = Math.min(quad.y, quad.y2, quad.y3, quad.y4)
        centerX = left
        centerY = top + (.5 * (bottom - top))
    }
    else if (rotationCenter === 'rightcenter') {
        let right = Math.max(quad.x, quad.x2, quad.x3, quad.x4)
        let bottom = Math.max(quad.y, quad.y2, quad.y3, quad.y4)
        let top = Math.min(quad.y, quad.y2, quad.y3, quad.y4)
        centerX = right
        centerY = top + (.5 * (bottom - top))
    }
    
    let max
    if(quad.type === 'quad') {
        max = 5
    }
    else if(quad.type === 'tri') {
        max = 4
    }
    for(let i=1; i<max; i++) {
        if(i === 1) {
            i = ''
        }
        let radians = (Math.PI / 180) * angle
        let x = quad[`x${i}`]
        let y = quad[`y${i}`]
        let cos = Math.cos(radians)
        let sin = Math.sin(radians)
        let nx = (cos * (x - centerX)) + (sin * (y - centerY)) + centerX
        let ny = (cos * (y - centerY)) - (sin * (x - centerX)) + centerY
        quad[`x${i}`] = nx
        quad[`y${i}`] = ny
        if(i === '') {
            i = 1
        }
    }
    return quad
}

/**
  * Checks for collisions between two items. Must be able to have a bounding box made.
  *
  * @param {object} item1 An object from itemslist
  * @param {object} item2 An object from itemslist
  * @return {boolean} true if they are colliding, false otherwise
**/
function collisionCheck(item1, item2){
    let box1 = findBoundingBox(item1)
    let box1OriginalType = box1.type
    if(box1.type === 'OBB'){
        box1 = OBBToAABB(box1)
    }
    let box2 = findBoundingBox(item2)
    let box2OriginalType = box2.type
    if(box2.type === 'OBB'){
        box2 = OBBToAABB(box2)
    }
    if((box1.xMax > box2.xMin && box1.xMin < box2.xMax) && (box1.yMax > box2.yMin && box1.yMin < box2.yMax)) {
        let result = true
        if(box1OriginalType === 'OBB' || box2OriginalType === 'OBB') {
            result = collisionCheckSAT(item1, item2)
        }
        return result
    }
    else {
        return false
    }
}

//Assumes the OBB is a quad
function OBBToAABB(box) {
    output = {}
    output.type = 'AABB'
    output.xMin = Math.min(box.x, box.x2, box.x3, box.x4)
    output.xMax = Math.max(box.x, box.x2, box.x3, box.x4)
    output.yMin = Math.min(box.y, box.y2, box.y3, box.y4)
    output.yMax = Math.max(box.y, box.y2, box.y3, box.y4)
    return output
}

function AABBToOBB(box) {
    output = {}
    output.type = 'OBB'
    output.x = box.xMin
    output.y = box.yMin
    output.x2 = box.xMax
    output.y2 = box.yMin
    output.x3 = box.xMax
    output.y3 = box.yMax
    output.x4 = box.xMin
    output.y4 = box.yMax
    return output
}

//Assumes the OBB is a quad
// if one of them is an AABB, then why not just check if any of the points in the OBB are colliding with the AABB
function collisionCheckSAT(item1, item2) {
    let box1 = findBoundingBox(item1)
    if(box1.type === 'AABB'){box1 = AABBToOBB(box1)}
    let box2 = findBoundingBox(item2)
    if(box2.type === 'AABB'){box2 = AABBToOBB(box2)}
    let point1 = [box1.x, box1.y]
    let point2 = [box1.x2, box1.y2]
    let point3 = [box1.x3, box1.y3]
    let point4 = [box1.x4, box1.y4]
    let points = [point1, point2, point3, point4]
    let vector1 = [box1.x-box1.x4, box1.y-box1.y4]
    let vector2 = [box1.x2-box1.x, box1.y2-box1.y]
    let vector3 = [box1.x3-box1.x2, box1.y3-box1.y2]
    let vector4 = [box1.x4-box1.x3, box1.y4-box1.y3]
    let vectorPerp1 = [-vector1[1], vector1[0]]
    let vectorPerp2 = [-vector2[1], vector2[0]]
    let vectorPerp3 = [-vector3[1], vector3[0]]
    let vectorPerp4 = [-vector4[1], vector4[0]]
    let pointB1 = [box2.x, box2.y]
    let pointB2 = [box2.x2, box2.y2]
    let pointB3 = [box2.x3, box2.y3]
    let pointB4 = [box2.x4, box2.y4]
    let pointsB = [pointB1, pointB2, pointB3, pointB4]
    let vectorB1 = [box2.x-box2.x4, box2.y-box2.y4]
    let vectorB2 = [box2.x2-box2.x, box2.y2-box2.y]
    let vectorB3 = [box2.x3-box2.x2, box2.y3-box2.y2]
    let vectorB4 = [box2.x4-box2.x3, box2.y4-box2.y3]
    let vectorPerpB1 = [-vectorB1[1], vectorB1[0]]
    let vectorPerpB2 = [-vectorB2[1], vectorB2[0]]
    let vectorPerpB3 = [-vectorB3[1], vectorB3[0]]
    let vectorPerpB4 = [-vectorB4[1], vectorB4[0]]
    let AMin
    let AMax
    let BMin
    let BMax
    let checkVectors = [vectorPerp1,vectorPerp2,vectorPerp3,vectorPerp4,vectorPerpB1,vectorPerpB2,vectorPerpB3,vectorPerpB4]
    let dotProduct = []
    let dotProductB = []
    for(let i=0; i<checkVectors.length; i++) {
        for(let j=0; j<4; j++) {
            dotProduct[j] = dot(points[j], checkVectors[i])
            dotProductB[j] = dot(pointsB[j], checkVectors[i])
        }
        AMin = Math.min(dotProduct[0],dotProduct[1],dotProduct[2],dotProduct[3])
        AMax = Math.max(dotProduct[0],dotProduct[1],dotProduct[2],dotProduct[3])
        BMin = Math.min(dotProductB[0],dotProductB[1],dotProductB[2],dotProductB[3])
        BMax = Math.max(dotProductB[0],dotProductB[1],dotProductB[2],dotProductB[3])
        if(!(AMax > BMin && AMin < BMax)) {
            return false
        }
        // var vecX = Math.cos(axisAngle) * deepness
        // var vecY = Math.sin(axisAngle) * deepness
        // var sumX = vec1X + vec2X + ...
        // var sumY = vec1Y + vec2Y + ...
        // deepness is AMax - BMin assuming AMin < BMax
        // if AMin > BMax then deepness is *probably* BMin - AMax
        // alternatively just use absolute value?
        // idk what axis angle is
        // deepness = sqrt(x * x +  y * y)  apparently
    }
    return true
}

//fix?
dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

//Radius collisions assume the item is a circle.
function findBoundingBox(item) {
    let box = {}
    switch(item.type) {
        case 'line': //make this better
            box.type = 'OBB'
            let dx = item.x2 - item.x
            let dy = item.y - item.y2
            let slope = dy/dx
            let angle = Math.atan(slope)/Math.PI*180
            let length = Math.sqrt((item.x2 - item.x)**2 + (item.y2 - item.y)**2)
            let rotationCenter = 'leftcenter'
            if(dx < 0) {
                length = length * -1
                rotationCenter = 'rightcenter'
            }
            let quad = {
                type:'quad',
                x:item.x,
                y:item.y+.5*item.lineWidth,
                x2:item.x+length,
                y2:item.y+.5*item.lineWidth,
                x3:item.x+length,
                y3:item.y-.5*item.lineWidth,
                x4:item.x,
                y4:item.y-.5*item.lineWidth
            }
            quad = rotateQuad(quad, angle, rotationCenter)
            // console.log(`x2: ${Math.floor(item.x2)}\ny2: ${Math.floor(item.y2)}`)
            box = quad
            box.type = 'OBB'
            // console.log(`dx = ${dx}\ndy = ${dy}\nslope = ${slope}\nangle = ${angle}\nlength = ${length}`)
            break
        case 'quad':
        case 'tri':
            box.type = 'OBB'
            let vertexCount
            if(item.type === 'tri'){vertexCount=3}
            if(['quad'].indexOf(item.type) !== -1){vertexCount=4}
            for(let i=1; i<vertexCount+1; i++) {
                if(i===1){i=''}
                box[`x${i}`] = item[`x${i}`]
                box[`y${i}`] = item[`y${i}`]
                if(i===''){i=1}
            }
            break
        case 'rect':
        case 'fillRect':
        case 'image':
            box.type = 'AABB'
            box.xMin = item.x
            box.yMin = item.y
            box.xMax = box.xMin + item.width
            box.yMax = box.yMin + item.height
            break
        case 'circle':
        case 'fillCircle':
            box.type = 'AABB'
            box.xMin = item.x - item.radius
            box.yMin = item.y - item.radius
            box.xMax = box.xMin + item.radius*2
            box.yMax = box.yMin + item.radius*2
            break

    }
    return box
}
function calcMinTranslation(box1, box2) {
    if(box1.type === 'OBB'){box1 = OBBToAABB(box1)}
    if(box2.type === 'OBB'){box2 = OBBToAABB(box2)}
    leftDiff   =  box2.xMin - box1.xMax
    rightDiff  =  box2.xMax - box1.xMin
    topDiff    =  box2.yMin - box1.yMax
    bottomDiff =  box2.yMax - box1.yMin
    if(Math.abs(leftDiff) <= Math.min(Math.abs(rightDiff), Math.abs(topDiff), Math.abs(bottomDiff))) {
        return {axis:'x', magnitude:leftDiff}
    }
    if(Math.abs(rightDiff) <= Math.min(Math.abs(leftDiff), Math.abs(topDiff), Math.abs(bottomDiff))) {
        return {axis:'x', magnitude:rightDiff}
    }
    if(Math.abs(topDiff) <= Math.min(Math.abs(rightDiff), Math.abs(leftDiff), Math.abs(bottomDiff))) {
        return {axis:'y', magnitude:topDiff}
    }
    if(Math.abs(bottomDiff) <= Math.min(Math.abs(rightDiff), Math.abs(topDiff), Math.abs(leftDiff))) {
        return {axis:'y', magnitude:bottomDiff}
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
    return input * drawWidth / 1000 / aspectRatio * cameraZoom
}

/**
  * Converts an internal size on the y axis to a size on the canvas. Used for things like an items height.
  *
  * @param {number} input Internal size in pixels
  * @return {number} Canvas size in pixels
**/
function toCanvasY(input) {
    return input * drawHeight / 1000 * cameraZoom
}

/**
  * Converts an internal position on the x axis to a position on the canvas. Used for things like an x position.
  *
  * @param {number} input Internal position in pixels
  * @return {number} Canvas position in pixels
**/
function toDrawX(input) {
    return toCanvasX(input) + xOffset-toCanvasX(cameraX)
}

/**
  * Converts an internal position on the y axis to a position on the canvas. Used for things like an y position.
  *
  * @param {number} input Internal position in pixels
  * @return {number} Canvas position in pixels
**/
function toDrawY(input) {
    return toCanvasY(input) + yOffset-toCanvasY(cameraY)
}

/**
  * Converts a canvas position on the x axis to an internal position. Used for things like an x position.
  *
  * @param {number} input Canvas position in pixels
  * @return {number} Internal position in pixels
**/
function drawToInternalX(input) { //only use drawtointernal if input has offsets applied already
    return toInternalX(input - xOffset+toCanvasX(cameraX))
}

/**
  * Converts a canvas position on the y axis to an internal position. Used for things like an y position.
  *
  * @param {number} input Canvas position in pixels
  * @return {number} Internal position in pixels
**/
function drawToInternalY(input) {
    return toInternalX(input - yOffset+toCanvasY(cameraY))
}

/**
  * Converts a canvas size on the x axis to an internal size. Used for things like an items width.
  *
  * @param {number} input Canvas size in pixels
  * @return {number} Internal size in pixels
**/
function toInternalX(input) {
    return (input) / drawWidth * 1000 * aspectRatio / cameraZoom
}

/**
  * Converts a canvas size on the y axis to an internal size. Used for things like an items height.
  *
  * @param {number} input Canvas size in pixels
  * @return {number} Internal size in pixels
**/
function toInternalY(input) {
    return (input) / drawHeight * 1000 / cameraZoom
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

function drawItem(item) {
    canvasContext.lineWidth = item.lineWidth !== undefined ? toCanvasX(item.lineWidth) : 1
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
        case 'quad':
            canvasContext.beginPath()
            canvasContext.moveTo(toDrawX(item.x), toDrawY(item.y))
            canvasContext.lineTo(toDrawX(item.x2), toDrawY(item.y2))
            canvasContext.lineTo(toDrawX(item.x3), toDrawY(item.y3))
            canvasContext.lineTo(toDrawX(item.x4), toDrawY(item.y4))
            canvasContext.lineTo(toDrawX(item.x), toDrawY(item.y))
            canvasContext.stroke()
            break
        case 'tri':
            canvasContext.beginPath()
            canvasContext.moveTo(toDrawX(item.x), toDrawY(item.y))
            canvasContext.lineTo(toDrawX(item.x2), toDrawY(item.y2))
            canvasContext.lineTo(toDrawX(item.x3), toDrawY(item.y3))
            canvasContext.lineTo(toDrawX(item.x), toDrawY(item.y))
            canvasContext.stroke()
            break
    }
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
        drawItem(item)
    }
    //Draws bounding boxes
    canvasContext.lineWidth = 1
    canvasContext.strokeStyle = '#f00'
    for(let i=0; i<drawList.length; i++) {
        item = itemsList[drawList[i].id]
        let box = findBoundingBox(item)
        let quad
        if(box.type === 'AABB') {
            quad = {
                type:'quad',
                linewidth:1,
                color:'#f00',
                x:box.xMin,
                y:box.yMin,
                x2:box.xMax,
                y2:box.yMin,
                x3:box.xMax,
                y3:box.yMax,
                x4:box.xMin,
                y4:box.yMax
            }
        }
        else if(box.type === 'OBB') {
            quad = box
            quad.type = 'quad'
            quad.lineWidth = 1
            quad.color = '#00f'
        }
        
        drawItem(quad)
        
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
        canvasContext.fillText(`playerX: ${Math.floor(itemsList.player.x)}`, toCanvasX(10), toCanvasY(100))
        canvasContext.fillText(`playerY: ${Math.floor(itemsList.player.y)}`, toCanvasX(10), toCanvasY(150))
        canvasContext.fillText(`playerXVelocity: ${Math.floor(itemsList.player.xVelocity)}`, toCanvasX(10), toCanvasY(200))
        canvasContext.fillText(`playerYVelocity: ${Math.floor(itemsList.player.yVelocity)}`, toCanvasX(10), toCanvasY(250))
        // let key = ''
        // let multiIter = false
        // for(let i in keyPressed) {
        //     if(multiIter) {
        //         key += ', '
        //     }
        //     multiIter = true
        //     key += i
        // }
        // canvasContext.fillText(`Keys: ${key}`, toCanvasX(10), toCanvasY(300))
        // canvasContext.fillText(`mouseX: ${Math.floor(mouse.internalX())}`, toCanvasX(10), toCanvasY(100))
        // canvasContext.fillText(`mouseY: ${Math.floor(mouse.internalY())}`, toCanvasX(10), toCanvasY(150))
        // canvasContext.fillText(`cameraX: ${Math.floor(cameraX)}`, toCanvasX(10), toCanvasY(200))
        // canvasContext.fillText(`cameraY: ${Math.floor(cameraY)}`, toCanvasX(10), toCanvasY(250))
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

/**
  * Returns the average fps over the last 2 seconds
  *
  * @return {number} Average FPS
**/
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

/**
  * Runs FPS times per second
  *
  * @return {undefined}
**/
function frameUpdate() {
    now = Date.now()
    let elapsed = now - then
    // if(elapsed < (1000/1)-5) { //Works, just not the way I want. Also idk why I even need this
    //     window.requestAnimationFrame(frameUpdate)
    //     return
    // }
    if(drawList.length !== Object.keys(itemsList).length) {
        updateDrawList()
    }
    FPSCounter[FPSCounter.length] = {delay:1000/elapsed, time:now}
    disp1 = `Avg FPS: ${Math.floor(getAvgFPS())}`
    for(let i in itemsList) {
        if(itemsList[i].onSpawn !== undefined) {
            itemsList[i].onSpawn()
            delete itemsList[i].onSpawn
        }
        if(itemsList[i].update !== undefined) {
            itemsList[i].update(elapsed)
        }
    }
    for(let i=0; i<drawList.length-1; i++) {
        let item = itemsList[drawList[i].id]
        for(let j=i+1; j<drawList.length; j++) {
            let item2 = itemsList[drawList[j].id]
            if(collisionCheck(item, item2)) {
                if(itemsList[drawList[i].id].collision !== undefined) {
                    itemsList[drawList[i].id].collision(drawList[j].id)
                }
                if(itemsList[drawList[j].id].collision !== undefined) {
                    itemsList[drawList[j].id].collision(drawList[i].id)
                }
            }
        }
    }
    drawCanvas()
    then = now
    window.requestAnimationFrame(frameUpdate)
}

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

function createImage(input) {
    let img = new Image()
    for(let i in input) {
        img[i] = input[i]
    }
    return img
}
function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve({
            width: img.width,
            height: img.height,
        })
        img.onerror = (error) => reject(error)
        img.src = url
    })
}
function createItem(id, arguments) {
    itemsList[id] = {}
    for(let i in arguments) {
        itemsList[id][i] = arguments[i]
    }
}
function removeItem(id) {
    delete itemsList[id]
    deleteID(id)
}

// createItem('xLine', {
//     type:'line',
//     x:-10000,
//     y:0,
//     x2:10000,
//     y2:0,
//     lineDash:[15,5],
//     z:-100,
//     lineWidth:'2',
//     color:'#f00'
// })
// createItem('yLine', {
//     type:'line',
//     x:0,
//     y:-10000,
//     x2:0,
//     y2:10000,
//     lineDash:[15,5],
//     z:-100,
//     lineWidth:'2',
//     color:'#0f0'
// })
// createItem('pointer', {
//     type:'fillCircle',
//     update:function(){
//         this.x = mouse.internalX()
//         this.y = mouse.internalY()
//     },
//     radius:5,
//     startAngle:0,
//     endAngle:2*Math.PI,
//     color:'#f00',
//     fillColor:this.color,
//     z:100
// })
createItem('player', {
    type:'fillCircle',
    x:0,
    y:0,
    xVelocity:0,
    yVelocity:0,
    update:function(elapsed){
        elapsed = elapsed/10
        if(keyPressed.KeyW) {
            this.yVelocity -= 1 * elapsed
        }
        if(keyPressed.KeyA) {
            this.xVelocity -= 1 * elapsed
        }
        if(keyPressed.KeyS) {
            this.yVelocity += 1 * elapsed
        }
        if(keyPressed.KeyD) {
            this.xVelocity += 1 * elapsed
        }
        let prevXVelocity = this.xVelocity
        if(this.xVelocity > 0) {
            this.xVelocity -= .5 * elapsed
        }
        else if(this.xVelocity < 0) {
            this.xVelocity += .5 * elapsed
        }
        if((this.xVelocity > 0 && prevXVelocity < 0) || (this.xVelocity < 0 && prevXVelocity > 0)) {
            this.xVelocity = 0
        }
        // let prevYVelocity = this.yVelocity
        // if(this.yVelocity > 0) {
        //     this.yVelocity -= .3 * elapsed
        // }
        // else if(this.yVelocity < 0) {
        //     this.yVelocity += .3 * elapsed
        // }
        // if((this.yVelocity > 0 && prevYVelocity < 0) || (this.yVelocity < 0 && prevYVelocity > 0)) {
        //     this.yVelocity = 0
        // }
        this.yVelocity += .5*elapsed
        this.xVelocity = Math.max(Math.min(this.xVelocity, 15), -15)
        this.yVelocity = Math.max(Math.min(this.yVelocity, 100), -15)
        this.x += this.xVelocity * elapsed / 10
        this.y += this.yVelocity * elapsed / 10
        setCameraPos({x:this.x, y:this.y, mode:'center'})
    },
    collision:function(collider) {
        let minTrans = calcMinTranslation(findBoundingBox(this), findBoundingBox(itemsList[collider]))
        if(minTrans.axis === 'x') {
            this.x += minTrans.magnitude
            this.xVelocity = 0
        }
        else if(minTrans.axis === 'y') {
            this.y += minTrans.magnitude
            this.yVelocity = 0
        }
        // console.log(`Player collided with ${collider}`)
        //maybe shoot raycasts or smth idk. like to tell where to pop out from
        // this.x += 5
        // this.y += 5
        // if(collisionCheck(this, itemsList[collider])) {
        //     this.collision(collider)
        // }
    },
    radius:15,
    startAngle:0,
    endAngle:2*Math.PI,
    color:'#f00',
    fillColor:this.color,
    z:100
})
createItem(createID(), {
    type:'fillRect',
    x:-200,
    y:10,
    width:400,
    height:400,
    color:'#181',
    fillColor:this.color
})
createItem(createID(), {
    type:'fillRect',
    x:-200,
    y:-1000,
    width:100,
    height:1100,
    color:'#181',
    fillColor:this.color
})
createItem(createID(), {
    type:'fillRect',
    x:190,
    y:210,
    width:320,
    height:200,
    color:'#181',
    fillColor:this.color
})
createItem(createID(), {
    type:'fillRect',
    x:312.5,
    y:10,
    width:75,
    height:20,
    color:'#181',
    fillColor:this.color
})
createItem(createID(), {
    type:'fillRect',
    x:500,
    y:10,
    width:600,
    height:400,
    color:'#181',
    fillColor:this.color
})
createItem('theline', {
    type:'line',
    x:100,
    y:-100,
    update:function(){
        this.x2 = mouse.internalX()
        this.y2 = mouse.internalY()
    },
    color:'#fff',
    lineWidth: 5
})
// createItem('image', {
//     type:'image',
//     image:createImage({src:'TestImage.png'}),
//     z:105,
//     onSpawn:async function() {
//         getImageDimensions('TestImage.png').then((value) => {
//             let ratio = value.width/value.height
//             // this.width = 500
//             // this.height = this.width / ratio
//             this.height = 400
//             this.width = this.height * ratio
//             this.x = -.5 * this.width
//             this.y = itemsList.player.radius
//         })
//     }
// })
// for(let i=0; i<500; i++) {
//     createItem(createID(), {
//         type:'fillCircle',
//         z:105,
//         x:(Math.random()*2000)-1000,
//         y:(Math.random()*2000)-1000,
//         radius:5,
//         startAngle:0,
//         endAngle:2*Math.PI
//     }) 
// }

updateCanvasSize()
window.addEventListener('resize', updateCanvasSize)
frameUpdate()



//Collision relsolver that will do stuff depending if they are static, or not static




// function roundedRect(ctx, x, y, width, height, radius) {
//     ctx.beginPath();
//     ctx.moveTo(x, y + radius);
//     ctx.arcTo(x, y + height, x + radius, y + height, radius);
//     ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
//     ctx.arcTo(x + width, y, x + width - radius, y, radius);
//     ctx.arcTo(x, y, x, y + radius, radius);
//     ctx.stroke();
//   }