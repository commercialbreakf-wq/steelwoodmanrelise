/**
 * Basic tests for AdminState
 */
import { state } from '../../js/admin/state.js';
import assert from 'assert';

// Mock fetch for tests
global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
});

async function runTests() {
    console.log('Testing AdminState...');

    // Test 1: Initial state
    assert.strictEqual(state.products.length, 0, 'Products should be empty initially');
    assert.strictEqual(state.loading, false, 'Loading should be false initially');

    // Test 2: Event Emitting
    let eventFired = false;
    let receivedData = null;
    state.on('test:event', (data) => {
        eventFired = true;
        receivedData = data;
    });

    state.emit('test:event', { foo: 'bar' });
    assert.strictEqual(eventFired, true, 'Event should fire');
    assert.deepStrictEqual(receivedData, { foo: 'bar' }, 'Event data should match');

    // Test 3: Unsubscribe
    let counter = 0;
    const unsub = state.on('inc', () => counter++);
    state.emit('inc');
    assert.strictEqual(counter, 1, 'Counter should be 1');
    unsub();
    state.emit('inc');
    assert.strictEqual(counter, 1, 'Counter should still be 1 after unsubscribe');

    // Test 4: Loading state
    let loadingState = false;
    state.on('loading', (val) => loadingState = val);
    state.setLoading(true);
    assert.strictEqual(loadingState, true, 'Loading state should be true');
    assert.strictEqual(state.loading, true);

    console.log('✅ AdminState tests passed!');
}

runTests().catch(err => {
    console.error('❌ Tests failed:');
    console.error(err);
    process.exit(1);
});
