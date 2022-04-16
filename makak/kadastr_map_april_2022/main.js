const geojson = await fetch('./geojson.json').then(json => json.json());

const image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({color: 'red', width: 1}),
});

const styles = {
  'MultiPolygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 1,
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 0, 0, 0.5)',
    }),
  }),
};

const selected = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(0, 200, 0, 1)',
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 200, 0, 0.5)',
    width: 2,
  }),
});

const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

function selectStyle(feature) {
  return selected;
}

console.log(geojson);

const geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:4326',
    },
  },
  'features': geojson.geojson
};

const features2 = new ol.format.GeoJSON().readFeatures(geojsonObject);

features2.forEach(function(feature){
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
});

const vectorSource = new ol.source.Vector({
  features: features2,
});

const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: styleFunction,
});

const select = new ol.interaction.Select({
  style: selectStyle,
});

var map;

function load_map() {
  console.log('Loading');
  map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        title: 'osm',
        visible: true,
        source: new ol.source.OSM(),
      }),
      new ol.layer.Tile({
        title: 'googlesatellite',
        visible: false,
        source: new ol.source.XYZ(
          {url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'}
        )
      }),
      vectorLayer,
    ],
    target: 'map',
    view: new ol.View({
      center: ol.proj.transform([31.788841805119695, 59.914941531405575], 'EPSG:4326','EPSG:3857'),
      zoom: 13,
    }),
  });

  map.addInteraction(select);
  select.on('select', function (e) {
        if (e.target.getFeatures().getLength() > 0) {
          document.getElementById('selected_description').innerHTML =
            "Кадастровый номер: " + e.target.getFeatures().item(0).get('cn') + ", площадь: " + e.target.getFeatures().item(0).get('area_value') + " м2";
        } else {
          document.getElementById('selected_description').innerHTML =
            "Щёлкните на участок";
        }
      });
}

const selectElement = document.getElementById('MapTypeSelect');

function onSelectChange(e) {
  if (e.target.value == 'osm') {
    map.getLayers().forEach(function (layer) {
      if (layer.get('title') == 'osm') {
        layer.setVisible(true);
      } else if (layer.get('title') == 'googlesatellite') {
        layer.setVisible(false);
      }
    });
  } else {
    map.getLayers().forEach(function (layer) {
      if (layer.get('title') == 'osm') {
        layer.setVisible(false);
      } else if (layer.get('title') == 'googlesatellite') {
        layer.setVisible(true);
      }
    });
  }
}

selectElement.addEventListener('change', onSelectChange);

load_map();
