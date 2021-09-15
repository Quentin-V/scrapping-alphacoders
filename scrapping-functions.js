// File containing useful functions
const https = require("https");
const fs = require("fs");

module.exports = {

    downloadRequest: (options, outputFolder, filePrefix, id, type, count, tot) => {
        const reqDownload = https.request(options, resDownload => {
            const file = fs.createWriteStream(`${outputFolder}/${filePrefix}${id}.${type}`);
            console.log(`Starting download of ${id}.${type} (${count/tot})`)
            resDownload.on('data', chunk => {
                file.write(chunk)
            })
            resDownload.on('end', () => {
                file.close()
                console.log(`${id}.${type} downloaded!`)
            })
        })
        reqDownload.on('error', err => {console.error(`Error while downloading ${id}.${type}, error: ${err}`)})
        reqDownload.end()
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