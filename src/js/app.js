import 'babel-polyfill';

global.app = function () {
	let page_id = 0;							// current page index
	const page = [      						// array of page
		'#maelstrom',
		'#overview',
		'#about',
		'#projects',
		'#people',
		'#apply',
	];

	let people_id = 0;
	let people_cycle = null;
	const people_bg = [
		'assets/img/empathetic.png',
		'assets/img/genuine.png',
		'assets/img/open.png',
		'assets/img/curious.png',
		'assets/img/bold.png',
	];

	const scroll_cooldown = 1000;								// 1 second cooldown for mousescroll
	const scroll_threshold = 30;								// ignore smaller scroll events
	const page_cooldown = 700;									// .7 second cooldown for default page
	let page_last_ts = new Date().getTime() - page_cooldown;	// last scroll timestamp

	/**
	 * CSS preload #people cycle images
	 */
	const preloadPeopleBgs = function () {
		let background = '';
		for (let i = 0; i < people_bg.length; i++) {
			background += 'url(' + people_bg[i] + '),';
		}
		background = background.slice(0, -1);
		$('#people-preload').css('background-image', background);
	};

	/**
	 * Call function after page loads
	 * Simon Willison's addLoadEvent
	 * http://blog.simonwillison.net/post/57956760515/addloadevent
	 */
	const addLoadEvent = function (func) {
		const oldonload = window.onload;
		if (typeof window.onload !== 'function') {
			window.onload = func;
		} else {
			window.onload = function () {
				if (oldonload) {
					oldonload();
				}
				func();
			};
		}
	};

	/**
	 * CSS preload after page load
	 */
	addLoadEvent(preloadPeopleBgs);

	/**
	 * Stop interval for #people page
	 */
	const stopPeopleCycle = function () {
		clearInterval(people_cycle);
		people_cycle = null;
	};

	/**
	 * Start interval for #people page
	 */
	const startPeopleCycle = function () {
		if (people_cycle != null) return;

		people_cycle = setInterval(() => {
			$('.swap-elem:nth-child(' + (people_id + 1) + ')').toggleClass('target');
			people_id = (people_id + 1) % people_bg.length;
			$('#people').css('background-image', 'url(' + people_bg[people_id] + ')');
			$('.swap-elem:nth-child(' + (people_id + 1) + ')').toggleClass('target');
		}, 3000);
	};

	/**
	 * Checks if past cooldown
	 */
	const isPageCooldown = function (cooldown_ts) {
		const current_ts = new Date().getTime();
		if ((current_ts - page_last_ts) < cooldown_ts) return false;
		return true;
	};

	/**
	 * Switch to given page id
	 */
	const goToPage = function (new_id) {
		if (new_id === page_id) return;

		// #people page init
		if (new_id === 4) {
			startPeopleCycle();
		} else if (page_id === 4) {
			stopPeopleCycle();
		}

		const new_page = page[new_id];
		const old_page = page[page_id];
		const new_nav = $('#nav').children()[new_id];
		const old_nav = $('#nav').children()[page_id];

		// Nav bar
		$(new_nav).addClass('target');
		$(old_nav).removeClass('target');

		// Nasty page transition logic
		// page IN transition is slower, page OUT transition is faster
		// Accomplishes this by using intermediate class called 'old-target'
		$(old_page).addClass('old-target'); 		// Make old page text fade away quickly, background stays to avoid flash
		$(new_page).addClass('target');				// New page begins to fade in slowly
		setTimeout(() => {							// After new page completely faded in, reset old page classes
			$(old_page).removeClass('target');
			$(old_page).removeClass('old-target');
		}, page_cooldown);

		// update scroll globals
		page_id = new_id;
		page_last_ts = new Date().getTime();
	};

	/**
	 * Navs to next page
	 */
	const nextPage = function () {
		if (page_id < page.length - 1) {
			const new_id = page_id + 1;
			goToPage(new_id);
		}
	};

	/**
	 * Navs to prev page
	 */
	const prevPage = function () {
		if (page_id > 0) {
			const new_id = page_id - 1;
			goToPage(new_id);
		}
	};

	/**
	 * Event for mouse scrolling
	 */
	$('body').mousewheel((e) => {
		const scroll_value = e.deltaY;
		if (!isPageCooldown(scroll_cooldown) || scroll_value > scroll_threshold) return; // ignore if on cooldown or if too small

		if (scroll_value < 0) {
			nextPage();
		} else {
			prevPage();
		}
	});

	/**
	 * Event for keyboard scrolling
	 */
	$(document).keydown((e) => {
		if (!isPageCooldown(page_cooldown)) return;	// ignore if on cooldown

		if (e.keyCode === 38) {
			prevPage();
		} else if (e.keyCode === 40) {
			nextPage();
		}
	});

	/**
	 * Landing page arrow listener
	 */
	$('#arrow-link').click((e) => {
		nextPage();
	});

	/**
	 * Nav bar listener
	 */
	$('.nav-link').click((e) => {
		if (!isPageCooldown(page_cooldown)) return;	// ignore if on cooldown

		e.preventDefault();
		const new_id = $('.nav-link').index($(this));
		goToPage(new_id);
	});

	if (Hammer) {
		const element = document.getElementById('body');
		const hammertime = new Hammer(element);
		hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
		hammertime.on('swipeup', (e) => {
			console.log(1);
			nextPage();
		});
		hammertime.on('swipedown', (e) => {
			console.log(2);
			prevPage();
		});
	}
};

global.app();

