var biomes = {
	grass: 0,
	forest: 1,
	suburb: 2,
	city: 3,
	industrial: 4
};

// Road type patterns (order is top, right, bottom, left)
//	0 - no road
//	1 - road
//	2 - highway
var roadPatterns = {
	cross_h: 			[2, 2, 2, 2],
	h_h:				[0, 2, 0, 2],
	v_h:				[2, 0, 2, 0],
	h_h_cross:			[1, 2, 1, 2],
	v_h_cross:			[2, 1, 2, 1],
	tj_bottom_h:		[0, 2, 1, 2],
	tj_left_h:			[2, 0, 2, 1],
	tj_right_h:			[2, 1, 2, 0],
	tj_top_h:			[1, 2, 0, 2],
	cross:				[1, 1, 1, 1],
	h:					[0, 1, 0, 1],
	v:					[1, 0, 1, 0],
	c_bottomleft:		[0, 0, 1, 1],
	c_bottomright:		[0, 1, 1, 0],
	c_topleft: 			[1, 0, 0, 1],
	c_topright: 		[1, 1, 0, 0],
	tj_bottom:			[0, 1, 1, 1],
	tj_left:			[1, 0, 1, 1],
	tj_right:			[1, 1, 1, 0],
	tj_top:				[1, 1, 0, 1],
	de_bottom:			[0, 0, 1, 0],
	de_left:			[0, 0, 0, 1],
	de_right:			[0, 1, 0, 0],
	de_top:				[1, 0, 0, 0],
	e:					[0, 0, 0, 0]
};

// Each world cell is divided into 9 plots (3*3) - this table shows the plots available for
// placing buildings with each road type
var buildingPlots = {
	cross:				[1, 0, 1, 0, 0, 0, 1, 0, 1],
	h:					[1, 1, 1, 0, 0, 0, 1, 1, 1],
	v:					[1, 0, 1, 1, 0, 1, 1, 0, 1],
	c_bottomleft:		[1, 1, 1, 0, 0, 1, 1, 0, 1],
	c_bottomright:		[1, 1, 1, 1, 0, 0, 1, 0, 1],
	c_topleft: 			[1, 0, 1, 0, 0, 1, 1, 1, 1],
	c_topright: 		[1, 0, 1, 1, 0, 0, 1, 1, 1],
	tj_bottom:			[1, 1, 1, 0, 0, 0, 1, 0, 1],
	tj_left:			[1, 0, 1, 0, 0, 1, 1, 0, 1],
	tj_right:			[1, 0, 1, 1, 0, 0, 1, 0, 1],
	tj_top:				[1, 0, 1, 0, 0, 0, 1, 1, 1],
	de_bottom:			[1, 1, 1, 1, 0, 1, 1, 0, 1],
	de_left:			[1, 1, 1, 0, 0, 1, 1, 1, 1],
	de_right:			[1, 1, 1, 1, 0, 0, 1, 1, 1],
	de_top:				[1, 0, 1, 1, 0, 1, 1, 1, 1],
	e:					[1, 1, 1, 1, 1, 1, 1, 1, 1],
	cross_h:			[0, 0, 0, 0, 0, 0, 0, 0, 0],
	h_h:				[0, 0, 0, 0, 0, 0, 0, 0, 0],
	v_h:				[0, 0, 0, 0, 0, 0, 0, 0, 0]
};