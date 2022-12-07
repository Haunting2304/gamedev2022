var entities = {}
var fps = 30
var keyPressed = {}
const healthDefault = 20
var health = healthDefault
var damage = 1
function updateHealth() {
    document.getElementById('health').innerHTML = `HP = ${health}`
}
updateHealth()


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
        xVelocity : -15,
        yVelocity : 0,
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
function checkDefault(param, ifDefault) {
    return param !== undefined ? param : ifDefault
}
function createEntity(id, params) {
    let div = document.createElement('div')
    entities[id] = {
        object : div,
        health : 10,
        x : 500,
        y : 110,
        xVelocity : 0,
        yVelocity : 0,
        height :  80,
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
    div.style.backgroundImage = "url(myImage02.jpg)"
    div.style.backgroundSize = 'contain'
    div.style.height = `${entities[id].height}px`
    div.style.width = `${entities[id].width}px`
    document.querySelector('body').appendChild(div)
}
createEntity('first', {
    bulletTimerDefault : 30,
    bulletTimer : 30,
    bulletCount : 0,
    team : ['red'],
    update : function() {
        if(this.y < 200) {
            this.yVelocity++
        }
        if(this.y > 500) {
            this.yVelocity--
        }
        if(this.bulletTimer <= 0) {
            spawnBullet(`${this.object.id}Bullet${this.bulletCount}`, this.x, this.y + .5 * this.height, {team:['red']})
            this.bulletCount++
            this.bulletTimer = this.bulletTimerDefault
        }
        else {
            this.bulletTimer--
        }
    }
})
createEntity('player', {
    damage:5,
    x:100,
    y:120,
    health:20,
    update : function() {
        if(keyPressed[87]) { //W
            this.yVelocity += 1
        }
        if(keyPressed[83]) { //S
            this.yVelocity -= 1
        }
        if(keyPressed[65]) { //A
            this.xVelocity -= 1
        }
        if(keyPressed[68]) { //D
            this.xVelocity += 1
        }
    }

})
var mainLoop = setInterval(() => {
    for(let i in entities) {
        entities[i].collisionChecked = {}
    }
    for(let i in entities) {
        entities[i].object.style.left = `${entities[i].x}px`
        entities[i].object.style.bottom = `${entities[i].y}px`
        entities[i].x += entities[i].xVelocity
        entities[i].y += entities[i].yVelocity
        for(let property in entities) {
            if(entities[i].object !== entities[property].object) { //Stops collisions with itself
                if(entities[i].collisionChecked[property] !== true) { //Stops collisions if already collided this frame
                    if(myHitOther(entities[i].object, entities[property].object)) {
                        console.log(`${i} collided with ${property}`)
                        let sameTeam = false
                        for(let iter = 0; iter<entities[i].team.length; iter++) {
                            if(entities[i].team !== undefined && entities[property].team !== undefined) {
                                if(entities[property].team.indexOf(entities[i].team[iter]) !== undefined) {
                                    sameTeam = true
                                }
                            }
                        }
                        if(sameTeam === false) {
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
        if(entities[i].shootBullet !== undefined) {
            entities[i].shootBullet()
        }
        if(entities[i].lifeTime != undefined) {
            entities[i].lifeTime--
        }
        if(entities[i].health <= 0 || entities[i].lifeTime <= 0) {
            entities[i].object.remove()
            delete entities[i]
        }
        if(health < 0) {
            document.getElementById('output').innerHTML = 'You lose'
            document.getElementById('myImg01').style.left = '20px'
            document.getElementById('myImg01').style.bottom = '130px'
            health = healthDefault
        }
    }
    updateHealth()
}, 1000 / fps);