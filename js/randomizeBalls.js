/* Randomize Ball Inputs */

function randomizeBalls(ballArray, totalNumberOfTubes, numberOfEmptyTubes) {
    let ballNumberCount = []
    for (let i = 0; i < totalNumberOfTubes - numberOfEmptyTubes; i++) {
        ballNumberCount[i] = 0
    }
    for (let i = 0; i < totalNumberOfTubes - numberOfEmptyTubes; i++) {
        for (let j = 1; j <= 4; j++) {
            let randomTubePosition = Math.floor(Math.random() * (ballNumberCount.length)),
                ballPosition = ballNumberCount[randomTubePosition],
                ballColor = ballArray[randomTubePosition][ballPosition]
            document.querySelector(`#tube_${i+1}_ball_${j}_select`).value = String(ballColor)
            document.querySelector(`#tube_${i+1}_ball_${j}`).dataset.ballNumber = String(ballColor)
            updateBallColor(document.querySelector(`#tube_${i+1}_ball_${j}`))
            if (ballNumberCount[randomTubePosition] == 3) {
                ballNumberCount.splice(randomTubePosition, 1)
                ballArray.splice(randomTubePosition, 1)
            }
            else
                ballNumberCount[randomTubePosition] += 1
        }
    }
}