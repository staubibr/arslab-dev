'use strict';

import Core from '../../basic-tools/tools/core.js';
import Dom from '../../basic-tools/tools/dom.js';
import Evented from '../../basic-tools/components/evented.js';

export default class Automator { 
	
	get Simulation() { return this.simulation; }
	
	get Widget() { return this.widget; }

	constructor(widget, simulation) {		
		this.simulation = simulation;
		this.widget = widget;
		this.handles = [];
	}

	Handle(handles) {
		this.handles = this.handles.concat(handles);
	}
	
	Destroy() {
		this.handles.forEach((h) => {
			h.target.Off(h.type, h.callback);
		});
		
		this.simulation = null;
		this.widget = null;
		this.handles = null;
	}
	
	Redraw() {
		
	}
};