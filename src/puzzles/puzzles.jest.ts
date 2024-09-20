import { validateSolution } from './index';

describe('validateSolution', () => {
    it('should return true for a valid solution', () => {
        const validSolution = [
            {
                cells: ['A', 'B', 'C', 'D', 'E'],
                solutionCells: [true, true, true, true, true]
            },
            {
                cells: ['F', 'G', 'H', 'I', 'J'],
                solutionCells: [true, true, true, true, true]
            }
        ];
        expect(validateSolution(validSolution)).toBe(true);
    });

    it('should return false for solution with mismatched cells and solutionCells lengths', () => {
        const invalidSolution = [
            {
                cells: ['A', 'B', 'C', 'D', 'E'],
                solutionCells: [true, true, true, true]
            }
        ];
        expect(validateSolution(invalidSolution)).toBe(false);
    });

    it('should return false for solution with non-boolean values in solutionCells', () => {
        const invalidSolution = [
            {
                cells: ['A', 'B', 'C', 'D', 'E'],
                solutionCells: [true, true, true, true, 'true' as any]
            }
        ];
        expect(validateSolution(invalidSolution)).toBe(false);
    });

    it('should return false for solution with non-string values in cells', () => {
        const invalidSolution = [
            {
                cells: ['A', 'B', 'C', 'D', 1 as any],
                solutionCells: [true, true, true, true, true]
            }
        ];
        expect(validateSolution(invalidSolution)).toBe(false);
    });

    it('should return false for solution with cells length exceeding MAX_LINE_WIDTH', () => {
        const invalidSolution = [
            {
                cells: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
                solutionCells: [true, true, true, true, true, true, true, true, true, true, true]
            }
        ];
        expect(validateSolution(invalidSolution)).toBe(false);
    });
});
