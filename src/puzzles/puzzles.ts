const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const MAX_LINE_WIDTH = 11;
const NUMBER_OF_LINES = 3;
const TOTAL_LINES = 6;

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

type PuzzleLine = {
    cells: string[],
    solutionCells: boolean[]
}

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

function horizontalPadding(line: string, maxWidth: number): PuzzleLine {
    console.log(`Original line: "${line}"`);
    line = line.replace(/\s+/g, getRandomString(1));
    console.log(`Line after replacing spaces: "${line}"`);

    const padding = maxWidth - line.length;
    console.log(`Padding needed: ${padding}`);

    const leadingPaddingSize = Math.floor(padding / 2);
    const trailingPaddingSize = padding - leadingPaddingSize;
    console.log(`Leading padding size: ${leadingPaddingSize}, Trailing padding size: ${trailingPaddingSize}`);

    const clueLine: string[] = [getRandomString(leadingPaddingSize), line, getRandomString(trailingPaddingSize)].join('').split('');
    console.log(`Final clueLine: "${clueLine.join('')}", Length: ${clueLine.length}`);

    const puzzleLine: PuzzleLine = {
        cells: clueLine,
        solutionCells: _.times(leadingPaddingSize, _.constant(false))
            .concat(_.times(line.length, _.constant(true)))
            .concat(_.times(trailingPaddingSize, _.constant(false)))
    };

    return puzzleLine;
}

function createTableRows(lines: PuzzleLine[]): string {
	const rows: Array<string> = [];
	lines.forEach((line) => {
		rows.push(`<tr>`);
        const row = line.cells;
        const answerKey = line.solutionCells;
		row.forEach((char, index) => rows.push(`<td class=${answerKey[index] ? 'answerCell' : ''}>${char}</td>`));
		rows.push(`</tr>`);

        rows.push(`<tr>`);
        getRandomString(MAX_LINE_WIDTH).split('').forEach((char) => rows.push(`<td>${char}</td>`));
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

function validateInputString(str: string): boolean {
    const words = str.split(' ');
    return words.every((word) => word.length <= MAX_LINE_WIDTH) && str.length <= MAX_LINE_WIDTH * NUMBER_OF_LINES + words.length - 1;
}

function validateSolution(solution: PuzzleLine[]): boolean {
    if (solution === undefined) {
        console.error('Failed to generate a valid solution.');
        process.exit(1);
    }

    let passesValidation = true;
    solution.forEach((line) => {
        if (line.cells.length !== line.solutionCells.length) {
            passesValidation = false;
            console.error('Solution and cells length do not match.');
            process.exit(1);
        }

        line.solutionCells.forEach((cell: boolean) => {
            if (typeof cell !== 'boolean') {
                passesValidation = false;
                console.error('Solution cells should be booleans.');
                process.exit(1);
            }
        });

        line.cells.forEach((cell: string) => {
            if (typeof cell !== 'string') {
                passesValidation = false;
                console.error('Solution cells should be strings.');
                process.exit(1);
            }
        });

        if (line.cells.length > MAX_LINE_WIDTH - 1) {
            passesValidation = false;
            console.error('Solution cells longer than valid solution size.');
            process.exit(1);
        }
    });

    return passesValidation;
}

let validInput = false;
let randomSolution: FileSolutionType = readRandomInputFromFile(WORD_LIST_PATH, category);

let maxAttempts = 10;
while(!validInput) {
    validInput = validateInputString(randomSolution.solution);
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

const words = randomSolution.solution.toUpperCase().split(' ');

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
const formattedLines: PuzzleLine[] = lines.map((line) => horizontalPadding(line, MAX_LINE_WIDTH));

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
        td {
            height: 90px;
            font-size: 25px;
            border-bottom:10px solid white;
        }
        th {
            background-color: #f2f2f2;
        }
        .answerCell {
            background-color: #f2f2f2;
            border-bottom: 10px solid black;
        }
    </style>
</head>
<body>
    <table>
        <caption></caption>
        <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>${randomSolution.category.toUpperCase()[0]}</th>
            <th>${randomSolution.id}</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
        </tr>
        ${createTableRows(formattedLines)}
    </table>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);

console.log('HTML file generated successfully!');
