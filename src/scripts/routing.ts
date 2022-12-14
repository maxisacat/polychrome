export default class {
	constructor(views: [string, Function][]) {
		this.routes = new Map(views)
	}

	routes: Map<string, Function>

	loadContent = (url?: any) => {
		if (url) {
			let { base, ids } = url
			if (typeof base != 'string') base = url
			let route = this.routes.get(base)!
			if (ids) route(ids)
			else route()
		} else this.routes.get('404')!()
	}

	routeToURL = (url: string) => {
		let deconURL = this.deconstructURL(url)
		let { base, ids } = deconURL
		if (this.routes.has(base)) {
			if (base === 'create') {
				if (ids) {
					if (this.idsAreValid(ids)) this.loadContent(deconURL)
					else this.loadContent()
				} else this.loadContent(deconURL)
			} else this.loadContent(deconURL)
		} else this.loadContent()
	}

	navigateTo = (url: string, replace?: boolean) => {
		replace = replace || false
		if (replace) history.replaceState('', '', url)
		else history.pushState('', '', '/polychrome' + url)
		this.routeToURL(url)
	}

	deconstructURL(url: string) {
		let array = url.replace(/^\//, '').replace(/\/$/, '').split('/')
		if (array[0] == 'polychrome')
			return {
				site: 'polychrome',
				base: array[1] || '',
				ids: array[2] ? array[2].split('-') : null,
			}
		return {
			site: 'polychrome',
			base: array[0],
			ids: array[1] ? array[1].split('-') : null,
		}
	}

	idsAreValid(ids: string[]) {
		for (let id of ids) if (!/^[a-f0-9]{6}$/.test(id) || ids.length > 10) return false
		return true
	}
}
