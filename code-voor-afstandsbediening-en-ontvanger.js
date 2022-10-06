let recievedNumber = 0
let ownChannel = 1
let sendFeedback = false
let channel = 1
let changeChannel = 0
let changeOwnChannel = 0
let switchRightFeedBack = 0
let switchLeftFeedBack = 0
let sendButtonPressed = 0
let triggerCode = 0
let lightsOn = false
const lightsOffCountDownAmount = 1000
const lightsBackOnSensitivity = 400
let lightsOffTimer = lightsOffCountDownAmount
lightsOff()

/* Lijst van signalen:
1 = verzender zend signaal 1
2 = verzender zend signaal 2
3 = verzender zend signaal 3
11 = ontvanger zendt signaal 1 naar verzender als verbinding
22 = ontvanger zendt signaal 2 naar verzender als verbinding
33 = ontvanger zendt signaal 3 naar verzender als verbinding
4 = ontvanger zendt signaal 1 naar verzender als confirmatie
5 = ontvanger zendt signaal 1 naar verzender als confirmatie
6 = ontvanger zendt signaal 1 naar verzender als confirmatie
*/

// Hier die code die de ontvanger uit moet voeren.
function recieverCode() {
    // Hier de code die de ontvanger uitvoert.
}

function lightsOff() {
    // zet al het licht uit
    light.setAll(0)
    crickit.setPixelColor(color.rgb(0, 0, 0))
    crickit.signal1.digitalWrite(false)
    crickit.signal2.digitalWrite(false)
    crickit.signal3.digitalWrite(false)
}

function triggerRecieverCode() {
    // de code die samen met de recieverCode wordt geexecute.
    sendFeedback = true
    turnLightsOn()
    crickit.setPixelColor(color.rgb(255, 255, 0))
    crickit.signal1.digitalWrite(false)
    crickit.signal2.digitalWrite(false)
    crickit.signal3.digitalWrite(false)
    light.setAll(color.rgb(255, 255, 0))
    recieverCode()
    loops.pause(100)
    sendFeedback = false
    lightsOff()
}

function channelConnection() {
    // wordt geexecute als het rode lampje op de afstandsbeding moet gaan branden
    pins.A6.digitalWrite(true)
    console.log(`Connectie met ander apparaat op kanaal ${channel}`)
    pause(10)
    pins.A6.digitalWrite(false)
}

function confirmRecieving() {
    // wordt geexecute als het blauwe lampje op de afstandsbeding moet gaan branden
    pins.A7.digitalWrite(true)
    console.log(`Apparaat op kanaal ${channel} heeft ontvangst geconfirmd.`)
    pause(100)
    pins.A7.digitalWrite(false)
}

function turnLightsOn() {
    lightsOn = true
    //lightsOffTimer = lightsOffCountDownAmount
    console.log(`De indicatielampjes gaan uit na ${lightsOffTimer / 100} seconden (begonnen met aftellen)`)
}

// Switch feedback
loops.forever(function () {
    if (input.switchRight()) {
        switchRightFeedBack++
        switchLeftFeedBack = 0
        if (switchRightFeedBack === 1) {
            turnLightsOn()
            light.showRing("red orange red orange red orange red orange red orange")
            console.log(`Playground staat nu in de ontvanger modus.`)
            music.jumpUp.playUntilDone()
            lightsOff()
            pins.A3.setPull(PinPullMode.PullNone)
            pins.A2.setPull(PinPullMode.PullNone)
        }
    } else {
        switchRightFeedBack = 0
        switchLeftFeedBack++
        if (switchLeftFeedBack === 1) {
            turnLightsOn()
            light.showRing("blue purple blue purple blue purple blue purple blue purple")
            console.log(`Playground staat nu in de verzender modus.`)
            music.jumpDown.playUntilDone()
            lightsOff()
            pins.A3.setPull(PinPullMode.PullDown)
            pins.A2.setPull(PinPullMode.PullDown)
        }
    }
})

//Knopje B triggert ook de code
input.buttonB.onEvent(ButtonEvent.Click, function () {
    if (input.switchRight()) {
        triggerRecieverCode()
        console.log(`Knop B ingedrukt & recieverCode uitgevoerd`)
    }
})

loops.forever(function () {
    if (input.switchRight() && pins.A3.digitalRead()) {
        triggerCode++
    } else {
        triggerCode = 0
    }
    if (triggerCode === 2 && input.switchRight()) {
        triggerRecieverCode()
        console.log(`Externe knop ingedrukt & recieverCode uitgevoerd`)
    }
})

// Deze code hoort bovenaan
loops.forever(function () {
    if ((input.buttonA.isPressed() == true || pins.A2.digitalRead() || lightsOn == true) && sendFeedback == false && input.switchRight()) {
        if (ownChannel === 1) {
            turnLightsOn()
            crickit.setPixelColor(color.rgb(255, 0, 0))
            crickit.signal1.digitalWrite(true)
            crickit.signal2.digitalWrite(false)
            crickit.signal3.digitalWrite(false)
        }
        if (ownChannel === 2) {
            turnLightsOn()
            crickit.setPixelColor(color.rgb(0, 255, 0))
            crickit.signal1.digitalWrite(false)
            crickit.signal2.digitalWrite(true)
            crickit.signal3.digitalWrite(false)
        }
        if (ownChannel === 3) {
            turnLightsOn()
            crickit.setPixelColor(color.rgb(0, 0, 255))
            crickit.signal1.digitalWrite(false)
            crickit.signal2.digitalWrite(false)
            crickit.signal3.digitalWrite(true)
        }
    }
})

//Zet alle lampjes op de ontvanger uit na 10 seconden.
loops.forever(function () {
    if (input.switchRight()) {
        if (lightsOn) {
            for (let i = 0; i < lightsOffCountDownAmount; i++) {
                lightsOffTimer--
                pause(10)
                if (lightsOffCountDownAmount / 2 == lightsOffTimer) {
                    console.log(`De indicatielampjes gaan uit na ${lightsOffTimer / 100} seconden (op de helft)`)
                }
                if (lightsOffCountDownAmount / 4 == lightsOffTimer) {
                    console.log(`De indicatielampjes gaan uit na ${lightsOffTimer / 100} seconden (op een kwart)`)
                }
            }
            lightsOn = false
        }
        if (lightsOffTimer <= 0) {
            lightsOff()
            lightsOffTimer = lightsOffCountDownAmount
            console.log(`De indicatielampjes zijn uitgezet.`)
        }
        if (input.acceleration(Dimension.X) >= lightsBackOnSensitivity || input.acceleration(Dimension.Y) >= lightsBackOnSensitivity || input.acceleration(Dimension.Z) >= lightsBackOnSensitivity) {
            turnLightsOn()
        }
    }
})


//Ontvanger code, ontvanger heeft de switch naar rechts
input.buttonA.onEvent(ButtonEvent.Click, function () {
    if (input.switchRight()) {
        ownChannel++
        if (ownChannel >= 4) {
            ownChannel = 1
        }
        console.log(`Ontvangst kanaal verandered naar ${ownChannel} via knop A`)
    }
})

loops.forever(function () {
    if (input.switchRight() && pins.A2.digitalRead()) {
        changeOwnChannel++
    } else {
        changeOwnChannel = 0
    }
    if (changeOwnChannel === 2 && input.switchRight()) {
        ownChannel++
        if (ownChannel >= 4) {
            ownChannel = 1
        }
        console.log(`Ontvangst kanaal verandered naar ${ownChannel} via externe knop`)
    }
})


// send feedback
loops.forever(function () {
    if (sendFeedback == false && input.switchRight()) {
        if (ownChannel === 1) {
            network.infraredSendNumber(11)
        }
        if (ownChannel === 2) {
            network.infraredSendNumber(22)
        }
        if (ownChannel === 3) {
            network.infraredSendNumber(33)
        }
    }
})

// network.onInfraredReceivedNumber kan maar een keer gebruikt worden.
network.onInfraredReceivedNumber(function (num) {
    if (ownChannel == 1 && input.switchRight()) {
        if (num == 1) {
            network.infraredSendNumber(4)
            triggerRecieverCode()
            console.log(`Infrarood signaal 1 (4) ontvangen & recieverCode uitgevoerd`)

        }
    }
    if (ownChannel == 2 && input.switchRight()) {
        if (num == 2) {
            network.infraredSendNumber(5)
            triggerRecieverCode()
            console.log(`Infrarood signaal 2 (5) ontvangen & recieverCode uitgevoerd`)
        }
    }
    if (ownChannel === 3 && input.switchRight()) {
        if (num === 3) {
            network.infraredSendNumber(6)
            triggerRecieverCode()
            console.log(`Infrarood signaal 3 (6) ontvangen & recieverCode uitgevoerd`)
        }
    }

    //Verzender code, verzender heeft de switch naar links

    if (channel == 1 && input.switchRight() == false) {
        if (num == 11) {
            channelConnection()
        }
    }
    if (channel == 2 && input.switchRight() == false) {
        if (num == 22) {
            channelConnection()
        }
    }
    if (channel == 3 && input.switchRight() == false) {
        if (num == 33) {
            channelConnection()
        }
    }
    // Ontvangst lampje
    if (channel == 1 && input.switchRight() == false) {
        if (num == 4) {
            confirmRecieving()
        }
    }
    if (channel == 2 && input.switchRight() == false) {
        if (num == 5) {
            confirmRecieving()
        }
    }
    if (channel == 3 && input.switchRight() == false) {
        if (num == 6) {
            confirmRecieving()
        }
    }

})

// Knopje om van channel te veranderen
loops.forever(function () {
    if (input.switchRight() == false) {
        if (pins.A2.digitalRead()) {
            changeChannel++
        } else {
            changeChannel = 0
        }
    }
    if (changeChannel === 2 && input.switchRight() == false) {
        channel++
        if (channel >= 4 || channel <= 0) {
            channel = 1
        }
        console.log(`Kanaal veranderd naar apparaat ${channel}`)
    }
})

// Servo laat zien welk kanaal geselecteerd is
loops.forever(function () {
    if (channel === 1 && input.switchRight() == false) {
        crickit.servo1.setAngle(180)
    }
    if (channel === 2 && input.switchRight() == false) {
        crickit.servo1.setAngle(90)
    }
    if (channel === 3 && input.switchRight() == false) {
        crickit.servo1.setAngle(0)
    }
})

//ALs het verzendt knopje ingedrukt word moet hij maar een keer code esecuten.
loops.forever(function () {
    if (pins.A3.digitalRead() && input.switchRight() == false) {
        sendButtonPressed++
    } else {
        sendButtonPressed = 0
    }
})


// Knopje om de afstandbediening te triggeren
loops.forever(function () {
    if (sendButtonPressed === 1 && input.switchRight() == false) {
        console.log(`Verzoek verzonden naar apparaat op kanaal ${channel}`)
        if (channel === 1) {
            light.setAll(color.rgb(255, 0, 0))
            network.infraredSendNumber(1)
            light.clear()
        }
        if (channel === 2) {
            light.setAll(color.rgb(0, 255, 0))
            network.infraredSendNumber(2)
            light.clear()
        }
        if (channel === 3) {
            light.setAll(color.rgb(0, 0, 255))
            network.infraredSendNumber(3)
            light.clear()
        }
    }
})

