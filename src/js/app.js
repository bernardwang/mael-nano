import 'babel-polyfill';

global.app = function () {
	let words = [
		'empathetic?',
		'genuine?',
		'open?',
		'curious?',
		'bold?'
	];
	let images = [
		'assets/img/empathetic.png',
		'assets/img/genuine.png',
		'assets/img/open.png',
		'assets/img/curious.png',
		'assets/img/bold.png'
	];
	let people = [
		['Teresa Ibarra', 'Frontend Developer', 'From San Francisco, US',],
		['Kei Yumino', 'Visual Designer', 'From Shizokuo, Japan'],
		['Nathalie Martin', 'Researcher', 'From Seattle, US',],
		['Sanghyun Lee', 'Researcher', 'From Seoul, Korea'],
		['Chloe Poulter', 'UX Designer', 'From London, UK'],
	];

	let i = 0;
	let interval = null;

	let stopPeopleCycle = function() {
		clearInterval(interval);
		interval = null;
	}

	let startPeopleCycle = function() {
		if (interval != null) {
			return;
		}
		interval = setInterval(function() {
			i = (i + 1) % words.length;
			// background 
			$('#people').css("background-image", "url(" + images[i = (i + 1) % images.length] + ")");
			// character traits
			$('#swap-word').fadeOut(function() {
				$(this).html(words[i]).fadeIn();
			});
			// people description
			$('#swap-name').fadeOut(function() {
				$(this).html(people[i][0]).fadeIn();
			});
			$('#swap-role').fadeOut(function() {
				$(this).html(people[i][1]).fadeIn();
			});
			$('#swap-loc').fadeOut(function() {
				$(this).html(people[i][2]).fadeIn();
			});
		}, 3000);
	}

	let old_id = 0;     // current page index
	let pages = [       // array of pages
		'#maelstrom',
		'#overview',
		'#about',
		'#projects',
		'#people',
		'#apply'
	];
	let timer = null;   // scroll timer
	let count = 0;      // scroll counter

	/**
	 * Navs to next page
	 */
	let nextPage = function() {
		if (old_id < pages.length-1) {
			let new_id = old_id+1;
			switchPage(new_id);
			if (timer !== null) clearTimeout(timer);
		}
	}

	/**
	 * Navs to prev page
	 */
	let prevPage = function() {
		if (old_id > 0) {
			let new_id = old_id-1;
			switchPage(new_id);
			if (timer !== null) clearTimeout(timer);
		}
	}

	/**
	 * Switch to given page id
	 */
	let switchPage = function(new_id) {
		if (new_id !== old_id) {
			if (new_id == 4) {
				startPeopleCycle();
			} else if (old_id == 4) {
				stopPeopleCycle();
			}

			let new_page = pages[new_id];
			let old_page = pages[old_id];
			let new_nav = $('#nav').children()[new_id];
			let old_nav = $('#nav').children()[old_id];

			$(new_nav).addClass('target');
			$(old_nav).removeClass('target');

			$(new_page).addClass('target');
			setTimeout(function(){
				$(old_page).removeClass('target');
			}, 100);

			old_id = new_id;
		}
	}

	// nav setup
	$('.nav-link').click(function(e) {   
		e.preventDefault();
		let new_id = $('.nav-link').index($(this));
		switchPage(new_id);
	});

	// scroll setup
	$('body').mousewheel(function(e) {
		// ignore smaller movements
		if (Math.abs(e.deltaY) < 30) return;

		// update direction count
		if (e.deltaY < 0) {
			count += 1;
		} else if (e.deltaY > 0) {
			count -= 1;
		}

		// scroll timer
		if (timer !== null) clearTimeout(timer);    // still scrolling
		timer = setTimeout(function() {             // function runs when scrolling stops
			let count_threshold = 5;
			if (count > count_threshold) {         
				nextPage();
			} else if (count < -count_threshold) {
				prevPage();
			}
			count = 0;
		}, 30);
	});

	// arrow setup
	$('#arrow-link').click(function(e) {
		nextPage();
	});

	// key binding for up and down arrows
	$(document).keydown(function(e){
		if (e.keyCode == 38) {
			prevPage();
		} else if (e.keyCode == 40) {
			nextPage();
		}
	});
};

global.app();

