'use strict';

describe('leaflet util', function() {

	var leafletUtilService;

	beforeEach(module('asymmetrik.util'));

	beforeEach(inject(function (_leafletUtilService_) {
		leafletUtilService = _leafletUtilService_;
	}));

	it('null bounds', function() {
		var bounds = leafletUtilService.geoJsonToBounds(null);
		expect(bounds).toEqual(null);
	});

	it('simple bounds detection', function() {

		var geo = {
			'type':'Polygon',
			'coordinates':[ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 5, 6 ],
					[ 2, 1 ]
			] ]
		};

		var bounds = leafletUtilService.geoJsonToBounds(geo);

		// should handle no provided scale value
		expect(bounds._northEast.lat).toEqual(6);
		expect(bounds._northEast.lng).toEqual(5);
		expect(bounds._southWest.lat).toEqual(1);
		expect(bounds._southWest.lng).toEqual(2);

	});

	it('bounds detection with invalid scale', function() {
		var geo = {
			'type':'Polygon',
			'coordinates':[ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 5, 6 ],
					[ 2, 1 ]
			] ]
		};

		var bounds = leafletUtilService.geoJsonToBounds(geo, 0.5);

		// should ignore scale value less than 1
		expect(bounds._northEast.lat).toEqual(6);
		expect(bounds._northEast.lng).toEqual(5);
		expect(bounds._southWest.lat).toEqual(1);
		expect(bounds._southWest.lng).toEqual(2);
	});

	it('bounds detection with negative scale', function() {
		var geo = {
			'type':'Polygon',
			'coordinates':[ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 5, 6 ],
					[ 2, 1 ]
			] ]
		};

		var bounds = leafletUtilService.geoJsonToBounds(geo, -3);

		// should ignore negative scale value
		expect(bounds._northEast.lat).toEqual(6);
		expect(bounds._northEast.lng).toEqual(5);
		expect(bounds._southWest.lat).toEqual(1);
		expect(bounds._southWest.lng).toEqual(2);
	});

	it('bounds detection with scale', function() {
		var geo = {
			'type':'Polygon',
			'coordinates':[ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 5, 6 ],
					[ 2, 1 ]
			] ]
		};

		var bounds = leafletUtilService.geoJsonToBounds(geo, 1.5);

		expect(bounds._northEast.lat).toEqual(8.5);  // 6 + ((6 - 1) * 0.5)
		expect(bounds._northEast.lng).toEqual(6.5);  // 5 + ((5 - 2) * 0.5)
		expect(bounds._southWest.lat).toEqual(-1.5); // 1 - ((6 - 1) * 0.5)
		expect(bounds._southWest.lng).toEqual(0.5);  // 2 - ((5 - 2) * 0.5)
	});

	it('format polygon as leaflet json', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 7, 6 ]
			] ]
		};

		var json = leafletUtilService.geoJsonToLeafletJson(geo);

		expect(json.type).toEqual('polygon');
		expect(json.latlngs[0][0].lng).toEqual(2);
		expect(json.latlngs[0][0].lat).toEqual(1);
		expect(json.latlngs[0][1].lng).toEqual(5);
		expect(json.latlngs[0][1].lat).toEqual(1);
		expect(json.latlngs[0][2].lng).toEqual(7);
		expect(json.latlngs[0][2].lat).toEqual(6);

	});

	it('format rectangle as leaflet json', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 6, 1 ],
					[ 6, 5 ],
					[ 2, 5 ],
					[ 2, 1 ]
			] ]
		};

		var json = leafletUtilService.geoJsonToLeafletJson(geo);
		expect(json.type).toEqual('rectangle');
		expect(json.northEast.lng).toEqual(6);
		expect(json.northEast.lat).toEqual(5);
		expect(json.southWest.lng).toEqual(2);
		expect(json.southWest.lat).toEqual(1);
	});

	it('format geo rectangle as leaflet json', function() {
		// Rectangle covering most of Utah State
		var geo = {
			type: 'Polygon',
			'coordinates': [ [
				[-108.04504394531249, 42.147114459221015],
				[-108.04504394531249, 36.65079252503468],
				[-115.14221191406249, 36.65079252503468],
				[-115.14221191406249, 42.147114459221015],
				[-108.04504394531249, 42.147114459221015]
			] ]
		};

		var json = leafletUtilService.geoJsonToLeafletJson(geo);
		expect(json.type).toEqual('rectangle');
		expect(json.northEast.lng).toEqual(-108.04504394531249);
		expect(json.northEast.lat).toEqual(42.147114459221015);
		expect(json.southWest.lng).toEqual(-115.14221191406249);
		expect(json.southWest.lat).toEqual(36.65079252503468);
	});

	it('format polygon as leaflet json', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 5, 6 ],
					[ 2, 1 ]
			] ]
		};

		var json = leafletUtilService.geoJsonToLeafletJson(geo);
		expect(json.type).toEqual('polygon');

		expect(json.latlngs[0].length).toEqual(4);

		expect(json.latlngs[0][0].lng).toEqual(2);
		expect(json.latlngs[0][0].lat).toEqual(1);

		expect(json.latlngs[0][1].lng).toEqual(5);
		expect(json.latlngs[0][1].lat).toEqual(1);

		expect(json.latlngs[0][2].lng).toEqual(5);
		expect(json.latlngs[0][2].lat).toEqual(6);

		expect(json.latlngs[0][3].lng).toEqual(2);
		expect(json.latlngs[0][3].lat).toEqual(1);
	});

	it('rectangle area calculation', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 6, 1 ],
					[ 6, 5 ],
					[ 2, 5 ],
					[ 2, 1 ]
			] ]
		};

		var area = leafletUtilService.geoJsonToArea(geo);
		/*
		 * Contrary, a geo website from 2011 says this area is actually 196723266388.67. Close enough?
		 * http://geographiclib.sourceforge.net/scripts/geod-calc.html
		 */
		expect(area).toEqual(197960531766.03564);
	});

	it('polygon area calculation', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 6, 1 ],
					[ 6, 5 ],
					[ 2, 1 ]
			] ]
		};

		var area = leafletUtilService.geoJsonToArea(geo);
		/*
		 * Contrary, a geo website from 2011 says this area is actually 98540666355.20. Close enough?
		 * http://geographiclib.sourceforge.net/scripts/geod-calc.html
		 */
		expect(area).toEqual(98980265883.01782);
	});

	it('rectangle filter', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 6, 1 ],
					[ 6, 5 ],
					[ 2, 5 ],
					[ 2, 1 ]
			] ]
		};

		var filter = leafletUtilService.geoJsonToLeafletJson(geo);
		expect(filter.type).toEqual('rectangle');
		expect(filter.northEast.lng).toEqual(6);
		expect(filter.northEast.lat).toEqual(5);
		expect(filter.southWest.lng).toEqual(2);
		expect(filter.southWest.lat).toEqual(1);
	});

	it('polygon filter', function() {
		var geo = {
			'type': 'Polygon',
			'coordinates': [ [
					[ 2, 1 ],
					[ 5, 1 ],
					[ 5, 6 ],
					[ 2, 1 ]
			] ]
		};

		var filter = leafletUtilService.geoJsonToLeafletJson(geo);
		expect(filter.type).toEqual('polygon');

		var ll = filter.latlngs[0];

		expect(ll.length).toEqual(4);

		expect(ll[0].lng).toEqual(2);
		expect(ll[0].lat).toEqual(1);

		expect(ll[1].lng).toEqual(5);
		expect(ll[1].lat).toEqual(1);

		expect(ll[2].lng).toEqual(5);
		expect(ll[2].lat).toEqual(6);

		expect(ll[3].lng).toEqual(2);
		expect(ll[3].lat).toEqual(1);

	});

	it('polygon leaflet to geojson', function() {
		var leaflet = {
			'type': 'polygon',
			'latlngs': [
				{ lng: 2, lat: 1 },
				{ lng: 5, lat: 4 },
				{ lng: 6, lat: 8 }
			]
		};

		var geojson = leafletUtilService.leafletJsonToGeoJson(leaflet);
		expect(geojson.type).toEqual('Polygon');
		expect(geojson.coordinates[0].length).toEqual(4);

		expect(geojson.coordinates[0][0][0]).toEqual(2);
		expect(geojson.coordinates[0][0][1]).toEqual(1);

		expect(geojson.coordinates[0][1][0]).toEqual(5);
		expect(geojson.coordinates[0][1][1]).toEqual(4);

		expect(geojson.coordinates[0][2][0]).toEqual(6);
		expect(geojson.coordinates[0][2][1]).toEqual(8);

		expect(geojson.coordinates[0][3][0]).toEqual(2);
		expect(geojson.coordinates[0][3][1]).toEqual(1);
	});

	it('rectangle leaflet to geojson', function() {
		var leaflet = {
			'type': 'rectangle',
			'northEast': { lng: 20, lat: 23 },
			'southWest': { lng: 8, lat: 13 }
		};

		/*
		 * Rectangle to Polygon point conversion is ordered as:
		 * 
		 * 2 . . 3
		 * .     .
		 * .     .
		 * 1 . . 4
		 * 
		 * and should be closed with a final coordinate at the SW point
		 */

		var geojson = leafletUtilService.leafletJsonToGeoJson(leaflet);
		expect(geojson.type).toEqual('Polygon');
		expect(geojson.coordinates[0].length).toEqual(5);

		expect(geojson.coordinates[0][0][0]).toEqual(8);
		expect(geojson.coordinates[0][0][1]).toEqual(13);

		expect(geojson.coordinates[0][1][0]).toEqual(8);
		expect(geojson.coordinates[0][1][1]).toEqual(23);

		expect(geojson.coordinates[0][2][0]).toEqual(20);
		expect(geojson.coordinates[0][2][1]).toEqual(23);

		expect(geojson.coordinates[0][3][0]).toEqual(20);
		expect(geojson.coordinates[0][3][1]).toEqual(13);

		expect(geojson.coordinates[0][4][0]).toEqual(8);
		expect(geojson.coordinates[0][4][1]).toEqual(13);
	});

	it('format circle as leaflet json', function() {
		var geo = {
			'type': 'Point',
			'coordinates': [ 2, 1 ],
			'properties': {
				radius: 5
			}
		};

		var json = leafletUtilService.geoJsonToLeafletJson(geo);

		expect(json.type).toEqual('circle');
		expect(json.center.lat).toEqual(1);
		expect(json.center.lng).toEqual(2);
		expect(json.radius).toEqual(5);
	});

	it('circle leaflet to geojson', function() {
		var leaflet = {
			type: 'circle',
			center: {
				lat: 2,
				lng: 1
			},
			radius: 5
		};

		var geojson = leafletUtilService.leafletJsonToGeoJson(leaflet);

		expect(geojson.type).toEqual('Point');
		expect(geojson.coordinates.length).toEqual(2);

		expect(geojson.coordinates[0]).toEqual(1);
		expect(geojson.coordinates[1]).toEqual(2);
		expect(geojson.properties).not.toEqual(null);
		expect(geojson.properties.radius).toEqual(5);
	});
});