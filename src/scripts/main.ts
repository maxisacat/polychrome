import '../styles/index.pcss'
import { local, confirmation, toolTip } from './utils'
import SavedPalettes from './SavedPalettes'
import Palette from './palette'
import Router from './routing'
import handleClicks from './handleClicks'
import handleDrag from './handleDrag'
import handleKeys from './handleKeys'

// Global Variables
export let palette = new Palette()
export let palettes = new SavedPalettes()

// Routing
const siteTitle = document.title
const toolbar = document.querySelector('.toolbar')!
function pageFactory(title: string, element: HTMLElement, context?: any): Function {
	return (ids?: string[]) => {
		document.title = siteTitle + ' | ' + title
		const currentView = document.querySelector('main.visible')
		if (currentView) currentView.classList.remove('visible')
		const nextView = element
		nextView?.classList.add('visible')
		if (title == 'Palettes') {
			document.body.parentElement!.style.overflow = ''
			document.body.style.overflow = ''
			toolbar.classList.add('palettes')
			toolbar.classList.remove('create')
			context.draw(local.savedPalettes.items)
		} else if (title == 'Create') {
			document.body.parentElement!.style.overflow = 'hidden'
			document.body.style.overflow = 'hidden'
			toolbar.classList.add('create')
			toolbar.classList.remove('palettes')
			if (ids) context.generate(ids)
			else {
				let slots = context.generate()
				let hexes = []
				for (let slot of slots) hexes.push(slot.hex)
				history.replaceState('', '', hexes.join('-'))
			}
		} else {
			toolbar.classList.remove('palettes', 'create')
			document.documentElement.style.overflow = ''
			document.body.style.overflow = ''
		}
	}
}
export let router = new Router([
	['', pageFactory('Home', document.getElementById('landing-page')!)],
	['palettes', pageFactory('Palettes', document.getElementById('palettes-page')!, palettes)],
	['create', pageFactory('Create', document.getElementById('create-page')!, palette)],
	['404', pageFactory('404 Not Found', document.getElementById('not-found-page')!)],
])
router.routeToURL(location.pathname)
onpopstate = () => router.navigateTo(location.pathname, true)

// First Visit
if (local.info.firstVisit)
	confirmation('This site relies on local storage and cookies to save palettes.', {
		confirmation: {
			confirm: {
				message: `Sure, sounds good to me.`,
				call() {
					local.info = { firstVisit: false }
					local.settings = { cookies: 1 }
					document.body.append(toolTip('Thanks, enjoy the site! :)'))
				},
			},
			cancel: {
				message: `No thanks, I don't want to save palettes.`,
				call() {
					local.info = { firstVisit: false }
					local.settings = { cookies: 0 }
					for (let i = 0; i < palettes.items.length; i++) palettes.removeItem(0)
					document.body.append(
						toolTip(`You won't be able to save your palettes. You can change this in settings.`, {
							duration: 2500,
						})
					)
				},
			},
		},
	})

// Window Size
if (navigator.userAgent.includes('Android') || navigator.userAgent.includes('like Mac'))
	document.body.classList.add('mobile')
export function testSize() {
	;(document.querySelector(':root')! as HTMLElement).style.display = 'initial'
	if (window.innerHeight > window.innerWidth) {
		document.body.classList.add('vertical')
		document.body.classList.remove('landscape-thin')
	} else if (window.innerWidth / window.innerHeight < 1.6) {
		document.body.classList.add('landscape-thin')
		document.body.classList.remove('vertical')
	} else document.body.classList.remove('vertical', 'landscape-thin')
}
setTimeout(testSize, 200)
onresize = testSize

// Inputs
handleClicks()
handleDrag()
handleKeys()
onmouseover = (e) => {
	if (!palette.plus.disabled) {
		const target = e.target as HTMLElement
		const swatch = target.closest('.swatch')
		if (swatch) {
			const detector = target.closest('.detector')
			if (detector && palette.slots.length < 10) {
				const left = target.closest('.left')
				let index = parseInt(swatch.getAttribute('data-color-index')!)
				if (left) index--
				palette.plus.show(index)
			} else palette.plus.hide(0)
		}
	}
}
