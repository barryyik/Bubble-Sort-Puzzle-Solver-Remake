/* Convert Ball Input To Array */

function getBallArray(totalNumberOfTubes, numberOfEmptyTubes) {
    let ballArray = []
    for (let i = 1; i <= totalNumberOfTubes; i++) {
        let tubeArray = []
        for (let j = 4; j > 0; j--) {
            if (i > totalNumberOfTubes - numberOfEmptyTubes) {
                tubeArray.push(0)
            }
            else {
                tubeArray.push(document.querySelector(`#tube_${i}_ball_${j}_select`).value)
            }
        }
        ballArray.push(tubeArray)
    }
    return ballArray
}