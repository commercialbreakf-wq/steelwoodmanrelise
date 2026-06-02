/**
 * Simulation test for inline price calculation logic.
 * This verifies the math used in the frontend implementation.
 */

function calculateNewUnitPrice(newPriceTon, weightKg) {
    const weight = parseFloat(weightKg) || 0;
    return weight ? (newPriceTon / 1000) * weight : 0;
}

const testCases = [
    { ton: 100000, weight: 1.5, expected: 150 },
    { ton: 50000, weight: 10, expected: 500 },
    { ton: 200000, weight: 0.5, expected: 100 },
    { ton: 100000, weight: 0, expected: 0 }
];

let failed = false;
testCases.forEach((tc, i) => {
    const result = calculateNewUnitPrice(tc.ton, tc.weight);
    if (result !== tc.expected) {
        console.error(`Test Case ${i} Failed: Expected ${tc.expected}, got ${result}`);
        failed = true;
    } else {
        console.log(`Test Case ${i} Passed: ${tc.ton} per ton, ${tc.weight} kg -> ${result} per unit`);
    }
});

if (failed) {
    process.exit(1);
} else {
    console.log("All calculation logic tests passed!");
}
