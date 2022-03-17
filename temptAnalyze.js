const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

//define question with parameter allow array input and whether the value is positive value
const questions = [
    { question: 'Please define threshold for freezing: ', output: 'Threshold for freezing is ', allowMutiInput: false, isPos: false },
    { question: 'Please define threshold for boiling: ', output: 'Thresholds for boiling is ', allowMutiInput: false, isPos: false },
    { question: 'Please enter the accepted fluctuation limit: ', output: 'Accepted fluctuation limit is +/-', allowMutiInput: false, isPos: true },
    { question: 'Please input temperatures: (Seperate By space and Press Enter key for the result) ', ouput: 'Result: \n', allowMutiInput: true, isPos: false }
]

async function* task(query) {
    for (; ;) {
        yield new Promise((resolve) => readline.question(query, resolve));
    }
}

//check the temperture number is numeric
function checkTemperValid(tempt) {
    let tmp = tempt.split(' ');
    return !tmp.some(x => { return isNaN(x) });
}

//find the first array index that match the requirement: freezing or unfreezing
function findFzIndex(isFzOrBl, tmp, threshold, limit) {
    return isFzOrBl ? tmp.findIndex(t => !isNaN(t) && (t > parseFloat(threshold) + parseFloat(limit))) : tmp.findIndex(t => !isNaN(t) && t <= parseFloat(threshold));
}

//find the first array index that match the requirement: boiling or unboiling
function findBlIndex(isFzOrBl, tmp, threshold, limit) {
    return isFzOrBl ? tmp.findIndex(t => !isNaN(t) && (t < parseFloat(threshold) - parseFloat(limit))) : tmp.findIndex(t => !isNaN(t) && t >= parseFloat(threshold));
}

function resultGenerate(tempt, threshold, limit, msg) {
    let isFzOrBl = false;
    let tmp = tempt;
    var result = [];
    while (tmp.length > 0) {
        let targetIndex = msg == 'freezing' ? findFzIndex(isFzOrBl, tmp, threshold, limit) : findBlIndex(isFzOrBl, tmp, threshold, limit);
        let tmpMsg = isFzOrBl ? `un` + msg : msg;
        let isTargetFound = targetIndex >= 0;
        isTargetFound ? isFzOrBl = !isFzOrBl : targetIndex = tmp.length;
        let tmpArray = tmp.slice(0, targetIndex + 1);
        result = result.concat(tmpArray);
        if (isTargetFound) result.push(tmpMsg);
        tmp = tmp.length > 1 ? tmp.slice(targetIndex + 1) : [];
    }
    return result;
}


const main = async () => {
    var tmpStorage = [];

    for (const [index, value] of questions.entries()) {
        for await (const answer of task(value.question)) {
            if ((value.allowMutiInput && checkTemperValid(answer)) || (!value.allowMutiInput && !isNaN(answer) && answer.length > 0)) {
                value.isPos && answer < 0 ? answer = Math.abs(parseFloat(answer)) : '';
                tmpStorage[index] = answer; break;
            }
            console.log('** Invalid Input: Please enter Numerical Value');
        }
    }


    let tempt = tmpStorage[3].split(' ').filter(t => t != '').map(parseFloat);
    var resultWithFz = resultGenerate(tempt, tmpStorage[0], tmpStorage[2], 'freezing');
    var result = resultGenerate(resultWithFz, tmpStorage[1], tmpStorage[2], 'boiling');
    console.log(`RESULT:\n${result}`);

    readline.close();
    process.exit(1);

};

main();
