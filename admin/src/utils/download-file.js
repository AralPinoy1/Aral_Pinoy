/**
 * Downloads the file as a link
 * @param {File} file File to download
 * @param {string} filename Output name of the file
 */
function downloadFileAsLink (file, filename) {
  const url = window.URL.createObjectURL(new Blob([file]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
}

module.exports = downloadFileAsLink
