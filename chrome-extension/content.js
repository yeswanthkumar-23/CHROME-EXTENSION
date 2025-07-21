// Content script for additional tracking capabilities
let isPageVisible = true
let pageStartTime = Date.now()

// Declare chrome variable
const chrome = window.chrome

// Track page visibility changes
document.addEventListener("visibilitychange", () => {
  isPageVisible = !document.hidden

  if (isPageVisible) {
    pageStartTime = Date.now()
  }

  // Send visibility change to background script
  chrome.runtime.sendMessage({
    type: "visibilityChange",
    visible: isPageVisible,
    timestamp: Date.now(),
  })
})

// Track scroll depth for engagement metrics
let maxScrollDepth = 0
window.addEventListener("scroll", () => {
  const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
  maxScrollDepth = Math.max(maxScrollDepth, scrollPercent)
})

// Send engagement data when page unloads
window.addEventListener("beforeunload", () => {
  chrome.runtime.sendMessage({
    type: "pageEngagement",
    scrollDepth: maxScrollDepth,
    timeOnPage: Date.now() - pageStartTime,
  })
})
