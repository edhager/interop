import { Constructor, WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { mixin } from '@dojo/core/lang';

export type NodeReference = Node | string | undefined;

export class LegacyWrapper {
	private projector: ProjectorMixin<WidgetProperties>;
	private srcNodeRef: NodeReference;
	private nodePosition: string | undefined;

	constructor(params: any, srcNodeRef?: NodeReference) {
		const module: string = params.module;
		if (!module) {
			throw new Error('"module" property must be set.');
		}
		this.srcNodeRef = srcNodeRef;
		this.nodePosition = 'replace';
		const widgetParams = mixin({}, params);
		delete widgetParams.module;
		// This module is designed to run in Dojo 1 which has an AMD loader.
		(<any> require)([ module ], (WidgetModule: any) => {
			const WidgetConstructor: Constructor<WidgetBase<WidgetProperties>> = WidgetModule.default;
			const Projector = ProjectorMixin(WidgetConstructor);
			this.projector = new Projector(widgetParams);
			if (this.srcNodeRef) {
				this.placeAt(this.srcNodeRef, this.nodePosition);
			}
		});
	}

	placeAt(reference: NodeReference, position?: string): this {
		if (!this.projector) {
			// The widget module hasn't loaded yet.  When the require statement resolves,
			// the widget will be positioned.
			this.srcNodeRef = reference;
			this.nodePosition = position;
			return this;
		}

		let refNode = getElementNode(reference);
		let placementNode: Element = document.createElement('div');
		if (refNode == null) {
			refNode = document.body;
		}
		if (position == null) {
			position = 'last';
		}
		if (position === 'replace') {
			if (refNode.nodeType === document.ELEMENT_NODE) {
				placementNode = <Element> refNode;
			} else {
				refNode.appendChild(placementNode);
			}
		} else if (position === 'before' || position === 'after') {
			if (refNode.parentNode == null) {
				refNode.appendChild(placementNode);
			} else {
				if (position === 'before') {
					insertBefore(placementNode, refNode);
				} else {
					insertAfter(placementNode, refNode);
				}
			}
		} else {
			if (position === 'only') {
				removeChildren(refNode);
				position = 'last';
			}
			if (position === 'last' || refNode.firstChild == null) {
				refNode.appendChild(placementNode);
			} else {
				insertBefore(placementNode, refNode.firstChild);
			}
		}
		this.projector.replace(placementNode);
		return this;
	}

	destroy() {
		// todo remove from registry
	}

	destroyRecursive() {
		this.destroy();
	}
}

export default LegacyWrapper;

function getElementNode(reference: NodeReference): Node | null | undefined {
	let refNode;
	if (typeof reference === 'string') {
		refNode = document.getElementById(reference);
	} else {
		refNode = reference;
	}
	return refNode;
}

function insertBefore(node: Node, refNode: Node) {
	const parent = refNode.parentNode;
	if (parent) {
		parent.insertBefore(node, refNode);
	}
}

function insertAfter(node: Node, refNode: Node) {
	const parent = refNode.parentNode;
	if (parent) {
		const nextSibling = refNode.nextSibling;
		if (nextSibling == null) {
			parent.appendChild(node);
		} else {
			insertBefore(node, nextSibling);
		}
	}
}

function removeChildren(node: Node) {
	let childNode;
	while ((childNode = node.lastChild)) {
		node.removeChild(childNode);
	}
}
