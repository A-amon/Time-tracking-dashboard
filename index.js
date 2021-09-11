const DATA_URL = './data.json'

const statusSection = document.querySelector('.status')
const statusCards = document.querySelectorAll('.status-card')

/**
 * Setup stagger animation
 * Fade in from top
 * @param  {string} className
 */
const setupStaggerAnim = (className) => {
	gsap.set(className, {
		y: -50,
		opacity: 0
	})
	gsap.to(className,
		{
			opacity: 1,
			y: 0,
			stagger: {
				each: 0.3
			}
		}
	)
}

/**
 * Fetch data from JSON file
 * @param {boolean} hide // Animate hide
 */
const getData = (hide = false) => {
	toggleFetchingAnimation()
	hide && animateStatusCard('hide')

	fetch(DATA_URL)
		.then(res => res.json())
		.then(res => {
			fillStatusCards(res)
			setTimeout(() => {
				toggleFetchingAnimation()
				animateStatusCard('show')
			}, 2000)
		})
}

/**
 * Show loading animation
 * Alert screen reader user about fetching
 */
const toggleFetchingAnimation = () => {
	const statusFetchingMessage = statusSection.querySelector('.status-fetching__text')
	statusSection.classList.toggle('fetching')

	const isFetching = statusSection.classList.contains('fetching')
	statusFetchingMessage.textContent = isFetching ? 'Fetching data' : 'Data is successfully displayed'
}

/**
 * Animate .status__card
 * Show/Hide
 */
const animateStatusCard = (type) => {
	const classToRemove = type === 'hide' ? 'show' : 'hide'

	statusCards.forEach(statusCard => {
		statusCard.classList.remove(classToRemove)	// Remove existing .show or .hide class
		statusCard.classList.add(type)
	})
}

/**
 * Iterate through .status-card elements
 * Pass relevant data to .status-card
 * @param  {array} items
 */
const fillStatusCards = (items) => {
	const timeframe = statusSection.getAttribute('data-timeframe')
	statusCards.forEach(statusCard => {
		const title = statusCard.querySelector('.status-card__title').textContent.trim()
		const { current, previous } = getStatusData(items, title, timeframe)

		fillStatusCard(statusCard, current, previous)
	})
}

/**
 * Set current and previous status in .status-card
 * @param  {object} statusCard
 * @param  {number} current
 * @param  {number} previous
 */
const fillStatusCard = (statusCard, current, previous) => {
	const thisWeekEl = statusCard.querySelector('.status-card__this-week')
	const thisWeekDuration = thisWeekEl.querySelector('.status-card__duration-value')
	const thisWeekLabel = thisWeekEl.querySelector('.status-card__duration-label')

	const lastWeekEl = statusCard.querySelector('.status-card__last-week')
	const lastWeekDuration = lastWeekEl.querySelector('.status-card__duration-value')
	const lastWeekLabel = lastWeekEl.querySelector('.status-card__duration-label')

	thisWeekDuration.textContent = current
	thisWeekLabel.textContent = current > 1 ? 'hrs' : 'hr'
	lastWeekDuration.textContent = previous
	lastWeekLabel.textContent = previous > 1 ? 'hrs' : 'hr'
}

/**
 * Filter and get relevant items from retrieved data
 * Based on title and timeframe
 * @param  {array} items
 * @param  {string} title
 * @param  {string} timeframe
 * @returns {object}
 */
const getStatusData = (items, title, timeframe) => {
	return (items.filter(item =>
		item.title.toLowerCase() === title.toLowerCase())[0]
	).timeframes[timeframe]
}

const headerTabs = document.querySelectorAll('.header__tab')

/**
 * Add click event listener to .header__tab elements
 */
const addListenerToTabs = () => {
	headerTabs.forEach(headerTab => {
		headerTab.addEventListener('click', handleTabClick)
	})
}

/**
 * Handle .header__tab click event
 * Switch tab and tabpanel
 * @param  {object} event
 */
const handleTabClick = (event) => {
	const clicked = event.currentTarget
	const timeframe = clicked.textContent.toLowerCase().trim()
	const currentTimeframe = statusSection.getAttribute('data-timeframe')

	/**
	 * Only switch if new timeframe/tab is selected
	 */
	if (timeframe !== currentTimeframe) {
		switchTab(clicked)
		switchTabPanel(timeframe)
	}
}

/**
 * Change selected tab to new tab
 * @param  {object} selected
 */
const switchTab = (selected) => {
	const prevSelected = document.querySelector('.header__tab[aria-selected="true"]')
	prevSelected.setAttribute('aria-selected', false)
	prevSelected.setAttribute('tabindex', -1)

	selected.setAttribute('aria-selected', true)
	selected.setAttribute('tabindex', 0)
}

/**
 * Change data displayed in tabpanel
 * @param  {string} timeframe
 */
const switchTabPanel = (timeframe) => {
	statusSection.setAttribute('data-timeframe', timeframe)
	statusSection.focus()
	statusSection.removeEventListener('keydown', handlePanelKeydown)	// Remove previously assigned listener
	statusSection.addEventListener('keydown', handlePanelKeydown)

	getData(true)
}

/**
 * Handle .tab__panel keydown event
 * @param  {object} event
 */
const handlePanelKeydown = (event) => {
	const { code } = event
	const isTab = code === 'Tab'

	if (isTab) {
		const firstEl = document.querySelector('.header__tab[aria-selected="true"]')
		const statusCards = document.querySelectorAll('.status-card')
		const lastEl = statusCards[statusCards.length - 1].querySelector('button')

		setFocusTrap(event, firstEl, lastEl)
	}
}

/**
 * Set focus trap
 * @param  {object} event
 * @param  {object} firstEl
 * @param  {object} lastEl
 */
const setFocusTrap = (event, firstEl, lastEl) => {
	const { shiftKey } = event
	const currentFocused = document.activeElement

	if (shiftKey) {
		/**
		 * Move focus to last element
		 * If current focused is first element
		 */
		if (currentFocused === firstEl) {
			event.preventDefault()
			lastEl.focus()
		}
	}
	else {
		/**
		 * Move focus to first element
		 * If current focused is last element
		 */
		if (currentFocused === lastEl) {
			event.preventDefault()
			firstEl.focus()
		}
	}
}

/**
 * Add keydown event listener to body
 */
const addKeyListenerToBody = () => {
	document.body.addEventListener('keydown', handleBodyKeydown)
}

/**
 * Handle body keydown event
 * Check for arrow keys
 * @param  {object} event
 */
const handleBodyKeydown = (event) => {
	const { code } = event

	switch (code) {
		case 'ArrowUp':
			navigateTabsByArrow(-1)
			break
		case 'ArrowDown':
			navigateTabsByArrow(1)
			break
		default:
			break
	}
}

let currentTabByArrow = null

/**
 * Move focus among .header__tab elements
 * > ArrowUp to move focus to previous .header__tab
 * > ArrowDown to move focus to next .header__tab
 * @param  {number} direction
 */
const navigateTabsByArrow = (direction) => {
	const currentTab = document.querySelector('.header__tab[aria-selected="true"]')
	if (!currentTabByArrow) {
		currentTabByArrow = currentTab
	}

	let nextTab
	if (direction > 0) {
		nextTab = currentTabByArrow.nextElementSibling ? currentTabByArrow.nextElementSibling : headerTabs[0]
	}
	else if (direction < 0) {
		nextTab = currentTabByArrow.previousElementSibling ? currentTabByArrow.previousElementSibling : headerTabs[headerTabs.length - 1]
	}

	nextTab.focus()
	currentTabByArrow = nextTab
}

setupStaggerAnim('.status-card')
getData()
addListenerToTabs()
addKeyListenerToBody()