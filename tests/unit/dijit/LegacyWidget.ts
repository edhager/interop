// Note: this test is designed to run with the Dojo 1 loader.
const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import LegacyWidget from '../../../src/dijit/LegacyWidget';

let sandbox: Element;
let widget: LegacyWidget | null;

registerSuite('dijit/LegacyWidget', {
	beforeEach: function () {
		sandbox = document.createElement('div');
		sandbox.id = 'sandbox';
		document.body.appendChild(sandbox);
	},

	afterEach: function () {
		widget && widget.destroy();
		widget = null;
	},

	tests: {
		'wrap a widget'() {
			widget = new LegacyWidget({
				moduleId: 'tests/unit/dijit/TestDojo2Widget'
			});
			widget.placeAt(sandbox);

			const dfd = this.async();
			setTimeout(dfd.callback(() => {
				assert.strictEqual(1, sandbox.childNodes.length);
				let firstChild = sandbox.firstChild;
				assert.strictEqual('div', firstChild && firstChild.nodeName.toLowerCase());
				firstChild = firstChild && firstChild.firstChild;
				assert.strictEqual('button', firstChild && firstChild.nodeName.toLowerCase());
			}), 50);
		}
	}
});
