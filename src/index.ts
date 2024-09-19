const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const MAX_LINE_WIDTH = 11;
const NUMBER_OF_LINES = 6;
const WORD_LIST_PATH = path.join(__dirname, 'DLS.json');
const CATEGORIES_LIST = ['git'] as const;
type CATEGORIES = typeof CATEGORIES_LIST[number];

let args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide a category.');
    process.exit(1);
}
let category = args[0] as CATEGORIES;

type FileSolutionType = {
    category: CATEGORIES,
    id: number,
    solution: string
};

function readRandomInputFromFile(filePath: string, category: CATEGORIES): FileSolutionType {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsedData = JSON.parse(data);

        if (!parsedData.hasOwnProperty(category)) {
            throw new Error(`Category "${category}" not found in the file.`);
        }

        const strings = parsedData[category];
        if (!Array.isArray(strings)) {
            throw new Error(`Expected an array for category "${category}", but got ${typeof strings}.`);
        }

        if (strings.length === 0) {
            throw new Error(`Category "${category}" is empty.`);
        }

        const randomIndex = Math.floor(Math.random() * strings.length);
        return {
            category: category,
            id: randomIndex,
            solution: cleanString(strings[randomIndex])
        };
    } catch (error: any) {
        console.error('Error reading or parsing file:', error.message);
        throw error;
    }
}

function getRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function verticalPadding(lines: Array<string>, numberOfLines: number): Array<string> {
	const verticalPadding = numberOfLines - lines.length;
	const topPadding = Math.floor(verticalPadding / 2);
	const bottomPadding = verticalPadding - topPadding;
	return _.times(topPadding, _.constant('')).concat(lines).concat(_.times(bottomPadding, _.constant('')));
}

function horizontalPadding(line: string, maxWidth: number): string {
	line = line.replace(/\s+/g, getRandomString(1));
	const padding = maxWidth - line.length;
	const leadingPadding = getRandomString(Math.floor(padding / 2));
	const trailingPadding = getRandomString(padding - leadingPadding.length);
	return [leadingPadding, line, trailingPadding].join('');
}

function createTableRows(lines: Array<string>): string {
	const rows: Array<string> = [];
	lines.forEach((line) => {
		rows.push(`<tr>`);
		const content = String(horizontalPadding(line, MAX_LINE_WIDTH));
		content.split('').forEach((char) => rows.push(`<td>${char}</td>`));
		rows.push(`</tr>`);
	});

	return rows.join('\n');
}

function cleanString(str: string | undefined): string {
    if (typeof str !== 'string') {
        return '';
    }
    return str.replace(/[^a-zA-Z]/g, ' ').trim();
}

function validateSolution(solution: string): boolean {
    if (solution === undefined) {
        console.error('Failed to generate a valid solution.');
        process.exit(1);
    }

    let passesValidation = true;
    if (solution.replace(/\s/g, '').length > MAX_LINE_WIDTH * NUMBER_OF_LINES) {
        passesValidation = false;

        console.error('Solution is too long to be displayed in the table:\n', solution);
        process.exit(1);
    }
    const words = solution.toUpperCase().split(' ');
    words.forEach((word: string) => {
        if (word.length > MAX_LINE_WIDTH) {
            console.error(`${word}\n is too long to be displayed in the table.`);
            passesValidation = false;
            process.exit(1);
        }
    });

    return passesValidation;
}

let validInput = false;
let randomSolution: FileSolutionType = readRandomInputFromFile(WORD_LIST_PATH, category);

let maxAttempts = 10;
while(!validInput) {
    validInput = validateSolution(randomSolution.solution);
    if (validInput) {
        break;
    } else {
        randomSolution = readRandomInputFromFile(WORD_LIST_PATH, category);
    }

    if (maxAttempts-- <= 0) {
        console.error('Failed to generate a valid solution after 10 attempts.');
        process.exit(1);
    }
}

const words = randomSolution!.solution.toUpperCase().split(' ');

let lines: Array<string> = [];

let currentLine = 0;

for (let word = 0; word < words.length; word++) {
    let line: string = lines[currentLine] || '';

    if (line.split('').length + words[word].length > MAX_LINE_WIDTH) {
        currentLine++;
    }


    if (!lines[currentLine]) {
        lines[currentLine] = words[word].toUpperCase();
    } else {
        lines[currentLine] += ' ' + words[word];
    }
}

lines = verticalPadding(lines, NUMBER_OF_LINES);
lines.forEach((line, index) => lines[index] = horizontalPadding(line, MAX_LINE_WIDTH));

if (!validateSolution(lines.join(' '))) {
    console.error('Failed to generate a valid solution.');
    process.exit(1);
} else {
    console.log('Solution: ', randomSolution.solution);
}

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Random String Table</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            font-family: Monospace;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <table>
        <caption>${[randomSolution.category.toUpperCase(),randomSolution.id].join(' ')}</caption>
        <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
        </tr>
        ${createTableRows(lines)}
    </table>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);

console.log('HTML file generated successfully!');
