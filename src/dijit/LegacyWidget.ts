/// <reference path="../../node_modules/dojo-typings/dijit/1.11/dijit.d.ts" />
import { Constructor, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { mixin } from '@dojo/core/lang';
import declareDecorator from './declareDecorator';
import * as _WidgetBase from 'dijit/_WidgetBase';

interface LegacyWidget extends dijit._WidgetBase {
	widgetParams: any;
	moduleId: string;
}

@declareDecorator(_WidgetBase)
class LegacyWidget {

	widgetParams: any;
	moduleId: string;

	constructor(params: any) {
		const moduleId: string = params.moduleId;
		if (!moduleId) {
			throw new Error('"moduleId" property must be set.');
		}
		const widgetParams = this.widgetParams = mixin({}, params);
		delete widgetParams.moduleId;
		mixin(this, widgetParams);
	}

	postCreate() {
		(<any> require)([ this.moduleId ], (WidgetModule: any) => {
			const WidgetConstructor: Constructor<WidgetBase<WidgetProperties>> = WidgetModule.default;
			const Projector = ProjectorMixin(WidgetConstructor);
			const projector = new Projector(this.widgetParams);
			// Append the projector to this.domNode (versus replace) so the domNode can be moved around
			// by placeAt.
			projector.append(this.domNode);
		});
	}
}

export default LegacyWidget;
