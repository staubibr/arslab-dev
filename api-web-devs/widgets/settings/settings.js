'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import Layers from './layers.js';
import Popup from '../../ui/popup.js';
import Styler from '../../components/styler.js';

export default Core.Templatable("Widget.Settings", class Settings extends Popup { 
	
	set Settings(value) { this.settings = value; }
	
	get Settings() { return this.settings; }

	constructor(id) {
		super(id);
		
		// TODO : Shouldn'T have a series of nested widgets and a weird workaround to get back to original widget
		this.AddWidget("layers", new Layers());
		
		this.original = this.Node("body").Elems(".column-50");
		
		this.Widget("layers").On("close", this.OnLayers_Close.bind(this));
		this.Widget("layers").On("apply", this.OnLayers_Apply.bind(this));
		
		
		this.Node("btnLayers").On("click", this.onLayers_Click.bind(this));
	}
	
	Initialize(simulation, settings) {
		// Dom.SetCss(this.Elem("top"), `settings ${simulation.type}`);
		Dom.SetCss(this.Elem("top"), `settings DEVS Cell-DEVS`);
		Dom.SetCss(this.Elem("top"), `settings DEVS Cell-DEVS`);
		
		this.simulation = simulation;
		this.settings = settings;
		
		// Link UI to setting parameters. Each item requires two delegates, setting is used to update 
		// the settings object from the ui, ui is used to update the ui from the settings object
		this.ui = [
			{ group:"playback", property:"speed", node:"playbackSpeed", setting: el => +el.value, ui: (el,v) => { el.value = v; } },
			{ group:"playback", property:"loop", node:"playbackLoop", setting: el => el.checked, ui: (el,v) => { el.checked = v; } }
		]
		
		if (simulation.Type == "DEVS") this.InitializeDEVS(settings);
		
		else if (simulation.Type == "Cell-DEVS") this.InitializeCellDEVS(settings);
		
		else if (simulation.Type == "Irregular Cell-DEVS") this.InitializeGisDEVS(settings);
		
		// Hook up change event for each ui element, when ui element changes, update corresponding setting
		this.ui.forEach(u => {
			this.Node(u.node).On("change", ev => {
				this.settings[u.group].Set(u.property, u.setting(ev.target));
			});
		})
		
		this.UpdateUI();
	}
	
	InitializeDEVS(settings) {
		this.ui.push({ group:"diagram", property:"height", node:"diagramHeight", setting: el => +el.value, ui: (el,v) => { el.value = v; }});
		this.ui.push({ group:"diagram", property:"width", node:"diagramWidth", setting: el => +el.value, ui: (el,v) => { el.value = v; } });
		this.ui.push({ group:"diagram", property:"aspect", node:"diagramAspect", setting: el => el.checked, ui: (el,v) => { el.checked = v; }});
		
		this.Elem(this.ui[2].node).disabled = this.settings.diagram.aspect;
		
		this.Node(this.ui[4].node).On("change", (ev) => {
			this.Elem(this.ui[2].node).disabled = this.settings.diagram.aspect;
		});
	}
	
	InitializeCellDEVS() {
		// Link UI to setting parameters. Each item requires two delegates, setting is used to update 
		// the settings object from the ui, ui is used to update the ui from the settings object
		this.ui.push({ group:"grid", property:"columns", node:"gridColumns", setting: el => +el.value, ui: (el,v) => { el.value = v; }});
		this.ui.push({ group:"grid", property:"height", node:"gridHeight", setting: el => +el.value, ui: (el,v) => { el.value = v; }});
		this.ui.push({ group:"grid", property:"width", node:"gridWidth", setting: el => +el.value, ui: (el,v) => { el.value = v; }});
		this.ui.push({ group:"grid", property:"spacing", node:"gridSpacing", setting: el => +el.value, ui: (el,v) => { el.value = v; }});
		this.ui.push({ group:"grid", property:"showGrid", node:"gridShowGrid", setting: el => el.checked, ui: (el,v) => { el.checked = v; }});
		this.ui.push({ group:"grid", property:"aspect", node:"gridAspect", setting: el => el.checked, ui: (el,v) => { el.checked = v; }});
		
		this.Elem(this.ui[3].node).disabled = this.settings.grid.aspect;
		
		this.Node(this.ui[7].node).On("change", (ev) => {
			this.Elem(this.ui[3].node).disabled = this.settings.grid.aspect;
		});
	}
	
	InitializeGisDEVS() {
		
	}
	
	UpdateUI() {
		this.ui.forEach(u => {			
			var value = this.settings[u.group][u.property];
			
			u.ui(this.Elem(u.node), value);
		});
	}
	
	onLayers_Click(ev) {
		this.Widget("layers").Initialize(this.simulation, this.settings);
		
		this.Content = this.Widget("layers");
		this.Title = this.nls.Ressource("Settings_Layers");
		this.SetCss(`popup popup-settings popup-layers`);
	}
	
	OnLayers_Apply(ev) {
		this.Settings.styler = Styler.FromJson(ev.styles);
		
		this.Settings.grid.Set("layers", ev.layers);
	}
	
	OnLayers_Close(ev) {		
		this.Empty();
		
		this.original.forEach(c => Dom.Place(c, this.Elem("body")));
		
		this.Title = this.nls.Ressource("Popup_Settings_Title");
		
		this.SetCss(`popup popup-settings`);
	}
	
	Template() {
		return "<div handle='popup' class='popup popup-settings'>" +
				  "<div class='popup-header'>" +
					  "<h2 class='popup-title' handle='title'>nls(Popup_Settings_Title)</h2>" +
					  "<button class='close' handle='close' title='nls(Popup_Close)'>×</button>" +
				  "</div>" +
				  "<div class='popup-body' handle='body'>" + 
				     "<div class='column-50'>" +
					    "<h3 class='settings-group-label Cell-DEVS'>nls(Settings_Grid_Options)</h3>" +
						"<div class='settings-group Cell-DEVS'>" + 
						   "<div class='settings-line'>" +
						      "<label class='settings-label'>nls(Settings_Grid_Width)" +
							     "<input class='settings-value' handle='gridWidth' type='number' min=100></input>" +
							  "</label>" + 
						   "</div>" +
						   "<div class='settings-line'>" +
						 	  "<label class='settings-label'>nls(Settings_Grid_Height)" +
								 "<input class='settings-value' handle='gridHeight' type='number' min=100></input>" +
							  "</label>" + 
						   "</div>" +
						   "<div class='settings-line'>" +
						   	  "<label class='settings-label'>nls(Settings_Grid_Aspect)" +
								 "<input class='settings-value' handle='gridAspect' type='checkbox'></input>" +
						 	  "</label>" + 
						   "</div>" +
						   "<div class='settings-line'>" +
							  "<label class='settings-label'>nls(Settings_Grid_Columns)" +
								 "<input class='settings-value' handle='gridColumns' type='number' min=1 max=4></input>" +
							  "</label>" + 
						   "</div>" +
						   "<div class='settings-line'>" +
							  "<label class='settings-label'>nls(Settings_Grid_Spacing)" +
							 	 "<input class='settings-value' handle='gridSpacing' type='number' min=100></input>" +
							  "</label>" + 
						   "</div>" +
						   "<div class='settings-line' style='display:none;'>" +
							  "<label class='settings-label'>nls(Settings_Grid_ShowGrid)" +
								 "<input class='settings-value' handle='gridShowGrid' type='checkbox' disabled></input>" +
							  "</label>" + 
						   "</div>" +
						   "<div class='settings-button-line Cell-DEVS'>" +
							  "<button handle='btnLayers' class='settings-button'>nls(Settings_Layers)" +
							     "<i class='fas fa-layer-group'></i>" + 
							  "</button>" +
						   "</div>" + 
						"</div>" +
					 "</div>" +
					 "<div class='column-50'>" +
					    "<div handle='top' class='settings'>" +
						   "<h3 class='settings-group-label DEVS'>nls(Settings_Diagram_Options)</h3>" +
						   "<div class='settings-group DEVS'>" + 
							  "<div class='settings-line'>" +
								 "<label class='settings-label'>nls(Settings_Diagram_Width)" +
								    "<input class='settings-value' handle='diagramWidth' type='number' min=300></input>" +
								 "</label>" +
							  "</div>" +
							  "<div class='settings-line'>" +
								 "<label class='settings-label'>nls(Settings_Diagram_Height)" +
									"<input class='settings-value' handle='diagramHeight' type='number' min=300></input>" +
								 "</label>" + 
							  "</div>" +
							  "<div class='settings-line'>" +
								 "<label class='settings-label'>nls(Settings_Diagram_Aspect)" +
									"<input class='settings-value' handle='diagramAspect' type='checkbox'></input>" +
								 "</label>" + 
							  "</div>" +
						   "</div>" +
						   "<h3 class='settings-group-label'>nls(Settings_Playback_Options)</h3>" +
						   "<div class='settings-group'>" + 
							  "<div class='settings-line'>" +
								 "<label class='settings-label'>nls(Settings_Playback_Speed)</label>" +
								    "<input class='settings-value' handle='playbackSpeed' type='number' min=1 max=50></input>" +
								 "</label>" + 
							  "</div>" +
							  "<div class='settings-line'>" +
								 "<label class='settings-label'>nls(Settings_Playback_Loop)" +
									"<input class='settings-value' handle='playbackLoop' type='checkbox'></input>" +
								 "</label>" + 
							  "</div>"+
							  "<div class='settings-line'>" +
								 "<label class='settings-label'>nls(Settings_Playback_Cache)" +
									"<input class='settings-value' handle='playbackCache' type='number' min=10 max=1000 disabled></input>" +
								 "</label>" + 
							  "</div>"+
						   "</div>" +
						"</div>" +
				     "</div>" +
				  "</div>" +
			   "</div>";
	}
	
	static Nls() {
		return {
			"Popup_Close": {
				"en": "Close",
				"fr": "Fermer"
			},
			"Popup_Settings_Title" : {
				"en":"Settings"
			},
			"Settings_Grid_Options" : {
				"en" : "Grid options"
			},
			"Settings_Grid_Width" : {
				"en" : "Width:"
			},
			"Settings_Grid_Height" : {
				"en" : "Height:"
			},
			"Settings_Grid_Aspect" : {
				"en" : "Simulation aspect ratio:"
			},
			"Settings_Grid_Columns" : {
				"en" : "Columns:"
			},
			"Settings_Grid_Spacing" : {
				"en" : "Spacing:"
			},
			"Settings_Grid_ShowGrid" : {
				"en" : "Show grid:"
			},
			"Settings_Layers" : {
				"en" : "Modify grids"
			},
			"Settings_Diagram_Options" : {
				"en" : "Diagram options"
			},
			"Settings_Diagram_Width" : {
				"en" : "Width:"
			},	
			"Settings_Diagram_Height" : {
				"en" : "Height:"
			},
			"Settings_Diagram_Aspect" : {
				"en" : "Simulation aspect ratio:"
			},
			"Settings_Playback_Options" : {
				"en" : "Playback options"
			},	
			"Settings_Playback_Speed" : {
				"en" : "Playback speed:"
			},
			"Settings_Playback_Loop" : {
				"en" : "Loop:"
			},
			"Settings_Playback_Cache" : {
				"en" : "Cache step:"
			}
		}
	}
});