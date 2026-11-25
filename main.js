function priority(operation) {
    if (operation === '+' || operation === '-') {
        return 1;
    } else if (operation === '*' || operation === '/') {
        return 2;
    }
    return 0;
}

function isNumeric(str) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

function isDigit(str) {
    return /^\d{1}$/.test(str);
}

function isOperation(str) {
    return /^[\+\-\*\/]{1}$/.test(str);
}

function tokenize(str) {
    let tokens = [];
    let lastNumber = '';

    for (let i = 0; i < str.length; i++) {
        let char = str[i];

        if (isDigit(char) || char === '.') {
            lastNumber += char;
        } else if ((char === '-' || char === '+') && 
                   (i === 0 || str[i - 1] === '(' || isOperation(str[i - 1]))) {
            if (char === '-') {
                lastNumber += char;
            }
        } else {
            if (lastNumber.length > 0) {
                tokens.push(lastNumber);
                lastNumber = '';
            }
            if (isOperation(char) || char === '(' || char === ')') {
                tokens.push(char);
            }
        }
    }

    if (lastNumber.length > 0) {
        tokens.push(lastNumber);
    }
    return tokens;
}

function compile(str) {
    let out = [];
    let stack = [];
    for (let token of tokenize(str)) {
        if (isNumeric(token)) {
            out.push(token);
        } else if (isOperation(token)) {
            while (stack.length > 0 && 
                   isOperation(stack[stack.length - 1]) && 
                   priority(stack[stack.length - 1]) >= priority(token)) {
                out.push(stack.pop());
            }
            stack.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                out.push(stack.pop());
            }
            stack.pop(); 
        }
    }
    while (stack.length > 0) {
        out.push(stack.pop());
    }
    return out.join(' ');
}

function evaluate(str) {
    let stack = [];
    let tokens = str.split(' ');

    for (let token of tokens) {
        if (token === '') continue;

        if (isNumeric(token)) {
            stack.push(parseFloat(token));
        } else if (isOperation(token)) {
            let b = stack.pop();
            let a = stack.pop();
            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    stack.push(a / b);
                    break;
            }
        }
    }
    return stack.pop();
}

function clickHandler(event) {
    let target = event.target;
    
    if (!target.classList.contains('key')) {
        return;
    }

    let screen = document.querySelector('.screen span');
    let currentText = screen.textContent;
    let lastChar = currentText.slice(-1);

    if (target.classList.contains('digit') || target.classList.contains('bracket')) {
        screen.textContent += target.textContent;
    } else if (target.classList.contains('operation')) {
        let newOp = target.textContent;

        if (currentText === '' || lastChar === '(') {
            if (newOp === '-') {
                screen.textContent += newOp;
            }
            return;
        }

        if (isOperation(lastChar)) {
            if (currentText.length === 1 || currentText.slice(-2, -1) === '(') {
                return;
            }
            screen.textContent = currentText.slice(0, -1) + newOp;
        } else {
            screen.textContent += newOp;
        }
    } else if (target.classList.contains('clear')) {
        screen.textContent = '';
    } else if (target.classList.contains('result')) {
        if (currentText.trim() === '') return;

        let expression = isOperation(lastChar) ? currentText.slice(0, -1) : currentText;
        if (expression === '' || expression === '-') return;

        let rpnExpression = compile(expression);
        let answer = evaluate(rpnExpression);

        if (isNaN(answer) || !isFinite(answer)) {
            screen.textContent = 'Ошибка';
        } else {
            screen.textContent = Number(answer.toFixed(2));
        }
    }
}

window.onload = function () {
    let buttonsContainer = document.querySelector('.buttons');
    buttonsContainer.addEventListener('click', clickHandler);
};
