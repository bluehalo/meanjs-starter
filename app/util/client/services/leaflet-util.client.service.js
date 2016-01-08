'use strict';

angular.module('asymmetrik.util').service('leafletUtilService', ['$q', '$log', function( $q, $log ) {
	
	/**
	 * Converts nested arrays of coordinates to Leaflet's defined 'lat' and 'lng' attributes
	 */
	var coordinatesToLatLng = function(coordinates) {
		// If this is an array of coordinates, reformat it
		if (coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
			return {
				lng: coordinates[0],
				lat: coordinates[1]
			};
		}
		// Otherwise, it's a coordinate list; call this function recursively for every sub-list.
		return coordinates.map(coordinatesToLatLng);
	};

	var boundsToLatLngArray = function(bounds) {
		return [
			bounds.getNorthEast(),
			bounds.getSouthEast(),
			bounds.getSouthWest(),
			bounds.getNorthWest(),
			bounds.getNorthEast()
		];
	};

	/**
	 * Builds a Leaflet feature based on a leaflet JSON object.
	 *
	 * @param {Object} leafletJson A leaflet JSON object
	 * @param {Object} style Optionally, styles to pass to the feature
	 * @returns {L.Path} A leaflet feature.
	 */
	var leafletJsonToFeature = function(leafletJson, style) {
		if (null == leafletJson || null == leafletJson.type) {
			return null;
		}
		switch (leafletJson.type) {
			case 'circle':
				return new L.Circle( leafletJson.center, leafletJson.radius, style );

			case 'rectangle':
				return new L.Rectangle( L.latLngBounds(leafletJson.southWest, leafletJson.northEast), style );

			default:
				return new L[leafletJson.type]( leafletJson.latlngs, style );
		}
	};

	/**
	 * Exports the GeoJSON object for a leaflet feature.
	 *
	 * @param {L.Path} feature A leaflet feature: L.Circle, L.Rectangle or L.Polygon
	 * @returns {Object} A GeoJSON object
	 */
	var featureToGeoJson = function(feature) {
		if (null == feature) {
			return null;
		}
		var geo = feature.toGeoJSON().geometry;

		// Extra handling for circles
		if (null != feature.getRadius) {
			geo.properties = {
				radius: feature.getRadius()
			};
		}
		return geo;
	};

	/**
	 * Returns a user-editable Leaflet Filter feature. If the input polygon is
	 * determined to be a rectangle, returns the L.FilterRectangle instead of a polygon
	 * to allow for a more seamless user experience during editing.
	 *
	 * @param {Object} geojson A GeoJSON object
	 * @returns {Object} A leaflet JSON object
	 */
	var geoJsonToLeafletJson = function(geojson) {
		if (null == geojson || null == geojson.type) {
			return null;
		}
		var data = {};
		var leafletType = geojson.type.toLowerCase();

		// Reformat the coordinates into Leaflet format
		var latlngs = coordinatesToLatLng(geojson.coordinates);
		
		/*
		 * Treats circles differently by retrieving the radius from the properties
		 */
		if (leafletType === 'point' && null != geojson.properties && null != geojson.properties.radius) {
			data.type = 'circle';
			data.center = latlngs;
			data.radius = geojson.properties.radius;
		}
		/*
		 * Treats rectangles differently by ignoring coordinates
		 * in favor of NE and SW corner points
		 */
		else if (isRectangle(geojson)) {
			data.type = 'rectangle';

			var feature = new L[leafletType](latlngs);
			var bounds = feature.getBounds();

			data.northEast = { lat: bounds.getNorth(), lng: bounds.getEast() };
			data.southWest = { lat: bounds.getSouth(), lng: bounds.getWest() };
			data.latlngs = latlngs;
		}
		else {
			data.type = leafletType;
			/*
			 * All other types take coordinates and format to {lat: Y, lng: X}
			 */
			data.latlngs = latlngs;
		}
		
		return data;
	};

	/**
	 * Converts Leaflet JSON to GeoJSON, by converting first to a feature.
	 *
	 * @param {Object} leafletJson A leaflet JSON object
	 * @returns {Object} A GeoJSON object
	 */
	var leafletJsonToGeoJson = function(leafletJson) {
		return featureToGeoJson(leafletJsonToFeature(leafletJson));
	};

	/**
	 * Converts a GeoJSON objects to a leaflet feature, by converting first to leaflet JSON format.
	 *
	 * @param {Object} geojson A GeoJSON object
	 * @returns {L.Path} A Leaflet feature: circle, rectangle or polygon
	 */
	var geoJsonToFeature = function(geojson, style) {
		return leafletJsonToFeature(geoJsonToLeafletJson(geojson), style);
	};
	
	/**
	 * Calculates the area of the GeoJSON entry by converting it
	 * to Leaflet format, then running Leaflet's geodesicArea method
	 *
	 * @param {Object} geojson A GeoJSON object
	 * @returns {Number} The area of the region, in square meters
	 */
	var geoJsonToArea = function(geojson) {
		return leafletJsonToArea(geoJsonToLeafletJson(geojson));
	};

	/**
	 * Calculates the area of a Leaflet JSON object by running Leaflet's geodesicArea method.
	 *
	 * @param {Object} leafletJson A Leaflet JSON object
	 * @returns {Number} The area of the region, in square meters
	 */
	var leafletJsonToArea = function(leafletJson) {
		if (null == leafletJson || null == leafletJson.type) {
			return null;
		}
		switch (leafletJson.type) {
			case 'rectangle':
			case 'polygon':
				return L.GeometryUtil.geodesicArea(leafletJson.latlngs[0]);

			case 'circle':
				var feature = leafletJsonToFeature(leafletJson);
				var coordinates = boundsToLatLngArray(feature.getBounds());
				return L.GeometryUtil.geodesicArea(coordinates) / 4 * Math.PI;
		}
		return null;
	};
	
	/**
	 * Uses Leaflet's API to input a shape and generate
	 * the bounds from that shape in order to automatically
	 * support complex polygons.
	 *
	 * @param {Object} geojson A GeoJSON object
	 * @param {Number} scale The scaling factor.  This only makes sense if it is greater than 1.
	 * @returns {L.LatLngBounds} A set of bounds
	 */
	var geoJsonToBounds = function(geojson, scale) {
		if (null == geojson || null == geojson.type) {
			return null;
		}
		var feature = geoJsonToFeature(geojson);
		var bounds = feature.getBounds();
		
		// Only scale up. don't allow for scaling down
		if (null != scale && scale >= 1) {
			scale = (scale - 1);
			
			var e = bounds.getEast(),
				n = bounds.getNorth(),
				w = bounds.getWest(),
				s = bounds.getSouth();
			
			var height = Math.abs( n - s ),
				width = Math.abs( e - w );
			
			var neScaled = {
					lng: e + (scale * width ),
					lat: n + (scale * height)
				},
				swScaled = {
					lng: w - (scale * width ),
					lat: s - (scale * height)
				};
			
			bounds = new L.LatLngBounds(neScaled, swScaled);
		}
		return bounds;
	};
	
	/**
	 * Determines if the shape is a rectangle. Boolean response.
	 */
	var isRectangle = function(shape) {
		var coords = (null != shape && null != shape.coordinates && shape.coordinates.length > 0)? shape.coordinates[0] : [];

		var isRect = false;
		if(coords.length === 4 || coords.length === 5) {
			/*
			 * Compare the area of the feature to the area of the bounds.
			 * If they match, then it's a rectangle
			 */
			var latLngCoords = coordinatesToLatLng(shape.coordinates);
			var featureArea = L.GeometryUtil.geodesicArea( latLngCoords[0] );
			
			var f = new L[shape.type.toLowerCase()](latLngCoords);
			var boundCoords = boundsToLatLngArray(f.getBounds());
			var boundsArea = L.GeometryUtil.geodesicArea( boundCoords );
			
			isRect = (boundsArea === featureArea);
			
		}

		return isRect;
	};
	
	return {
		geoJsonToArea: geoJsonToArea,
		geoJsonToBounds: geoJsonToBounds,
		geoJsonToFeature: geoJsonToFeature,
		geoJsonToLeafletJson: geoJsonToLeafletJson,
		leafletJsonToFeature: leafletJsonToFeature,
		leafletJsonToGeoJson: leafletJsonToGeoJson,
		leafletJsonToArea: leafletJsonToArea,
		featureToGeoJson: featureToGeoJson,
		coordinatesToLatLng: coordinatesToLatLng
	};
	
}]);
