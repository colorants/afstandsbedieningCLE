let strip = light.createStrip(pins.A1, 10)
strip.setBrightness(0)
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
let potentiometer = 0
let recievedPotentiometer = 0
let currentBrightness = 0
let externalLedBrightness = 255
let externalLedNewBrightness = 0
const externalLedMaxBrightness = 255
const externalLedMinBrightness = 10

lightsOff()


/* Lijst van signalen:
1 = verzender zend signaal num + 1000
2 = verzender zend signaal num + 2000
3 = verzender zend signaal num + 3000
11 = ontvanger zendt signaal 1 naar verzender als verbinding
22 = ontvanger zendt signaal 2 naar verzender als verbinding
33 = ontvanger zendt signaal 3 naar verzender als verbinding
4 = ontvanger zendt signaal 4 naar verzender als confirmatie
5 = ontvanger zendt signaal 5 naar verzender als confirmatie
6 = ontvanger zendt signaal 6 naar verzender als confirmatie
*/



let ledsOn = false
// Hier die code die de ontvanger uit moet voeren.
function recieverCode() {
    console.log(`Opdracht ontvangen & code uitgevoerd.`)
    if (ledsOn == false) {
        ledsOn = true
        console.log(`Het licht staat nu aan met de waarde ${recievedPotentiometer}`)
    } else {
        ledsOn = false
        console.log(`Het licht staat nu uit.`)
    }

}

let ringCurrentBrightness = 0
let ringNewBrightness = 0
const ringLedMaxBrightness = 255
const ringLedMinBrightness = 0

// light animation
loops.forever(function () {
    console.log(ringNewBrightness)
    if (input.switchRight()) {
        if (ledsOn == true) {
            ringCurrentBrightness = recievedPotentiometer
        }
        if (ringCurrentBrightness > ringLedMinBrightness) {
            ringCurrentBrightness--
        }
        if (ledsOn == true && ringNewBrightness > ringCurrentBrightness && ringNewBrightness > 25) {
            ringNewBrightness = ringNewBrightness - 5
        }
        if (ledsOn == false && ringNewBrightness > ringCurrentBrightness) {
            ringNewBrightness = ringNewBrightness - 20
        }
        if (ringNewBrightness < ringCurrentBrightness && ringNewBrightness <= 250) {
            ringNewBrightness = ringNewBrightness + 5
        }
        if (ledsOn == true) {
            light.setBrightness(ringNewBrightness)
            light.setAll(color.rgb(ringNewBrightness, ringNewBrightness, ringNewBrightness))
        }
        if (ledsOn == false) {
            ringCurrentBrightness = 0
            light.setBrightness(ringNewBrightness)
            light.setAll(color.rgb(ringNewBrightness, ringNewBrightness, ringNewBrightness))
        }
    }
})


function lightsOff() {
    // zet al het licht uit
    light.setAll(0)
    strip.setAll(color.rgb(0, 0, 0))
}

function triggerRecieverCode() {
    // de code die samen met de recieverCode wordt geexecute.
    externalLedBrightness = externalLedMaxBrightness
    sendFeedback = true
    recieverCode()
    loops.pause(1000)
    sendFeedback = false
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

// Switch feedback
loops.forever(function () {
    if (input.switchRight()) {
        switchRightFeedBack++
        switchLeftFeedBack = 0
        if (switchRightFeedBack === 1) {
            //crickit.servo1.setAngle(90)
            light.showRing("red orange red orange red orange red orange red orange")
            console.log(`Playground staat nu in de ontvanger modus.`)
            music.jumpUp.playUntilDone()
            lightsOff()
            pins.A3.setPull(PinPullMode.PullDown)
            pins.A2.setPull(PinPullMode.PullDown)
            externalLedNewBrightness = externalLedMinBrightness
            strip.setBrightness(255)
        }
    } else {
        //crickit.servo1.setAngle(90)
        switchLeftFeedBack++
        if (switchLeftFeedBack === 1) {
            light.showRing("blue purple blue purple blue purple blue purple blue purple")
            console.log(`Playground staat nu in de verzender modus.`)
            music.jumpDown.playUntilDone()
            lightsOff()
            pins.A3.setPull(PinPullMode.PullDown)
            pins.A2.setPull(PinPullMode.PullDown)
            externalLedNewBrightness = externalLedMinBrightness
            strip.setBrightness(255)
            switchRightFeedBack = 0
        }
    }
})

// Dimmen van external lampje als er geen knop is ingedrukt
loops.forever(function () {
    if (externalLedBrightness > externalLedMinBrightness) {
        externalLedBrightness--
    }
    if (externalLedNewBrightness > externalLedBrightness) {
        externalLedNewBrightness--
    }
    if (externalLedNewBrightness < externalLedBrightness) {
        externalLedNewBrightness = externalLedNewBrightness + 10
    }
    if (sendFeedback == true) {
        strip.setAll(color.rgb(externalLedNewBrightness, externalLedNewBrightness, 0))

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
        externalLedBrightness = externalLedMaxBrightness
        console.log(`Externe knop ingedrukt & recieverCode uitgevoerd`)
    }
})

// Deze code hoort bovenaan
loops.forever(function () {
    if ((sendFeedback == false && input.switchRight())) {
        if (ownChannel === 1) {
            strip.setAll(color.rgb(externalLedNewBrightness, 0, 0))
        }
        if (ownChannel === 2) {
            strip.setAll(color.rgb(0, externalLedNewBrightness, 0))

        }
        if (ownChannel === 3) {
            strip.setAll(color.rgb(0, 0, externalLedNewBrightness))
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
        externalLedBrightness = externalLedMaxBrightness
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
        externalLedBrightness = externalLedMaxBrightness
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
    // recieved potentiometer
    if (input.switchRight() && ownChannel == 1 && num > 1000 && num < 2000) {
        recievedPotentiometer = num - 1000
        console.log(`recievedPotentiometer aangepast naar ${recievedPotentiometer} op kanaal 1`)
    }
    if (input.switchRight() && ownChannel == 2 && num > 2000 && num < 3000) {
        recievedPotentiometer = num - 2000
        console.log(`recievedPotentiometer aangepast naar ${recievedPotentiometer} op kanaal 2`)
    }
    if (input.switchRight() && ownChannel == 3 && num > 3000 && num < 4000) {
        recievedPotentiometer = num - 3000
        console.log(`recievedPotentiometer aangepast naar ${recievedPotentiometer} op kanaal 3`)
    }
    if (ownChannel == 1 && input.switchRight()) {
        if (num == 1) {
            network.infraredSendNumber(4)
            triggerRecieverCode()
            console.log(`Infrarood signaal 1 (${num}) ontvangen & recieverCode uitgevoerd`)

        }
    }
    if (ownChannel == 2 && input.switchRight()) {
        if (num == 2) {
            network.infraredSendNumber(5)
            triggerRecieverCode()
            console.log(`Infrarood signaal 2 (${num}) ontvangen & recieverCode uitgevoerd`)
        }
    }
    if (ownChannel === 3 && input.switchRight()) {
        if (num == 3) {
            network.infraredSendNumber(6)
            triggerRecieverCode()
            console.log(`Infrarood signaal 3 (${num}) ontvangen & recieverCode uitgevoerd`)
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

//Stuurt altijd de waarde van de potentiometer
loops.forever(function () {
    if (input.switchRight() == false) {
        if (channel == 1) {
            potentiometer = Math.round(1000 + (255 - ((crickit.signal1.analogRead() / 3.95) - 6)))
        }
        if (channel == 2) {
            potentiometer = Math.round(2000 + (255 - ((crickit.signal1.analogRead() / 3.95) - 6)))
        }
        if (channel == 3) {
            potentiometer = Math.round(3000 + (255 - ((crickit.signal1.analogRead() / 3.95) - 6)))
        }
        network.infraredSendNumber(potentiometer)
        loops.pause(500)
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

