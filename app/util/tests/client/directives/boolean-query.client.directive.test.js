'use strict';

describe('boolean filter', function() {
	
	var termSpan = '<span class="wfboolean term">',
		groupSpan = '<span class="wfboolean group">',
		andSpan = ' <span class="wfboolean operator and">AND</span> ',
		orSpan = ' <span class="wfboolean operator or">OR</span> ',
		spanEnd = '</span>';
	
	var $compile, $rootScope, $filter, queryDisplay;
	
	beforeEach(module('asymmetrik.util'));
	
	/*
	 * Store references to $rootScope, $filter, and $compile
	 * so they are available to all tests in this describe block
	 */
	  beforeEach(inject(function(_$compile_, _$rootScope_, _$filter_){
	    // The injector unwraps the underscores (_) from around the parameter names when matching
	    $compile = _$compile_;
	    $rootScope = _$rootScope_;
	    $filter = _$filter_;
	    queryDisplay = $filter('queryDisplay');
	  }));
	
	it('returns null when given null', function() {
		expect(queryDisplay(null)).toEqual(null);
	});
	
	
	it('returns string when given string', function() {
		expect(queryDisplay('testing input').trim())
			.toEqual(termSpan + 'testing input' + spanEnd);
	});
	
	it('returns escaped html when given string', function() {
		expect(queryDisplay('testing & input').trim())
			.toEqual(termSpan + 'testing &amp; input' + spanEnd);
	});
	
	it('returns complex escaped html when given string', function() {
		expect(queryDisplay('testing & input with <b>more html</b><script type="text/javascript">alert("Hi!");</script>').trim())
			.toEqual(termSpan + 'testing &amp; input with &lt;b&gt;more html&lt;/b&gt;&lt;script type=&quot;text/javascript&quot;&gt;alert(&quot;Hi!&quot;);&lt;/script&gt;' + spanEnd);
	});
	
	it('returns anded values', function() {
		expect(queryDisplay({ and: ['one', 'two'] }).trim())
			.toEqual(groupSpan +
						termSpan + 'one' + spanEnd +
						andSpan +
						termSpan + 'two' + spanEnd +
					spanEnd);
	});
	
	it('returns or-ed values', function() {
		expect(queryDisplay({ or: ['one', 'two'] }).trim())
			.toEqual(groupSpan +
						termSpan + 'one' + spanEnd +
						orSpan +
						termSpan + 'two' + spanEnd +
					spanEnd);
	});
	
	it('returns nested and-or values', function() {
		expect(queryDisplay({ and: [ 'one', { or: ['two', 'three'] } ] }).trim())
			.toEqual(groupSpan +
						termSpan + 'one' + spanEnd +
						andSpan +
						' ' + groupSpan +
							termSpan + 'two' + spanEnd +
							orSpan +
							termSpan + 'three' + spanEnd +
						spanEnd + ' ' +
					spanEnd);
	});
	
	//TODO When we can get the templates working with the test framework...
//	it('properly initializes the directive', function() {
//		
//		var element = $compile('<div wf-boolean-query="{ and: [ \'one\', { or: [\'two\', \'three\'] } ] }"></div>')($rootScope);
//		
//		$rootScope.$digest();
//		
//		expect(element.html())
//			.toContain(groupSpan +
//						termSpan + 'one' + spanEnd +
//						andSpan +
//						' ' + groupSpan +
//							termSpan + 'two' + spanEnd +
//							orSpan +
//							termSpan + 'three' + spanEnd +
//						spanEnd + ' ' +
//					spanEnd);
//		
//	});
	
});