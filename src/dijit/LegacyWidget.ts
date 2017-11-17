/// <reference path="../../node_modules/dojo-typings/dijit/1.11/dijit.d.ts" />
import { Constructor, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { w } from '@dojo/widget-core/d';
import declareDecorator from './declareDecorator';
import * as _WidgetBase from 'dijit/_WidgetBase';

interface WidgetAppProperties extends WidgetProperties {
	widgetProperties: any;
}

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
	moduleId: string;

	private renderPromise: Promise<void>;
	private projector: ProjectorMixin<WidgetProperties> & WidgetAppProperties;

	constructor(params: any) {}

	postCreate() {
		this.renderPromise = new Promise((resolve) => {
			(<any> require)([ this.moduleId ], (WidgetModule: any) => {
				const WidgetConstructor: Constructor<WidgetBase<WidgetProperties>> = WidgetModule.default;
				const Projector = ProjectorMixin(WidgetApp);
				const projector = this.projector = new Projector(WidgetConstructor, this);
				// Append the projector to this.domNode (versus replace) so the domNode can be moved around
				// by placeAt.
				projector.append(this.domNode);
				resolve();
			});
		});

		this.watch(() => {
			this.projector && this.projector.invalidate();
		})
	}

	startup() {
		return this.renderPromise;
	}
}

export default LegacyWidget;
