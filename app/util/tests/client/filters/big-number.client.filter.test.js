'use strict';

describe('Big Number Filter', function() {

	var bigNumberFilter;

	beforeEach(module('asymmetrik.util'));

	beforeEach(inject(function(_$filter_){
		// The injector unwraps the underscores (_) from around the parameter names when matching
		var $filter = _$filter_;
		bigNumberFilter= $filter('bigNumberFilter');
	}));

	describe('Basic Formatting', function() {

		it('should not change numbers less than 1000', function() {
			expect(bigNumberFilter(0)).toEqual('0');
			expect(bigNumberFilter(1)).toEqual('1');
			expect(bigNumberFilter(5)).toEqual('5');
			expect(bigNumberFilter(9)).toEqual('9');
			expect(bigNumberFilter(10)).toEqual('10');
			expect(bigNumberFilter(100)).toEqual('100');
			expect(bigNumberFilter(999)).toEqual('999');
		});

		it('should add \'K\' for thousands', function() {
			expect(bigNumberFilter(1000)).toEqual('1.0K');
			expect(bigNumberFilter(2000)).toEqual('2.0K');
			expect(bigNumberFilter(5000)).toEqual('5.0K');
			expect(bigNumberFilter(9000)).toEqual('9.0K');
			expect(bigNumberFilter(10000)).toEqual('10K');
			expect(bigNumberFilter(100000)).toEqual('100K');
			expect(bigNumberFilter(999000)).toEqual('999K');
		});

		it('should add \'M\' for millions', function() {
			expect(bigNumberFilter(1000000)).toEqual('1.0M');
			expect(bigNumberFilter(2000000)).toEqual('2.0M');
			expect(bigNumberFilter(5000000)).toEqual('5.0M');
			expect(bigNumberFilter(9000000)).toEqual('9.0M');
			expect(bigNumberFilter(10000000)).toEqual('10M');
			expect(bigNumberFilter(100000000)).toEqual('100M');
			expect(bigNumberFilter(999000000)).toEqual('999M');
		});

		it('should add \'B\' for billions', function() {
			expect(bigNumberFilter(1000000000)).toEqual('1.0B');
			expect(bigNumberFilter(2000000000)).toEqual('2.0B');
			expect(bigNumberFilter(5000000000)).toEqual('5.0B');
			expect(bigNumberFilter(9000000000)).toEqual('9.0B');
			expect(bigNumberFilter(10000000000)).toEqual('10B');
			expect(bigNumberFilter(100000000000)).toEqual('100B');
			expect(bigNumberFilter(999000000000)).toEqual('999B');
		});

	});

	describe('Smart fractionSize', function() {

		it('should add 2 decimals for numbers less than 1', function() {
			expect(bigNumberFilter(0.11)).toEqual('0.11');
			expect(bigNumberFilter(0.001)).toEqual('0.00');
			expect(bigNumberFilter(0.001)).toEqual('0.00');
		});

		it('should add 1 decimals for numbers that abbreviate to between 1 and 9', function() {
			expect(bigNumberFilter(1100)).toEqual('1.1K');
			expect(bigNumberFilter(1100000)).toEqual('1.1M');
			expect(bigNumberFilter(1100000000)).toEqual('1.1B');
			expect(bigNumberFilter(1100000000000)).toEqual('1.1T');
		});

		it('should add 0 decimals for numbers that abbreviate to between 10 and 999', function() {
			expect(bigNumberFilter(10000)).toEqual('10K');
			expect(bigNumberFilter(999000)).toEqual('999K');
			expect(bigNumberFilter(10000000)).toEqual('10M');
			expect(bigNumberFilter(999000000)).toEqual('999M');
			expect(bigNumberFilter(10000000000)).toEqual('10B');
			expect(bigNumberFilter(999000000000)).toEqual('999B');
			expect(bigNumberFilter(10000000000000)).toEqual('10T');
			expect(bigNumberFilter(999000000000000)).toEqual('999T');
		});

	});

	describe('General behavior', function() {
		it('should round numbers before abbreviating them', function() {
			expect(bigNumberFilter(1111)).toEqual('1.1K');
			expect(bigNumberFilter(1111111)).toEqual('1.1M');
			expect(bigNumberFilter(1111111111)).toEqual('1.1B');
			expect(bigNumberFilter(1111111111111)).toEqual('1.1T');

			expect(bigNumberFilter(1999)).toEqual('2.0K');
			expect(bigNumberFilter(1999999)).toEqual('2.0M');
			expect(bigNumberFilter(1999999999)).toEqual('2.0B');
			expect(bigNumberFilter(1999999999999)).toEqual('2.0T');

			expect(bigNumberFilter(19999)).toEqual('20K');
			expect(bigNumberFilter(19999999)).toEqual('20M');
			expect(bigNumberFilter(19999999999)).toEqual('20B');
			expect(bigNumberFilter(19999999999999)).toEqual('20T');
		});

		it('should display numbers greater than 999T', function() {
			expect(bigNumberFilter(1000000000000000)).toEqual('1,000T');
		});

	});

});