
const display = document.getElementById('display');

document.querySelectorAll('button[data-value]').forEach((button) => {
    const value = button.dataset.value;
    button.addEventListener('click', () => appendToDisplay(value));
});

document.querySelector('[data-action="backspace"]').addEventListener('click', backSpace);
document.querySelector('[data-action="clear"]').addEventListener('click', clearDisplay);
document.querySelector('[data-action="calculate"]').addEventListener('click', calculate);

document.querySelectorAll('button i').forEach((icon) => {
    icon.setAttribute('aria-hidden', 'true');
});

function appendToDisplay(value) {
    display.value += value;
}

function calculate() {
    try {
        const expression = sanitizeExpression(display.value);
        if (!expression) {
            return;
        }
        display.value = evaluateExpression(expression).toString();
    } catch (e) {
        display.value = 'Error';
    }
}

function clearDisplay() {
    display.value = '';
}

function backSpace() {
    display.value = display.value.slice(0, -1);
}

function sanitizeExpression(value) {
    let expression = value.replace(/\s+/g, '');
    expression = expression.replace(/[+\-*/]+$/, '');
    if (/[^0-9+\-*/().]/.test(expression)) {
        throw new Error('Invalid characters');
    }
    return expression;
}

function evaluateExpression(expression) {
    const tokens = tokenize(expression);
    let index = 0;

    function parseExpression() {
        let value = parseTerm();
        while (tokens[index] === '+' || tokens[index] === '-') {
            const operator = tokens[index++];
            const right = parseTerm();
            value = operator === '+' ? value + right : value - right;
        }
        return value;
    }

    function parseTerm() {
        let value = parseUnary();
        while (tokens[index] === '*' || tokens[index] === '/') {
            const operator = tokens[index++];
            const right = parseUnary();
            value = operator === '*' ? value * right : value / right;
        }
        return value;
    }

    function parseUnary() {
        if (tokens[index] === '+') {
            index++;
            return parseUnary();
        }
        if (tokens[index] === '-') {
            index++;
            return -parseUnary();
        }
        return parsePrimary();
    }

    function parsePrimary() {
        const token = tokens[index];

        if (token === '(') {
            index++;
            const value = parseExpression();
            if (tokens[index] !== ')') {
                throw new Error('Missing closing parenthesis');
            }
            index++;
            return value;
        }

        if (!isNaN(token)) {
            index++;
            return Number(token);
        }

        throw new Error('Invalid expression');
    }

    const result = parseExpression();
    if (index !== tokens.length || Number.isNaN(result) || !Number.isFinite(result)) {
        throw new Error('Invalid result');
    }
    return result;
}

function tokenize(expression) {
    const tokens = [];
    let currentNumber = '';

    for (const char of expression) {
        if ((char >= '0' && char <= '9') || char === '.') {
            currentNumber += char;
            continue;
        }

        if (currentNumber) {
            if (!isValidNumber(currentNumber)) {
                throw new Error('Invalid number');
            }
            tokens.push(currentNumber);
            currentNumber = '';
        }

        tokens.push(char);
    }

    if (currentNumber) {
        if (!isValidNumber(currentNumber)) {
            throw new Error('Invalid number');
        }
        tokens.push(currentNumber);
    }

    return tokens;
}

function isValidNumber(value) {
    return /^\d+(\.\d+)?$/.test(value);
}

const labels = {
    '/': 'Divide',
    '*': 'Multiply',
    '-': 'Subtract',
    '+': 'Add',
    '.': 'Decimal point',
    '(': 'Open parenthesis',
    ')': 'Close parenthesis'
};

document.querySelectorAll('button[data-value]').forEach((button) => {
    const value = button.dataset.value;
    button.setAttribute('aria-label', labels[value] || `Number ${value}`);
});

document.querySelector('[data-action="backspace"]').setAttribute('aria-label', 'Backspace');
document.querySelector('[data-action="clear"]').setAttribute('aria-label', 'Clear');
document.querySelector('[data-action="calculate"]').setAttribute('aria-label', 'Calculate');
