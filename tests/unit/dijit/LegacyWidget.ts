// Note: this test is designed to run with the Dojo 1 loader.
const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import LegacyWidget from '../../../src/dijit/LegacyWidget';

let sandbox: Element;
let widget: LegacyWidget;

registerSuite('dijit/LegacyWidget', {
	beforeEach: function () {
		sandbox = document.createElement('div');
		sandbox.id = 'sandbox';
		document.body.appendChild(sandbox);
	},

	afterEach: function () {
		widget && widget.destroy();
	},

	tests: {
		'widget should render'() {
			widget = new LegacyWidget({
				moduleId: 'tests/unit/dijit/TestDojo2Widget',
				label: 'Hello World!'
			});
			widget.placeAt(sandbox);
			return widget.startup().then(() => {
				assert.strictEqual(1, sandbox.childNodes.length);
				let firstChild = sandbox.firstChild;
				assert.strictEqual('div', firstChild && firstChild.nodeName.toLowerCase());
				firstChild = firstChild && firstChild.firstChild;
				assert.strictEqual('button', firstChild && firstChild.nodeName.toLowerCase());
				assert.strictEqual('Hello World!', firstChild && firstChild.textContent);
			});
		},

		'widget should move within the DOM'() {
			const node1 = document.createElement('div');
			const node2 = document.createElement('div');
			sandbox.appendChild(node1);
			sandbox.appendChild(node2);

			widget = new LegacyWidget({
				moduleId: 'tests/unit/dijit/TestDojo2Widget',
				label: 'Hello!'
			});
			widget.placeAt(node1);
			return widget.startup().then(() => {
				assert.strictEqual(1, node1.childNodes.length, 'node1 has no children');
				let firstChild = node1.firstChild;
				assert.strictEqual('div', firstChild && firstChild.nodeName.toLowerCase());
				firstChild = firstChild && firstChild.firstChild;
				assert.strictEqual('button', firstChild && firstChild.nodeName.toLowerCase());
				assert.strictEqual(0, node2.childNodes.length, 'node2 has children that it should not');

				widget.placeAt(node2);
				assert.strictEqual(0, node1.childNodes.length, 'widget did not move away from node1');
				assert.strictEqual(1, node2.childNodes.length, 'widget did not move to node2');
				firstChild = node2.firstChild;
				assert.strictEqual('div', firstChild && firstChild.nodeName.toLowerCase());
				firstChild = firstChild && firstChild.firstChild;
				assert.strictEqual('button', firstChild && firstChild.nodeName.toLowerCase());
			});
		},

		'widget should update when a property changes'() {
			widget = new LegacyWidget({
				moduleId: 'tests/unit/dijit/TestDojo2Widget',
				label: 'Hello World!'
			});
			widget.placeAt(sandbox);

			const dfd = this.async();
			widget.startup().then(dfd.rejectOnError(() => {
				widget.set('label', 'Goodbye');
				let firstChild = sandbox.firstChild && sandbox.firstChild.firstChild;
				setTimeout(dfd.rejectOnError(() => {
					assert.strictEqual('Goodbye', firstChild && firstChild.textContent);
					dfd.resolve();
				}), 100);
			}));
		}
	}
});
