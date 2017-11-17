/// <reference path="../../node_modules/dojo-typings/dijit/1.11/dijit.d.ts" />
import { Constructor, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { mixin } from '@dojo/core/lang';
import { w } from '@dojo/widget-core/d';
import declareDecorator from './declareDecorator';
import * as _WidgetBase from 'dijit/_WidgetBase';

class WidgetApp extends WidgetBase<WidgetProperties> {
	widgetConstructor: Constructor<WidgetBase<WidgetProperties>>;
	widgetProperties: any;

	constructor(widgetConstructor: Constructor<WidgetBase<WidgetProperties>>, widgetProperties: any) {
		super();
		this.widgetConstructor = widgetConstructor;
		this.widgetProperties = widgetProperties;
	}

	render() {
		return w(this.widgetConstructor, this.widgetProperties);
	}
}

interface LegacyWidget extends dijit._WidgetBase {}

@declareDecorator(_WidgetBase)
class LegacyWidget {
	widgetParams: any;
	moduleId: string;
	renderPromise: Promise<void>;

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
		this.renderPromise = new Promise((resolve) => {
			(<any> require)([ this.moduleId ], (WidgetModule: any) => {
				const WidgetConstructor: Constructor<WidgetBase<WidgetProperties>> = WidgetModule.default;
				const Projector = ProjectorMixin(WidgetApp);
				const projector = new Projector(WidgetConstructor, this.widgetParams);
				// Append the projector to this.domNode (versus replace) so the domNode can be moved around
				// by placeAt.
				projector.append(this.domNode);
				resolve();
			});
		});
	}

	startup() {
		return this.renderPromise;
	}
}

export default LegacyWidget;
