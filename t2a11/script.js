var entities = {}
var fps = 30
var keyPressed = {}
var lastCall
var currentCall = Date.now()
var redirectTimeout
var curLevel = 0

function myHitOther(my1,my2){
    var m1 = getComputedStyle(my1)
    var m2 = getComputedStyle(my2)
    left1   = parseInt(m1.left)
    right1  = left1 + parseInt(m1.width)
    bottom1 = parseInt(m1.bottom)  
    top1 = bottom1 + parseInt(m1.height)
    left2   = parseInt(m2.left)
    right2  = left2 + parseInt(m2.width)
    bottom2    = parseInt(m2.bottom)   
    top2 = bottom2 + parseInt(m2.height)
    if ((right1  >=  left2  ) &&
        (bottom1 <=  top2   ) &&
        (left1   <=  right2 ) &&
        (top1    >=  bottom2)){
        return true
    }
    else {
        return false
    }
}

document.addEventListener("keydown", (e)=>{
    e = e || window.event;
    keyPressed[e.keyCode] = true
});

document.addEventListener("keyup", (e)=>{
    e = e || window.event;
    delete keyPressed[e.keyCode]
});

window.addEventListener("blur", ()=>{
    keyPressed = {}
});

function spawnBullet(id, x, y, params) {
    let div = document.createElement('div')
    entities[id] = {
        object : div,
        x : x,
        y : y,
        xVelocity : -500,
        yVelocity : 0,
        slowDown: 0,
        height : 10,
        width : 10,
        damage : 5,
        lifeTime : 100
    }
    for(let property in params) {
        entities[id][property] = params[property]
    }
    div.id = id
    div.style.position = 'absolute'
    div.style.zIndex = '-1'
    div.style.left = `${entities[id].x}px`
    div.style.bottom = `${entities[id].y}px`
    div.style.backgroundColor = '#ff2222'
    div.style.backgroundSize = 'contain'
    div.style.height = `${entities[id].height}px`
    div.style.width = `${entities[id].width}px`
    document.querySelector('body').appendChild(div)
}
function createEntity(id, params, img) {
    let div = document.createElement('div')
    entities[id] = {
        object : div,
        x : 0,
        y : 0,
        xVelocity : 0,
        yVelocity : 0,
        yVelocityCap : 300,
        xVelocityCap : 300,
        slowDown : 25,
        height : 80,
        width : 100,
        damage : 0
    }
    for(let property in params) {
        entities[id][property] = params[property]
    }
    div.id = id
    div.style.position = 'absolute'
    div.style.zIndex = '-1'
    div.style.left = `${entities[id].x}px`
    div.style.bottom = `${entities[id].y}px`
    div.style.backgroundColor = 'blue'
    div.style.backgroundImage = `url(${img})`
    div.style.backgroundSize = 'contain'
    div.style.height = `${entities[id].height}px`
    div.style.width = `${entities[id].width}px`
    document.querySelector('body').appendChild(div)
}

function winLevel() {
    document.getElementById('output').innerHTML = 'You Win!'
    if(redirectTimeout === undefined) {
        redirectTimeout = setTimeout(()=>{
            curLevel++
            loadLevel(curLevel)
            redirectTimeout = undefined
        },1000)
    }
}

function loseLevel() {
    document.getElementById('output').innerHTML = 'You died.'
    if(redirectTimeout === undefined) {
        redirectTimeout = setTimeout(() => {
            loadLevel(curLevel)
            redirectTimeout = undefined
        },1000)
    }
}
function loadLevel(id) {
    for(let i in entities) {
        entities[i].object.remove()
        delete entities[i]
        document.getElementById('output').innerHTML = ''
    }
    let width = Math.max(document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth)
    switch(id) {
        case 0:
            
            createEntity('first', {
                bulletTimerDefault : 30,
                bulletTimer : 30,
                bulletCount : 0,
                health : 10,
                x : 1000,
                y : 110,
                team : ['red'],
                slowDown : 0,
                update : function() {
                    let body = document.body
                    let html = document.documentElement
                    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
                    if(this.y > height - this.height - 55) {
                        yAccel = -30
                    }
                    else if(this.y < 50) {
                        yAccel = 30
                    }
                    else {
                        yAccel = 0
                        if(this.yVelocity < 10) {
                            if(this.yVelocity > 0) {
                                this.yVelocity = 300
                            }
                            else {
                                this.yVelocity = -300
                            }
                        }
                    }
                    this.yVelocity += yAccel
                    
                    if(this.bulletTimer <= 0) {
                        spawnBullet(`${this.object.id}Bullet${this.bulletCount}`, this.x, this.y + .5 * this.height, {team:['red']})
                        this.bulletCount++
                        this.bulletTimer = this.bulletTimerDefault
                    }
                    else {
                        this.bulletTimer--
                    }
                }
            }, 'myImage02.jpg')
            
            createEntity('player', {
                damage:5,
                health : 10,
                x:100,
                y:350,
                health:10,
                update : function() {
                    let accel = 50
                    if(keyPressed[87]) { //W
                        this.yVelocity += accel
                    }
                    if(keyPressed[83]) { //S
                        this.yVelocity -= accel
                    }
                    if(keyPressed[65]) { //A
                        this.xVelocity -= accel
                    }
                    if(keyPressed[68]) { //D
                        this.xVelocity += accel
                    }
                },
                onDeath : function() {
                    loseLevel()
                }
            }, 'myImage01.jpg')
            
            createEntity('win', {
                x:0,
                y:0,
                height:1000,
                width:100,
                update : function() {
                    if(entities['player'] !== undefined) {
                        if(myHitOther(entities['player'].object, this.object)) {
                            winLevel()
                        }
                    }
                }
            },'win.jpg')
            entities.first.x = 2/3 *(width - entities.first.width)
            entities.win.x = width - entities.win.width
            break
        case 1:
            createEntity('first', {
                health : 50,
                x : 1000,
                y : 110,
                damage: 10,
                team : ['red'],
                slowDown : 0,
                update : function() {
                    let body = document.body
                    let html = document.documentElement
                    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
                    let width = Math.max(body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)
                    if(this.yAccel === undefined) {
                        this.yAccel = 30
                    }
                    if(this.y > height - this.height - 55) {
                        this.yAccel = -30
                    }
                    else if(this.y < 50) {
                        this.yAccel = 30
                    }
                    
                    if(this.xAccel === undefined) {
                        this.xAccel = 30
                    }
                    if(this.x > width - this.width - 200) {
                        this.xAccel = -30
                    }
                    else if(this.x < 400) {
                        this.xAccel = 30
                    }
                    this.yVelocity += this.yAccel
                    this.xVelocity += this.xAccel
                }
            }, 'myImage02.jpg')
            createEntity('second', {
                health : 50,
                x : 500,
                y : 50,
                damage: 10,
                team : ['red'],
                slowDown : 0,
                update : function() {
                    let body = document.body
                    let html = document.documentElement
                    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
                    let width = Math.max(body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)
                    if(this.yAccel === undefined) {
                        this.yAccel = -30
                    }
                    if(this.y > height - this.height - 55) {
                        this.yAccel = -30
                    }
                    else if(this.y < 50) {
                        this.yAccel = 30
                    }
                    
                    if(this.xAccel === undefined) {
                        this.xAccel = 30
                    }
                    if(this.x > width - this.width - 200) {
                        this.xAccel = -30
                    }
                    else if(this.x < 400) {
                        this.xAccel = 30
                    }
                    this.yVelocity += this.yAccel
                    this.xVelocity += this.xAccel
                }
            }, 'myImage02.jpg')
            createEntity('third', {
                health : 50,
                x : 750,
                y : 500,
                damage: 10,
                team : ['red'],
                slowDown : 0,
                update : function() {
                    let body = document.body
                    let html = document.documentElement
                    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
                    let width = Math.max(body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth)
                    if(this.yAccel === undefined) {
                        this.yAccel = 30
                    }
                    if(this.y > height - this.height - 55) {
                        this.yAccel = -30
                    }
                    else if(this.y < 50) {
                        this.yAccel = 30
                    }
                    
                    if(this.xAccel === undefined) {
                        this.xAccel = -30
                    }
                    if(this.x > width - this.width - 200) {
                        this.xAccel = -30
                    }
                    else if(this.x < 400) {
                        this.xAccel = 30
                    }
                    this.yVelocity += this.yAccel
                    this.xVelocity += this.xAccel
                }
            }, 'myImage02.jpg')
            
            createEntity('player', {
                damage:5,
                health : 10,
                x:100,
                y:350,
                health:10,
                update : function() {
                    let accel = 50
                    if(keyPressed[87]) { //W
                        this.yVelocity += accel
                    }
                    if(keyPressed[83]) { //S
                        this.yVelocity -= accel
                    }
                    if(keyPressed[65]) { //A
                        this.xVelocity -= accel
                    }
                    if(keyPressed[68]) { //D
                        this.xVelocity += accel
                    }
                },
                onDeath : function() {
                    loseLevel()
                }
            }, 'myImage01.jpg')
            
            createEntity('win', {
                x:0,
                y:0,
                height:1000,
                width:100,
                update : function() {
                    if(entities['player'] !== undefined) {
                        if(myHitOther(entities['player'].object, this.object)) {
                            winLevel()
                        }
                    }
                },
            }, 'win.jpg')
            entities.first.x = 1/3 *(width - entities.first.width)
            entities.second.x = 2/3 *(width - entities.second.width)
            entities.third.x = 1.5/3 *(width - entities.third.width)
            entities.win.x = width - entities.win.width
            break
        case 2:
            createEntity('first', {
                bulletTimerDefault : 60,
                bulletTimer : 40,
                bulletCount : 0,
                health : 10,
                x : 1000,
                y : 300,
                damage: 0,
                team : ['red'],
                slowDown : 0,
                update : function() {
                    let thisCenterX = this.x + .5 * this.width
                    let thisCenterY = this.y + .5 * this.height
                    let xDiff = (entities['player'].x + .5 * entities['player'].width) - thisCenterX
                    let yDiff = (entities['player'].y + .5 * entities['player'].height) - thisCenterY
                    if(this.bulletTimer <= 0) {
                        let fullSpeed = 1500
                        let ratioTotal = Math.abs(xDiff) + Math.abs(yDiff)
                        let ratioX = xDiff / ratioTotal
                        let ratioY = yDiff / ratioTotal
                        let bulletXVelocity = fullSpeed * ratioX
                        let bulletYVelocity = fullSpeed * ratioY
                        spawnBullet(`${this.object.id}Bullet${this.bulletCount}`, thisCenterX, thisCenterY, {team:['red'], xVelocity:bulletXVelocity, yVelocity:bulletYVelocity})
                        this.bulletCount++
                        this.bulletTimer = this.bulletTimerDefault
                    }
                    else {
                        this.bulletTimer--
                    }
                }
            }, 'myImage02.jpg')
            
            createEntity('player', {
                damage:5,
                x:100,
                y:350,
                health:10,
                update : function() {
                    let accel = 50
                    if(keyPressed[87]) { //W
                        this.yVelocity += accel
                    }
                    if(keyPressed[83]) { //S
                        this.yVelocity -= accel
                    }
                    if(keyPressed[65]) { //A
                        this.xVelocity -= accel
                    }
                    if(keyPressed[68]) { //D
                        this.xVelocity += accel
                    }
                    if(entities['first'] === undefined) {
                        winLevel()
                    }
                },
                onDeath : function() {
                    loseLevel()
                }
            }, 'myImage01.jpg')
            entities.first.x = 2/3 *(width - entities.first.width)
            break
    }
    curLevel = id
}

var mainLoop = setInterval(() => {
    lastCall = currentCall
    currentCall = Date.now()
    let callDiff = currentCall - lastCall
    let callDiffRate = callDiff / 1000
    for(let i in entities) {
        entities[i].collisionChecked = {}
    }
    for(let i in entities) {
        entities[i].object.style.left = `${entities[i].x}px`
        entities[i].object.style.bottom = `${entities[i].y}px`
        if(entities[i].xVelocity > 0) {
            entities[i].xVelocity -= entities[i].slowDown
            if(entities[i].xVelocity > entities[i].xVelocityCap) {
                entities[i].xVelocity = entities[i].xVelocityCap
            }
        }
        if(entities[i].xVelocity < 0) {
            entities[i].xVelocity += entities[i].slowDown
            if(entities[i].xVelocity < -entities[i].xVelocityCap) {
                entities[i].xVelocity = -entities[i].xVelocityCap
            }
        }
        if(entities[i].yVelocity > 0) {
            entities[i].yVelocity -= entities[i].slowDown
            if(entities[i].yVelocity > entities[i].yVelocityCap) {
                entities[i].yVelocity = entities[i].yVelocityCap
            }
        }
        if(entities[i].yVelocity < 0) {
            entities[i].yVelocity += entities[i].slowDown
            if(entities[i].yVelocity < -entities[i].yVelocityCap) {
                entities[i].yVelocity = -entities[i].yVelocityCap
            }
        }
        entities[i].x += entities[i].xVelocity * callDiffRate
        entities[i].y += entities[i].yVelocity * callDiffRate
        for(let property in entities) {
            if(entities[i].object !== entities[property].object) { //Stops collisions with itself
                if(entities[i].collisionChecked[property] !== true) { //Stops collisions if already collided this frame
                    if(myHitOther(entities[i].object, entities[property].object)) {
                        let sameTeam = false
                        if(entities[i].team !== undefined && entities[property].team !== undefined) {
                            for(let iter = 0; iter<entities[i].team.length; iter++) {
                                if(entities[property].team.indexOf(entities[i].team[iter]) !== undefined) {
                                    sameTeam = true
                                }
                            }
                        }
                        if(sameTeam === false) {
                            console.log(`${i} and ${property} damaged are colliding on different teams`)
                            if(entities[i].health !== undefined) {
                                entities[i].health -= entities[property].damage
                            }
                            if(entities[property].health !== undefined) {
                                entities[property].health -= entities[i].damage
                            }
                        }
                    }
                }
            }
            entities[i].collisionChecked[property] = true
            if(entities[property].collisionChecked === undefined) {
                entities[property].collisionChecked = {}
            }
            entities[property].collisionChecked[i] = true
        }
        if(entities[i].update !== undefined) {
            entities[i].update()
        }
        if(entities[i].lifeTime != undefined) {
            entities[i].lifeTime--
        }
        if(entities[i].health <= 0 || entities[i].lifeTime <= 0) {
            if(entities[i].onDeath !== undefined) {
                entities[i].onDeath()
            }   
            entities[i].object.remove()
            if(i !== 'player') {
                delete entities[i]
            }
            else {
                delete entities[i].update
            }
            
        }
    }
}, 1000 / fps)
loadLevel(0)