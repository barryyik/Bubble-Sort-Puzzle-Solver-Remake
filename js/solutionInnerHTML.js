/* Return the solution innerHTML */

function solutionInnerHTML([hasSolution, finalSteps, startTime, endTime]) {
    let solution_div_title_box_innerHTML = `<div class='solution_div_title_box'><h3>Solution</h3></div>`,
        mainContent
    if (!hasSolution) {
        mainContent = '<p>There is no solution.</p>'
        mainContent += `<p class='time_elapsed_text'>Time elapsed: ${Math.ceil((endTime - startTime)*1000) / 1000000} second(s).</p>`
    }
    if (hasSolution && finalSteps.length == 0)
        mainContent = '<p>It is already solved.</p>'
    if (hasSolution && finalSteps.length > 0) {
        mainContent = `
            <table>
                <tr>
                    <th></th>
                    <th>Move From</th>
                    <th>Move To</th>
                </tr>`
        finalSteps.forEach((step, stepIndex) => {
            mainContent += `
                <tr>
                    <td>Step ${stepIndex + 1}.</td>
                    <td>Tube ${step[0]}</td>
                    <td>Tube ${step[1]}</td>
                </tr>`
        })
        mainContent += `</table>`
        mainContent += `<p class='time_elapsed_text'>Time elapsed: ${Math.ceil((endTime - startTime)*1000) / 1000000} second(s).</p>`
    }
    let solution_div_main_box_innerHTML = `<div class='setting_main_box'>${mainContent}</div>`,
        solutionDiv_innerHTML = solution_div_title_box_innerHTML + solution_div_main_box_innerHTML
    return solutionDiv_innerHTML
}