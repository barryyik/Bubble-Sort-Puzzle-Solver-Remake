const displayDiv = document.querySelector('#displayDiv'),
    color_buttons_div = document.querySelector('#color_buttons_div'),
    gameSettingDiv = document.querySelector('#gameSettingDiv'),
    solutionDiv = document.querySelector('#solutionDiv')

document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_TOTAL_NUM_OF_TUBES = 5,
        DEFAULT_NUM_OF_EMPTY_TUBES = 2
    
    document.querySelector('#input_num_of_total_tubes').value = DEFAULT_TOTAL_NUM_OF_TUBES
    document.querySelector('#input_num_of_empty_tubes').value = DEFAULT_NUM_OF_EMPTY_TUBES

    createCanvas(DEFAULT_TOTAL_NUM_OF_TUBES, DEFAULT_NUM_OF_EMPTY_TUBES)

    /* Event Listeners */
    gameSettingDiv.addEventListener('change', event => {
        let totalNumberOfTubes = parseInt(document.querySelector('#input_num_of_total_tubes').value),
            numberOfEmptyTubes = parseInt(document.querySelector('#input_num_of_empty_tubes').value)
        if (numberOfEmptyTubes <= totalNumberOfTubes)
            return createCanvas(totalNumberOfTubes, numberOfEmptyTubes)
        if (event.target.id === 'input_num_of_total_tubes') {
            document.querySelector('#input_num_of_empty_tubes').value = totalNumberOfTubes
            return createCanvas(totalNumberOfTubes, totalNumberOfTubes)
        }
        document.querySelector('#input_num_of_total_tubes').value = numberOfEmptyTubes
        createCanvas(numberOfEmptyTubes, numberOfEmptyTubes)
    })
    
    color_buttons_div.addEventListener('change', event => {
        let targetID = event.target.id,
            colorNumber = targetID.substring(5, targetID.length - 20),
            allTargetBallDiv = document.querySelectorAll(`[data-ball-number='${colorNumber}']`)
        allTargetBallDiv.forEach(ball_div => updateBallColor(ball_div))
    })

    displayDiv.addEventListener('change', event => {
        let targetID = event.target.id,
            parentID = targetID.substring(0, targetID.length - 7),
            newNumber = event.target.value,
            parentDiv = document.querySelector(`#${parentID}`)
        // update dataset for easier color setting
        parentDiv.dataset.ballNumber = newNumber
        updateBallColor(parentDiv)
    })

    document.querySelector('#randomize_btn').addEventListener('click', () => {
        let totalNumberOfTubes = document.querySelector('#input_num_of_total_tubes').value,
            numberOfEmptyTubes = document.querySelector('#input_num_of_empty_tubes').value,
            ballArray = getBallArray(totalNumberOfTubes, numberOfEmptyTubes),
            checkBallArrayValid = validateBallNumbers(totalNumberOfTubes, numberOfEmptyTubes, ballArray)
        if (checkBallArrayValid != true)
            return alert(checkBallArrayValid)
        solutionDiv.innerHTML = ''
        randomizeBalls(ballArray, totalNumberOfTubes, numberOfEmptyTubes)
    })

    document.querySelector('#reset_btn').addEventListener('click', () => {
        let totalNumberOfTubes = document.querySelector('#input_num_of_total_tubes').value,
            numberOfEmptyTubes = document.querySelector('#input_num_of_empty_tubes').value
        createCanvas(totalNumberOfTubes, numberOfEmptyTubes)
    })

    document.querySelector('#solve_btn').addEventListener('click', () => {
        let totalNumberOfTubes = document.querySelector('#input_num_of_total_tubes').value,
            numberOfEmptyTubes = document.querySelector('#input_num_of_empty_tubes').value,
            ballArray = getBallArray(totalNumberOfTubes, numberOfEmptyTubes),
            checkBallArrayValid = validateBallNumbers(totalNumberOfTubes, numberOfEmptyTubes, ballArray)
        if (checkBallArrayValid != true)
            return alert(checkBallArrayValid)
        solutionDiv.innerHTML = `
            <div class='solution_div_title_box'><h3>Solution</h3></div>
            <p class='loading_text'>Loading, please wait......</p>`
        // add the img tag onerror
        solutionDiv.innerHTML += `<img id='dummyImg' style="display: none;" src>`
        document.querySelector('#dummyImg').onerror = () => {
            let results = bubbleSortSolver(ballArray, totalNumberOfTubes, numberOfEmptyTubes)
            solutionDiv.innerHTML = solutionInnerHTML(results)
        }
    })

    document.body.addEventListener('change', () => {
        solutionDiv.innerHTML = ''
    })
})

function createCanvas(totalNumberOfTubes, numberOfEmptyTubes) {
    displayDiv.innerHTML = ''
    color_buttons_div.innerHTML = ''
    solutionDiv.innerHTML = ''

    // create multiple tubes
    for (let i = 1; i <= totalNumberOfTubes; i++) {
        let isEmpty = (i > totalNumberOfTubes - numberOfEmptyTubes) ? true : false
        displayDiv.appendChild(createSingleTube(`tube_${i}`, isEmpty))
    }

    // add all options
    Array.from(document.querySelectorAll('.select_notEmpty'))
        .forEach((element, index_of_select) => {
            for (let i = 1; i <= totalNumberOfTubes - numberOfEmptyTubes; i++){
                let isSelected = (Math.floor(index_of_select / 4) + 1 == i) ? ' selected' : ''
                element.insertAdjacentHTML('beforeend', `<option value='${i}' ${isSelected}>${i}</option>`)
            }
        })

    // create control div
    let color_buttons_div_innerhtml = ''
    for (let i = 1; i <= totalNumberOfTubes - numberOfEmptyTubes; i++){
        let random_R_hex_temp = Math.floor(Math.random() * 256).toString(16),
            random_G_hex_temp = Math.floor(Math.random() * 256).toString(16),
            random_B_hex_temp = Math.floor(Math.random() * 256).toString(16)
        random_R_hex_temp = ( (random_R_hex_temp.length < 2) ? '0' : '' ) + random_R_hex_temp
        random_G_hex_temp = ( (random_G_hex_temp.length < 2) ? '0' : '' ) + random_G_hex_temp
        random_B_hex_temp = ( (random_B_hex_temp.length < 2) ? '0' : '' ) + random_B_hex_temp
        let random_RGB_hex = random_R_hex_temp + random_G_hex_temp + random_B_hex_temp
        color_buttons_div_innerhtml += `
            <div id='ball_${i}_color_control_div' class='ball_color_control_div'>
                <input type="color" class='to_be_disabled' id='ball_${i}_color_control_input' name='ball_${i}_color_control_input'
                    value='#${random_RGB_hex}'>
                <label for='ball_${i}_color_control_input'>Color ${i}</label>
            </div>`
    }
    document.querySelector('#color_buttons_div').innerHTML = color_buttons_div_innerhtml

    // add colors to the newly generated balls
    document.querySelectorAll('.ball')
        .forEach(ball_div => updateBallColor(ball_div))
}

function createSingleTube(id, isEmpty) {
    let tubeDiv = document.createElement("div"),
        ballNumber = id.substring(5),
        innerhtmlWithoutBall = `
            <div id='${id}_outterDiv' class='outterDiv'>
                <div id='${id}' class='tube'></div>
                <div id='${id}_number' class='tube_number'>
                    <p>Tube ${id.toString().substring(5)}</p>
                </div>
            </div>`,
        innerhtmlWithBall = `
            <div id='${id}_outterDiv' class='outterDiv'>
                <div id='${id}' class='tube'>
                    <div id='${id}_ball_1' class='ball' data-ball-number='${ballNumber}'>
                        <select name='${id}_ball_1_select' id='${id}_ball_1_select' class='select_notEmpty to_be_disabled'></select>
                    </div>
                    <div id='${id}_ball_2' class='ball' data-ball-number='${ballNumber}'>
                        <select name='${id}_ball_2_select' id='${id}_ball_2_select' class='select_notEmpty to_be_disabled'></select>
                    </div>
                    <div id='${id}_ball_3' class='ball' data-ball-number='${ballNumber}'>
                        <select name='${id}_ball_3_select' id='${id}_ball_3_select' class='select_notEmpty to_be_disabled'></select>
                    </div>
                    <div id='${id}_ball_4' class='ball' data-ball-number='${ballNumber}'>
                        <select name='${id}_ball_4_select' id='${id}_ball_4_select' class='select_notEmpty to_be_disabled'></select>
                    </div>
                </div>
                <div id='${id}_number' class='tube_number'>
                    <p>Tube ${id.toString().substring(5)}</p>
                </div>
            </div>`
    tubeDiv.innerHTML = (isEmpty) ? innerhtmlWithoutBall : innerhtmlWithBall
    return tubeDiv
}

function updateBallColor(ball_div) {
    let ball_num = ball_div.childNodes[1].value,
        color_hex = document.querySelector(`#ball_${ball_num}_color_control_input`).value
    ball_div.style.backgroundColor = color_hex
}