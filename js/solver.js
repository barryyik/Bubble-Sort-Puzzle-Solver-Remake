/* ### The Main Solving Algorithm Goes Here ###
 * 
 * By Barry Yik in May 2021
 * GitHub Page: https://github.com/barryyik/Bubble-Sort-Puzzle-Solver
 * 
 * ### Documentation ###
 * 
 * ballArrayShelves[i] = the shelf for the ballArray with the n-th tube = the original (n+i)th tube, where i = currentShelfNumber
 * => ballArrayShelves[i][j], where j = 0 to 4:
 *    => 0: currentBallArray
 *    => 1: currentStepsRecord
 *    => 2: masterSnapshotArray
 *    => 3: numberOfForwardMoves
 *    => 4: numberOfBackwardMoves
 * 
 * currentBallArray[i] = Tube Number (n+1)
 * => currentBallArray[i][j], where j = 0 to 10:
 *    =>  0: color of the 1st ball (count from bottom, 0 for empty space)
 *    =>  1: color of the 2nd ball (count from bottom, 0 for empty space)
 *    =>  2: color of the 3rd ball (count from bottom, 0 for empty space)
 *    =>  3: color of the 4th ball (count from bottom, 0 for empty space)
 *    =>  4: num of balls
 *    =>  5: color of top ball (0 for empty)
 *    =>  6: num of color(s) in tube (for checking 'half perfect / perfect')
 *    =>  7: perfect tube (1 for true, 0 for false)
 *    =>  8: the tube it last received from (default = null)
 *    =>  9: the tube it last moved to (default = null)
 *    => 10: prevent the same ball jump around different tubes (default = null, move then reset both from & to)
 * 
 * masterSnapshotArray[i] = snapshot of currentBallArray after the (i+1)th step
 * 
 * colorsInHalfPerfectArrayPosition[i]: position of 'main tube' of Color (i)
 * 
 * countOfSameColorHalfPerfect[i]: count of half-perfect tubes in Color (i)
 * 
 * positionWithSameColor[i][positionFrom, consecutiveNum]
 * 
 * availableColorCheck[Color]: any top ball in that Color && num of ball == 4 => +1; any top ball in that Color && num of ball < 4 => +100
 * 
 * currentStepsRecord[stepIndex][i], where i = 0 to 3
 *    => 0: 1 for MUST Step, 0 for Non-MUST Step
 *    => 1: position from
 *    => 2: position to
 *    => 3: [...,[color, position from, position to],...] >> possible moves <<
 * 
 * availableChoices = [...,[color, position from, position to],...] >> possible moves <<
 * 
 * availableColorCount[Color] = [num of Non-Perfect tubes with top ball in this color, total 'to' tubes]
 * 
 */

function bubbleSortSolver(ballArray, totalNumberOfTubes, numberOfEmptyTubes) {
    // Disable the inputs/buttons
    document.querySelectorAll('.to_be_disabled').forEach(input => input.disabled = (input.disabled) ? false : true)
    
    let hasSolution = false,
        ballArrayShelves = [],
        currentBallArray = JSON.parse(JSON.stringify(ballArray)),
        currentStepsRecord,
        masterSnapshotArray,
        currentShelfNumber,
        startTime = performance.now();

    // Create the array system
    currentBallArray.forEach(tube => {
        tube[4] = tube.filter(ball => ball != 0).length
        tube[5] = tube[4] == 0 ? 0 : tube[tube[4] - 1]
        tube[6] = Array.from(new Set(tube.slice(0, 4).filter(ball => ball != 0))).length
        tube[7] = (tube[4] == 4 && tube[6] == 1) ? 1 : 0
        tube[8] = null
        tube[9] = null
        tube[10] = null
    })

    // Create the ballArrayShelves
    for (let i = 0; i < (totalNumberOfTubes - numberOfEmptyTubes); i++) {
        ballArrayShelves[i] = []
        ballArrayShelves[i][0] = []
        ballArrayShelves[i][1] = []
        ballArrayShelves[i][2] = []
        ballArrayShelves[i][3] = 0
        ballArrayShelves[i][4] = 0

        let tempBallArray = JSON.parse(JSON.stringify(currentBallArray)),
            tempBallArrayString
        for (let j = 0; j < i; j++)
            tempBallArray.push(tempBallArray.shift())
        tempBallArrayString = JSON.stringify(tempBallArray)

        ballArrayShelves[i][0] = JSON.parse(tempBallArrayString)
        ballArrayShelves[i][2][0] = JSON.parse(tempBallArrayString)
    }

    // Perform a move
    function moveBall(fromTubeNumber, toTubeNumber, numOfSameColorBallToMove, isMustStep) {
        let tempNumOfFromBalls = currentBallArray[fromTubeNumber][4],
            tempNumOfToBalls = currentBallArray[toTubeNumber][4],
            tempColor = currentBallArray[fromTubeNumber][5]
        for (let i = 0; i < numOfSameColorBallToMove; i++) {
            // Update slot 0 to 3 - removing the ball && adding the ball
            currentBallArray[fromTubeNumber][tempNumOfFromBalls - 1 - i] = 0
            currentBallArray[toTubeNumber][tempNumOfToBalls + i] = tempColor
            // Update slot 4 - number of balls
            currentBallArray[fromTubeNumber][4] -= 1
            currentBallArray[toTubeNumber][4] += 1
            // Update slot 5 - top ball color
            currentBallArray[fromTubeNumber][5] = (tempNumOfFromBalls - 2 - i) >= 0 ? currentBallArray[fromTubeNumber][tempNumOfFromBalls - 2 - i] : 0
            currentBallArray[toTubeNumber][5] = tempColor
            // Update slot 6 - num of color(s) in tube
            currentBallArray[fromTubeNumber][6] = Array.from(new Set(currentBallArray[fromTubeNumber].slice(0, 4).filter(ball => ball != 0))).length
            currentBallArray[toTubeNumber][6] = Array.from(new Set(currentBallArray[toTubeNumber].slice(0, 4).filter(ball => ball != 0))).length
            // Update slot 7 - perfect tube status (1 for true, 0 for false)
            currentBallArray[fromTubeNumber][7] = (currentBallArray[fromTubeNumber][4] == 4 && currentBallArray[fromTubeNumber][6] == 1) ? 1 : 0
            currentBallArray[toTubeNumber][7] = (currentBallArray[toTubeNumber][4] == 4 && currentBallArray[toTubeNumber][6] == 1) ? 1 : 0
            // Reset slot 8 & 9 before updating
            // Reset 'from'
            for (let j = 8; j <= 9; j++) {
                if (currentBallArray[fromTubeNumber][j] != null) {
                    let fromOfOther = currentBallArray[fromTubeNumber][j]
                    currentBallArray[fromTubeNumber][8] = null
                    currentBallArray[fromTubeNumber][9] = null
                    currentBallArray[fromOfOther][8] = null
                    currentBallArray[fromOfOther][9] = null
                    break
                }
            }
            // Reset 'to'
            for (let j = 8; j <= 9; j++) {
                if (currentBallArray[toTubeNumber][j] != null) {
                    let toOfOther = currentBallArray[toTubeNumber][j]
                    currentBallArray[toTubeNumber][8] = null
                    currentBallArray[toTubeNumber][9] = null
                    currentBallArray[toOfOther][8] = null
                    currentBallArray[toOfOther][9] = null
                    break
                }
            }
            // Update slot 8 - 'last received from'
            currentBallArray[toTubeNumber][8] = fromTubeNumber
            // Update slot 9 - 'last moved to'
            currentBallArray[fromTubeNumber][9] = toTubeNumber
            // Update slot 10 - 'jumping ball prevention' marking reset
            currentBallArray[fromTubeNumber][10] = null
            currentBallArray[toTubeNumber][10] = null
            currentBallArray.forEach(tube => {
                if (tube[10] == fromTubeNumber || tube[10] == toTubeNumber)
                    tube[10] = null
            })
            // Remove used choice (the performed move) before checking slot 10
            let previousStepIndex = currentStepsRecord.length - 1
            if (!isMustStep)
                currentStepsRecord[previousStepIndex][3].splice(0, 1)
            // Update slot 10 - 'jumping ball prevention' marking
            JumpingBallMarking:
            if (true) {
                // Skip if it is a MUST Step
                if (isMustStep)
                    break JumpingBallMarking
                // Skip if it is the first 2 steps
                if (previousStepIndex <= 0)
                    break JumpingBallMarking
                // Skip if there is only 1 other choice
                if (currentStepsRecord[previousStepIndex][3].length <= 1)
                    break JumpingBallMarking
                currentStepsRecord[previousStepIndex][3].forEach(choice => {
                    if (choice[1] != fromTubeNumber)
                        return
                    // Mark all the other 'to', so there will be no 'jumping' (or ball cycling)
                    let tempTubePosition = choice[2]
                    currentBallArray[tempTubePosition][10] = toTubeNumber
                })
            }

            // Record steps
            if (isMustStep)
                currentStepsRecord.push([1, fromTubeNumber, toTubeNumber])
            else {
                currentStepsRecord[previousStepIndex][0] = 0
                currentStepsRecord[previousStepIndex][1] = fromTubeNumber
                currentStepsRecord[previousStepIndex][2] = toTubeNumber
            }

            // Update the masterSnapshotArray - take a snapshot
            masterSnapshotArray.push(JSON.parse(JSON.stringify(currentBallArray)))

            // Update number of moves performed
            ballArrayShelves[currentShelfNumber][3] += 1
        }
    }

    // Perform a backward move
    function moveBackward() {
        let needMovingBackward = true
        while (needMovingBackward) {
            let previousStepIndex = currentStepsRecord.length - 1

            // Check if it has reached the deadend
            if (previousStepIndex < 0) {
                needMovingBackward = false
                return false
            }
            
            // Restore to previous step's state - update && pass by reference again
            ballArrayShelves[currentShelfNumber][0] = JSON.parse(JSON.stringify(masterSnapshotArray[previousStepIndex]))
            currentBallArray = ballArrayShelves[currentShelfNumber][0]

            // Update number of backward moves performed
            ballArrayShelves[currentShelfNumber][4] += 1

            // Update the masterSnapshotArray - remove the 'no moves' snapshot
            masterSnapshotArray.splice(masterSnapshotArray.length - 1, 1)

            // Keep moving backward if previous step is a MUST step
            if (currentStepsRecord[previousStepIndex][0] == 1) {
                currentStepsRecord.splice(previousStepIndex, 1)
                continue
            }

            // Keep moving backward if previous step has no other choices
            if (! (currentStepsRecord[previousStepIndex][3]?.length > 0) ) {
                currentStepsRecord.splice(previousStepIndex, 1)
                continue
            }

            // Perform the move && exit the moveBack loop
            let tempFrom = currentStepsRecord[previousStepIndex][3][0][1],
                tempTo = currentStepsRecord[previousStepIndex][3][0][2]
            moveBall(tempFrom, tempTo, 1, false)
            needMovingBackward = false
        }
        return true
    }

    // Get available choices based on colors
    function findValidMoves() {
        let availableChoices = [],
            availableColorCount = []
        
        for (let i = 1; i <= totalNumberOfTubes - numberOfEmptyTubes; i++) {
            let tempColor = i
            availableColorCount[tempColor] = [0, 0]
            currentBallArray.forEach(tube => {
                // Ignore perfect tubes
                if (tube[7] == 1)
                    return
                
                // Ignore other colors
                if (tube[5] != tempColor)
                    return
                
                // (num of tubes with top ball in tempColor) += 1
                availableColorCount[i][0] += 1

                // Check if it is also an available 'to' tube
                if (tube[4] < 4)
                    availableColorCount[i][1] += 1
            })
        }

        // Create the availableChoices
        currentBallArray.forEach((tube, indexOfTo) => {
            let tempColor = tube[5]
            
            // Check potential valid 'to' tube
            // Ignore empty / full tubes (including perfect tubes)
            if (tube[4] == 0 || tube[4] == 4)
                return
            
            // Ignore (num of tubes with top ball in tempColor) <= 1 OR (total 'to' tubes) == 0
            if (availableColorCount[tempColor][0] <= 1 || availableColorCount[tempColor][1] == 0)
                return

            // Find a 'from' tube
            currentBallArray.forEach((tubeOfFrom, indexOfFrom) => {
                // Skip if not in the same color
                if (tubeOfFrom[5] != tempColor)
                    return
                
                // Skip perfect tubes
                if (tubeOfFrom[7] == 1)
                    return
                
                // Skip when indexOfFrom == indexOfTo (i.e. the same tube)
                if (indexOfFrom == indexOfTo)
                    return
                
                // Make a copy for validating the move
                let tempFutureState = JSON.parse(JSON.stringify(currentBallArray))
                
                // Perform a 'virtual move'
                let numOfFromBalls = tempFutureState[indexOfFrom][4],
                    numOfToBalls = tempFutureState[indexOfTo][4]
                tempFutureState[indexOfFrom][numOfFromBalls - 1] = 0
                tempFutureState[indexOfTo][numOfToBalls] = tempColor

                // Return if it is an 'interchange' dumb step (check currentBallArray[i][8 & 9])
                if (tubeOfFrom[8] == indexOfTo && tube[9] == indexOfFrom)
                    return
                
                // Return if it is a 'jumping ball' dumb step (check currentBallArray[i][10])
                if (tube[10] == indexOfFrom)
                    return
                
                // Check if it is a repeated move (check masterSnapshotArray)
                let isInvalidMove = masterSnapshotArray.some(snapshot => {
                    for (let i = 0; i < snapshot.length; i++) {
                        if (snapshot[i][0] != tempFutureState[i][0])
                            return false
                        if (snapshot[i][1] != tempFutureState[i][1])
                            return false
                        if (snapshot[i][2] != tempFutureState[i][2])
                            return false
                        if (snapshot[i][3] != tempFutureState[i][3])
                            return false
                    }
                    return true
                })

                if (isInvalidMove)
                    return
                
                // It is now a valid choice, so add it to availableChoices
                availableChoices.push([tempColor, indexOfFrom, indexOfTo])
            })
        })
        return availableChoices
    }
    
    currentShelfNumber = -1
    // The Solving Loop
    theSolvingLoop:
    while (true) {
        // Updating the currentShelfNumber && start taking turns
        currentShelfNumber = (currentShelfNumber + 1) % (totalNumberOfTubes - numberOfEmptyTubes)
        currentBallArray = ballArrayShelves[currentShelfNumber][0]
        currentStepsRecord = ballArrayShelves[currentShelfNumber][1]
        masterSnapshotArray = ballArrayShelves[currentShelfNumber][2]

        // Check num of Perfect tubes
        let sumOfPerfectTubes = 0;
        currentBallArray.forEach(tube => sumOfPerfectTubes += tube[7])

        // Break the loop if the solution is found
        if (sumOfPerfectTubes == (totalNumberOfTubes - numberOfEmptyTubes)) {
            hasSolution = true
            break theSolvingLoop
        }

        let colorsInHalfPerfectArrayPosition = [],
            countOfSameColorHalfPerfect = []

        currentBallArray.forEach((tube, tubeIndex) => {
            // Return if it is not 'half-perfect'
            if (tube[6] + tube[7] != 1)
                return
            
            // Update both arrays if it is a new entry
            let tempColor = tube[5]
            if (colorsInHalfPerfectArrayPosition[tempColor] == null) {
                countOfSameColorHalfPerfect[tempColor] = 1
                colorsInHalfPerfectArrayPosition[tempColor] = tubeIndex
                return
            }

            // If it is not replacing the main tube => only update the countOfSameColorHalfPerfect
            let tempOldPosition = colorsInHalfPerfectArrayPosition[tempColor]
            if (tube[4] <= currentBallArray[tempOldPosition][4]) {
                countOfSameColorHalfPerfect[tempColor] += 1
                return
            }
            
            // When it is 'half-perfect' && is not a new entry && is replacing the main tube
            countOfSameColorHalfPerfect[tempColor] += 1
            colorsInHalfPerfectArrayPosition[tempColor] = tubeIndex
        })

        // The 1st MUST Step
        if (colorsInHalfPerfectArrayPosition.filter(item => item != null).length > 0 &&
            Math.max(...countOfSameColorHalfPerfect.filter(count => count != null)) >= 2) {
            countOfSameColorHalfPerfect.forEach((count, color) => {
                // Return if there is no 'count' for that color
                if (count == null)
                    return

                // Return if countOfSameColorHalfPerfect < 2
                if (count < 2)
                    return

                let tempColor = color,
                    tempPositionTo = colorsInHalfPerfectArrayPosition[tempColor], // (OLD) tempTo
                    otherTubeCount = count - 1
                
                currentBallArray.forEach((tubeFrom, indexFrom) => {
                    // Return if no more other tubes
                    if (otherTubeCount <= 0)
                        return

                    // Return if not half perfect
                    if (tubeFrom[6] + tubeFrom[7] != 1)
                        return

                    // Return if not same color
                    if (tubeFrom[5] != tempColor)
                        return
                    
                    // Return if it is the main tube (i.e. 'from' == 'to')
                    if (indexFrom == tempPositionTo)
                        return
                    
                    let numOfBall = tubeFrom[4]
                    moveBall(indexFrom, tempPositionTo, numOfBall, true)
                    otherTubeCount--
                })
            })
            // Continue theSolvingLoop after 1st MUST Step
            continue theSolvingLoop
        }

        // The 2nd MUST Step
        if (colorsInHalfPerfectArrayPosition.filter(item => item).length) {
            let secondMustToMove = []
            // Create the secondMustToMove
            colorsInHalfPerfectArrayPosition.forEach((mainTubePosition, color) => {
                // Return if empty
                if (mainTubePosition == null)
                    return
                
                let tempColor = color,
                    tempPositionTo = mainTubePosition,
                    positionWithSameColor = []
                
                currentBallArray.forEach((tubeFrom, indexFrom) => {
                    // Return if not same color
                    if (tubeFrom[5] != tempColor)
                        return
                    
                    // Return if it is the main tube
                    if (indexFrom == tempPositionTo)
                        return
                    
                    let numOfBall = tubeFrom[4],
                        consecutiveNum = 0
                    for (let i = 1; i <= numOfBall; i++) {
                        if (tubeFrom[numOfBall - i] != tempColor)
                            break
                        consecutiveNum++
                    }
                    positionWithSameColor.push([indexFrom, consecutiveNum])
                })

                // Return if no other tubes with same top ball color
                if (positionWithSameColor.length == 0)
                    return
                
                // Return if sum != 4
                let tempSum = currentBallArray[tempPositionTo][4]
                positionWithSameColor.forEach(tubeEntry => tempSum += tubeEntry[1])
                if (tempSum != 4)
                    return

                // Record to secondMustToMove
                positionWithSameColor.forEach(nonMainTubeChoice => {
                    let indexFrom = nonMainTubeChoice[0],
                        consecutiveNum = nonMainTubeChoice[1]
                    secondMustToMove.push([tempPositionTo, indexFrom, consecutiveNum])
                })
            })
            // Perform the moves based on secondMustToMove
            if (secondMustToMove.length > 0) {
                secondMustToMove.forEach(move => {
                    let tempPositionTo = move[0],
                        indexFrom = move[1],
                        consecutiveNum = move[2]
                    moveBall(indexFrom, tempPositionTo, consecutiveNum, true)
                })
                // Continue theSolvingLoop after the 2nd MUST Step
                continue theSolvingLoop
            }
        }

        // Check deadend / 'no more forward moves'
        // Check num of empty tubes
        let productOfTubeNumber = currentBallArray.reduce((product, tube) => product *= tube[4] , 1)

        // If there is no empty tubes
        if (productOfTubeNumber != 0) {
            // Check number of available colors
            let availableColorCheck = []
            currentBallArray.forEach(tube => {
                // Return if empty (just in case)
                let tempColor = tube[5]
                if (tempColor == 0)
                    return
                
                // Mark +1 (tube with 4 balls && the top ball is in that color)
                let tempNumOfBall = tube[4]
                if (tempNumOfBall == 4)
                    return availableColorCheck[tempColor] = (availableColorCheck[tempColor] ?? 0) + 1
                
                // Mark +100 (tube with less than 4 balls && the top ball is in that color)
                availableColorCheck[tempColor] = (availableColorCheck[tempColor] ?? 0) + 100
            })

            // If 'no more forward moves' exists
            let numOfAvailableColors = availableColorCheck.filter(marks => marks > 100).length
            if (numOfAvailableColors == 0) {
                if (!moveBackward())
                    break theSolvingLoop
                continue theSolvingLoop
            }

            // If not 'no more forward moves'
            let availableChoices = findValidMoves()
            
            // If no choices, move backward
            if (JSON.parse(JSON.stringify(availableChoices)).length == 0) {
                if (!moveBackward())
                    break theSolvingLoop
                continue theSolvingLoop
            }

            // Set currentStepsRecord[i][3] as availableChoices after creating it
            currentStepsRecord.push([])
            currentStepsRecord[currentStepsRecord.length - 1][3] = JSON.parse(JSON.stringify(availableChoices))

            // Perform the move
            let tempFrom = currentStepsRecord[currentStepsRecord.length - 1][3][0][1],
                tempTo = currentStepsRecord[currentStepsRecord.length - 1][3][0][2]
            moveBall(tempFrom, tempTo, 1, false)
            continue theSolvingLoop
        }
        // If there are empty tubes
        let availableChoices = findValidMoves()
        
        // Add empty tubes to the availableChoices
        let positionOfFirstEmptyTube = null
        currentBallArray.some((tube, indexOfTube) => {
            if (tube[4] != 0)
                return false
            positionOfFirstEmptyTube = indexOfTube
            return true
        })
        
        if (positionOfFirstEmptyTube != null) {
            // Check half-perfect tubes (do not move balls to the empty tube in that color, coz it will then move to the half-perfect tube)
            let tempCheckHalfPerfect = []
            currentBallArray.forEach(tube => {
                if (tube[6] + tube[7] != 1)
                    return
                tempCheckHalfPerfect[tube[5]] = 1
            })
            currentBallArray.forEach((tubeOfFrom, indexOfFrom) => {
                // Skip half perfect / perfect tubes / empty tubes
                if (tubeOfFrom[6] <= 1)
                    return
                
                // Skip when indexOfFrom == positionOfFirstEmptyTube
                if (indexOfFrom == positionOfFirstEmptyTube)
                    return
                
                // Skip when there is a half perfect tube in the from ball color
                if (tempCheckHalfPerfect[tubeOfFrom[5]] == 1)
                    return
                
                // Make a copy && validate the move
                let tempFutureState = JSON.parse(JSON.stringify(currentBallArray))
                
                // Perform a 'virtual move'
                let numOfFromBalls = tempFutureState[indexOfFrom][4],
                    numOfToBalls = tempFutureState[positionOfFirstEmptyTube][4],
                    tempColor = tempFutureState[indexOfFrom][5]
                tempFutureState[indexOfFrom][numOfFromBalls - 1] = 0
                tempFutureState[positionOfFirstEmptyTube][numOfToBalls] = tempColor

                // Return if it is an 'interchange' dumb step (check currentBallArray[i][8 & 9])
                if (tubeOfFrom[8] == positionOfFirstEmptyTube && currentBallArray[positionOfFirstEmptyTube][9] == indexOfFrom)
                    return
                
                // Return if it is a 'jumping ball' dumb step (check currentBallArray[i][10])
                if (currentBallArray[positionOfFirstEmptyTube][10] == indexOfFrom)
                    return
                
                // Check if it is a repeated move (check masterSnapshotArray)
                let isInvalidMove = masterSnapshotArray.some(snapshot => {
                    for (let i = 0; i < snapshot.length; i++) {
                        if (snapshot[i][0] != tempFutureState[i][0])
                            return false
                        if (snapshot[i][1] != tempFutureState[i][1])
                            return false
                        if (snapshot[i][2] != tempFutureState[i][2])
                            return false
                        if (snapshot[i][3] != tempFutureState[i][3])
                            return false
                    }
                    return true
                })

                if (isInvalidMove)
                    return
                
                // It is now a valid choice, so add it to the availableChoices
                availableChoices.splice(0, 0, [tempColor, indexOfFrom, positionOfFirstEmptyTube])
            })
        }

        // If no choices, move backward
        if (JSON.parse(JSON.stringify(availableChoices)).length == 0) {
            if (!moveBackward())
                break theSolvingLoop
            continue theSolvingLoop
        }
        // Set currentStepsRecord[i][3] as availableChoices after creating it
        currentStepsRecord.push([])
        currentStepsRecord[currentStepsRecord.length - 1][3] = JSON.parse(JSON.stringify(availableChoices))

        // Perform the move
        let tempFrom = currentStepsRecord[currentStepsRecord.length - 1][3][0][1],
            tempTo = currentStepsRecord[currentStepsRecord.length - 1][3][0][2]
        moveBall(tempFrom, tempTo, 1, false)
        continue theSolvingLoop
    }
    // After the loop
    // Restore "currentBallArray" by shifting the tubes back
    let finalBallArray = JSON.parse(JSON.stringify(currentBallArray)),
        finalSteps = [], // from, to
        endTime = performance.now();
    
    // Restore the "currentBallArray"
    for (let i = 0; i < currentShelfNumber; i++)
        finalBallArray.unshift(finalBallArray.pop())

    // Restore the moves in "currentStepsRecord" to the default set of values && get the solution
    currentStepsRecord.forEach(stepRecord => {
        let fromTubeName = (stepRecord[1] + currentShelfNumber) % totalNumberOfTubes + 1,
            toTubeName = (stepRecord[2] + currentShelfNumber) % totalNumberOfTubes + 1
        finalSteps.push([fromTubeName, toTubeName])
    })

    // Re-enable the inputs/buttons again
    document.querySelectorAll('.to_be_disabled').forEach(input => input.disabled = (input.disabled) ? false : true)

    // Return the results
    /*let numberOfForwardMoves = ballArrayShelves[currentShelfNumber][3],
        numberOfBackwardMoves = ballArrayShelves[currentShelfNumber][4]*/
    return [hasSolution, finalSteps, startTime, endTime]
}