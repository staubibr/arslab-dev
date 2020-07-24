"use strict";

import Core from "../../api-web-devs/tools/core.js";
import Templated from "../../api-web-devs/components/templated.js";
import InitialLayer from "../classes/InitialLayer.js";

export default Core.Templatable(
  "Widget.Map",
  class Map extends Templated {
    get Map() {
      return this.map;
    }

    constructor(container) {
      super(container);

      this.layers = {};
    }

    InitTileLayer() {
      var layer = new ol.layer.Tile({
        source: new ol.source.OSM(),
        noWrap: true,
        wrapX: false,
        title: "OSMStandard",
      });

      // new ol.Map equivalent to addLayer
      this.map = new InitialLayer(layer, this.Elem("map-container"));

      var checkbox = document.querySelector("#checkbox");
      checkbox.addEventListener("change", function () {
        var checked = this.checked;
        if (checked !== layer.getVisible()) {
          layer.setVisible(checked);
        }
      });

      return this.map;
    }

    Layer(id) {
      return this.layers[id];
    }

    AddLayer(id, layer) {
      this.layers[id] = layer;

      this.map.OL.addLayer(layer.OL);
    }

    // https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
    AddLayer(id, layer, layerObjects) {
      this.layers[id] = layer;
      for (var l in layerObjects) {
        if (id == l) {
          this.map.OL.removeLayer(this.layers[id].OL);
        }
      }
      this.map.OL.addLayer(layer.OL);
    }

    Template() {
      return (
        "<div style='display: flex;flex-direction: row; text-align: center'>" +
        "<input type='checkbox' id='checkbox' checked> Show World Map</input>" +
        "</div>" +
        "<div handle='map-container' class='map-container'></div>"
      );
    }
  }
);
