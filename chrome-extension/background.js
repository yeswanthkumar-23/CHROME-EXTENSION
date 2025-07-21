// Background service worker for tracking website usage
let currentTab = null
let startTime = null
let isTracking = false

// Default website categories
const defaultCategories = {
  productive: [
    "github.com",
    "stackoverflow.com",
    "developer.mozilla.org",
    "docs.google.com",
    "notion.so",
    "figma.com",
    "codepen.io",
    "medium.com",
    "dev.to",
    "hackernews.com",
  ],
  unproductive: [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "youtube.com",
    "netflix.com",
    "reddit.com",
    "tiktok.com",
    "twitch.tv",
  ],
}

// Declare chrome variable
const chrome = window.chrome

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  // Set default categories if not exists
  const result = await chrome.storage.local.get(["categories"])
  if (!result.categories) {
    await chrome.storage.local.set({ categories: defaultCategories })
  }

  // Create alarm for periodic data sync
  chrome.alarms.create("syncData", { periodInMinutes: 5 })
})

// Track tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabChange(activeInfo.tabId)
})

// Track tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    await handleTabChange(tabId)
  }
})

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus
    await stopTracking()
  } else {
    // Window gained focus
    const tabs = await chrome.tabs.query({ active: true, windowId })
    if (tabs[0]) {
      await handleTabChange(tabs[0].id)
    }
  }
})

async function handleTabChange(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId)

    if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      await stopTracking()
      return
    }

    // Stop tracking previous tab
    if (isTracking) {
      await stopTracking()
    }

    // Start tracking new tab
    await startTracking(tab)
  } catch (error) {
    console.error("Error handling tab change:", error)
  }
}

async function startTracking(tab) {
  const domain = extractDomain(tab.url)
  if (!domain) return

  currentTab = {
    domain,
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
  }

  startTime = Date.now()
  isTracking = true
}

async function stopTracking() {
  if (!isTracking || !currentTab || !startTime) return

  const endTime = Date.now()
  const timeSpent = endTime - startTime

  // Only log if spent more than 5 seconds
  if (timeSpent > 5000) {
    await logTimeEntry({
      domain: currentTab.domain,
      url: currentTab.url,
      title: currentTab.title,
      favicon: currentTab.favicon,
      timeSpent,
      timestamp: startTime,
      date: new Date(startTime).toISOString().split("T")[0],
    })
  }

  currentTab = null
  startTime = null
  isTracking = false
}

async function logTimeEntry(entry) {
  try {
    // Get existing data
    const result = await chrome.storage.local.get(["timeEntries", "dailyStats"])
    const timeEntries = result.timeEntries || []
    const dailyStats = result.dailyStats || {}

    // Add new entry
    timeEntries.push(entry)

    // Update daily stats
    const today = entry.date
    if (!dailyStats[today]) {
      dailyStats[today] = {}
    }
    if (!dailyStats[today][entry.domain]) {
      dailyStats[today][entry.domain] = 0
    }
    dailyStats[today][entry.domain] += entry.timeSpent

    // Save to storage
    await chrome.storage.local.set({ timeEntries, dailyStats })

    // Notify dashboard if open
    try {
      chrome.runtime.sendMessage({
        type: "dataUpdate",
        entry,
      })
    } catch (error) {
      // Dashboard not open, ignore
    }
  } catch (error) {
    console.error("Error logging time entry:", error)
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return null
  }
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "syncData") {
    // Clean up old data (keep last 30 days)
    await cleanupOldData()
  }
})

async function cleanupOldData() {
  try {
    const result = await chrome.storage.local.get(["timeEntries", "dailyStats"])
    const timeEntries = result.timeEntries || []
    const dailyStats = result.dailyStats || {}

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0]

    // Filter time entries
    const filteredEntries = timeEntries.filter((entry) => entry.date >= cutoffDate)

    // Filter daily stats
    const filteredDailyStats = {}
    Object.keys(dailyStats).forEach((date) => {
      if (date >= cutoffDate) {
        filteredDailyStats[date] = dailyStats[date]
      }
    })

    // Save cleaned data
    await chrome.storage.local.set({
      timeEntries: filteredEntries,
      dailyStats: filteredDailyStats,
    })

    console.log("Cleaned up old data")
  } catch (error) {
    console.error("Error cleaning up data:", error)
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "visibilityChange") {
    // Handle page visibility changes for more accurate tracking
    if (!message.visible && isTracking) {
      // Page became hidden, pause tracking
      stopTracking()
    }
  }
})
