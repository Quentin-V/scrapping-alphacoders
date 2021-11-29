const https = require('https')
const jsdom = require("jsdom")
const fs = require('fs')
const {downloadRequest, getMaxPage} = require('./scrapping-functions.js')
const config = require('./config.js')

// example link
// https://mobile.alphacoders.com/by-sub-category/344100
//                                                ^ categoryID
const categoryId = config.categoryId
const outputFolder = config.outputFolder
const filePrefix = config.filePrefixMobileWp
const collOrCat = config.collectionOrCategory.replace('_', '-')

const imgsList = []
let fileCount, tot
fileCount = tot = 0

const optionsMaxPage = {
	hostname: 'mobile.alphacoders.com',
	port: 443,
	path: `/by-${collOrCat}/${categoryId}`,
	method: 'GET'
};

(async () => {
	const maxPageNb = await getMaxPage(optionsMaxPage)
	console.log(`Found ${maxPageNb} pages, fetching started`)
	/*
	for(let pageNb = 1; pageNb <= maxPageNb; ++pageNb) { // For each page
		await fetchPage(pageNb)
	}
	*/
	await fetchPages(parseInt(maxPageNb))
	/*
	imgsList.forEach(async image => {
		if(fs.existsSync(`${outputFolder}/${filePrefix}${image.id}.${image.type}`)) {
			console.log(`File ${filePrefix}${image.id}.${image.type} already exists, skipping...`)
			return;
		}
		// link: https://initiate.alphacoders.com/download/mobile-wallpaper/933879/jpg
		const optionsDownload = {
			hostname: 'initiate.alphacoders.com',
			port: 443,
			path: `/download/mobile-wallpaper/${image.id}/${image.type}`,
			method: 'GET'
		}
		await downloadRequest(optionsDownload, outputFolder, filePrefix, image.id, image.type, ++fileCount, tot).catch(err => console.log(err))
	})
	*/
	const toRetry = []
	for(let i = 0; i < imgsList.length; ++i) {
		if(fs.existsSync(`${outputFolder}/${filePrefix}${imgsList[i].id}.${imgsList[i].type}`)) {
			console.log(`File ${filePrefix}${imgsList[i].id}.${imgsList[i].type} already exists, skipping...`)
			continue;
		}
		// link: https://initiate.alphacoders.com/download/mobile-wallpaper/933879/jpg
		downloadRequest(`/download/mobile-wallpaper`, outputFolder, filePrefix, imgsList[i].id, imgsList[i].type, ++fileCount, tot).catch(err => toRetry.push(i))
	}
	toRetry.forEach(i => {
		downloadRequest(`/download/mobile-wallpaper`, outputFolder, filePrefix, imgsList[i].id, imgsList[i].type, ++fileCount, tot).catch(err => console.log(`Error downloading : ${imgsList[i].id}`))
	})
})()


function fetchPage(pageNb) {
	const optionsGetBgInfo = { // Options to scrap all informations about the bg
		hostname: 'mobile.alphacoders.com',
		port: 443,
		path: `/by-${collOrCat}/${categoryId}?page=${pageNb}`,
		method: 'GET'
	}
	return new Promise(function(resolve, reject) {
		let response = ''
		const reqGetPage = https.request(optionsGetBgInfo, res => { // Create request and get the page
			console.log(`Starting fetching of page n°${pageNb}`)
			res.on('data', d => {
				response += d
			})
			res.on('end', () => {
				if(!fs.existsSync(outputFolder)) {
					console.log(`Output folder not found, creating it...`)
					fs.mkdirSync(outputFolder)
				}
				const dom = new jsdom.JSDOM(response)
				const imageElements = dom.window.document.querySelectorAll('.img-responsive') // get  all the images
				imageElements.forEach(im => {
					let idAndType = im.src.substr(im.src.lastIndexOf('/thumb-')+'/thumb-'.length).split('.')
					imgsList.push({id: idAndType[0], type: idAndType[1]})
				})
				tot += imageElements.length
				console.log(`Fetched page n°${pageNb}`)
				resolve();
			})
		})
		reqGetPage.on('error', error => { // If error on
			console.error(`Error while fetching download links, error: ${error}`)
			reject();
		})
		reqGetPage.end()
	});
}

function fetchPages(totPages) {
	return new Promise(function(resolve, reject) {
		let nbFetched = 1
		for(let pageNb = 1; pageNb <= totPages; ++pageNb) { // For each page
			const optionsGetBgInfo = { // Options to scrap all informations about the bg
				hostname: 'mobile.alphacoders.com',
				port: 443,
				path: `/by-${collOrCat}/${categoryId}?page=${pageNb}`,
				method: 'GET'
			}
			let response = ''
			const reqGetPage = https.request(optionsGetBgInfo, res => { // Create request and get the page
				console.log(`Starting fetching of page n°${pageNb}`)
				res.on('data', d => {
					response += d
				})
				res.on('end', () => {
					if(!fs.existsSync(outputFolder)) {
						console.log(`Output folder not found, creating it...`)
						fs.mkdirSync(outputFolder)
					}
					const dom = new jsdom.JSDOM(response)
					const imageElements = dom.window.document.querySelectorAll('.img-responsive') // get  all the images
					imageElements.forEach(im => {
						let idAndType = im.src.substr(im.src.lastIndexOf('/thumb-')+'/thumb-'.length).split('.')
						imgsList.push({id: idAndType[0], type: idAndType[1]})
					})
					tot += imageElements.length
					console.log(`Fetched page n°${pageNb}`)
					if(nbFetched === totPages) resolve()
					++nbFetched
				})
			})
			reqGetPage.on('error', error => { // If error on
				console.error(`Error while fetching download links, error: ${error}`)
				reject()
			})
			reqGetPage.end()
		}
	});
}
