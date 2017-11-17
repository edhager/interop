import WidgetBase from '@dojo/widget-core/WidgetBase';
import { DNode, WidgetProperties } from '@dojo/widget-core/interfaces';
import { v } from '@dojo/widget-core/d';

export interface TestDojo2WidgetProperties extends WidgetProperties {
	label: string;
}

export default class TestDojo2Widget extends WidgetBase<TestDojo2WidgetProperties> {
	render(): DNode {
		const {
			label
		} = this.properties;
		return v('button', [ label ]);
	}
}
