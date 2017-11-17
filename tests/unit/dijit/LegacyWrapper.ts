// Note: this test is designed to run with the Dojo 1 loader.
const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import LegacyWrapper from '../../../src/dijit/LegacyWrapper';

let sandbox: Element;
let widget: LegacyWrapper | null;

registerSuite('dijit/LegacyWrapper', {
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
			widget = new LegacyWrapper({
				module: 'tests/unit/dijit/TestDojo2Widget'
			});
			widget.placeAt(sandbox);

			const dfd = this.async();
			setTimeout(dfd.callback(() => {
				assert.strictEqual(1, sandbox.childNodes.length);
				assert.strictEqual('button', sandbox.firstChild && sandbox.firstChild.nodeName.toLowerCase());
			}), 50);
		}
	}
});
