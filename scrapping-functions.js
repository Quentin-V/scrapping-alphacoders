// File containing useful functions
const https = require("https");
const fs = require("fs");

module.exports = {

	downloadRequest: async (path, outputFolder, filePrefix, id, type, count, tot) => {
		const optionsDownload = {
			hostname: 'initiate.alphacoders.com',
			port: 443,
			path: `${path}/${id}/${type}`,
			method: 'GET'
		}
		return new Promise(function(resolve, reject) {
			const reqDownload = https.request(optionsDownload, resDownload => {
				const file = fs.createWriteStream(`${outputFolder}/${filePrefix}${id}.${type}`);
				resDownload.on('data', chunk => {
					file.write(chunk)
				})
				resDownload.on('end', () => {
					resolve()
					file.close()
					console.log(`${id}.${type} downloaded! ${count+'/'+tot}`)
				})
			})
			reqDownload.on('error', err => {
				reject(err)
			})
			reqDownload.end()
		});
	},

	getMaxPage: async (options) => {
		return new Promise((a, r) => {
			if(options.path.includes('?'))
			options.path += '&page=99'
			else
			options.path += '?page=99'
			const reqMaxPage = https.request(options, res => {
				if(res.headers.location.includes('page='))
				a((res.headers.location.substr(res.headers.location.lastIndexOf('page=')+'page='.length)))
				else
				a(1)
			})
			reqMaxPage.on('error', err => r(err))
			reqMaxPage.end()
		})
	}
}
