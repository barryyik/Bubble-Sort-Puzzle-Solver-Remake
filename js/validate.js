/* Validate Input */

// Validate ball numbers
function validateBallNumbers(totalNumberOfTubes, numberOfEmptyTubes, ballArray) {
    if (ballArray.length != totalNumberOfTubes)
        return "Invalid: total number of tubes"
    
    const ballMap = new Map()
    ballArray.forEach((tube, index) => {
        if (tube.length != 4)
            return `Invalid: number of balls in Tube ${index+1}`
        
        tube.forEach(ballColor => {
            if (ballColor == 0)
                return
            if (ballMap.has(ballColor))
                return ballMap.get(ballColor).count++
            return ballMap.set(ballColor, {count: 1})
        })
    })

    let numberOfColors = 0;
    for (const [ballColor, obj] of ballMap.entries()) {
        if (obj.count != 4)
            return `Invalid: there are ${obj.count} ball(s) in Color ${ballColor}`
        numberOfColors++
    }

    if (numberOfColors != totalNumberOfTubes - numberOfEmptyTubes)
        return "Invalid: number of colors"
    
    return true
}