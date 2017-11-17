/// <reference path="../../node_modules/dojo-typings/dijit/1.11/dijit.d.ts" />
import { Constructor, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { mixin } from '@dojo/core/lang';
import declareDecorator from './declareDecorator';
import * as _WidgetBase from 'dijit/_WidgetBase';

interface LegacyWidget extends dijit._WidgetBase {
	module: string;
	projector: ProjectorMixin<WidgetProperties>;
	reference: dojo.NodeFragmentOrString | dijit._WidgetBase;
	nodePosition: string | number | undefined;
}

@declareDecorator(_WidgetBase)
class LegacyWidget {

	reference: dojo.NodeFragmentOrString | dijit._WidgetBase;

	constructor(params: any) {
		const module: string = params.module;
		if (!module) {
			throw new Error('"module" property must be set.');
		}
		const widgetParams = mixin({}, params);
		delete widgetParams.module;
		mixin(this, widgetParams);

		(<any> require)([ module ], (WidgetModule: any) => {
			const WidgetConstructor: Constructor<WidgetBase<WidgetProperties>> = WidgetModule.default;
			const Projector = ProjectorMixin(WidgetConstructor);
			this.projector = new Projector(widgetParams);
			if (this.reference) {
				this.placeAt(this.reference, this.nodePosition);
			}
		});
	}

	placeAt(reference: dojo.NodeFragmentOrString | dijit._WidgetBase, position?: string | number): this {
		if (!this.projector) {
			// The widget module hasn't loaded yet.  When the require statement resolves,
			// the widget will be positioned.
			this.reference = reference;
			this.nodePosition = position;
		} else {
			(<any> this).__proto__.__proto__.placeAt.call(this, reference, position);
			this.projector.replace(this.domNode);
		}
		return this;
	}
}

export default LegacyWidget;
