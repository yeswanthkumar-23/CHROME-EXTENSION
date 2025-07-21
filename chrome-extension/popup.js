// Popup script for displaying daily stats
document.addEventListener("DOMContentLoaded", async () => {
  await loadTodayStats()
  setupEventListeners()
})

async function loadTodayStats() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const result = await window.chrome.storage.local.get(["dailyStats", "categories"])
    const dailyStats = result.dailyStats || {}
    const categories = result.categories || { productive: [], unproductive: [] }

    const todayStats = dailyStats[today] || {}

    // Calculate total time and productivity
    let totalTime = 0
    let productiveTime = 0
    const siteStats = []

    for (const [domain, time] of Object.entries(todayStats)) {
      totalTime += time
      siteStats.push({ domain, time })

      if (categories.productive.includes(domain)) {
        productiveTime += time
      }
    }

    // Sort sites by time spent
    siteStats.sort((a, b) => b.time - a.time)

    // Update UI
    document.getElementById("totalTime").textContent = formatTime(totalTime)

    const productivityPercentage = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0
    document.getElementById("productivityScore").textContent = `${productivityPercentage}%`
    document.getElementById("productivityFill").style.width = `${productivityPercentage}%`

    // Display top sites
    const topSitesContainer = document.getElementById("topSites")
    topSitesContainer.innerHTML = ""

    const topSites = siteStats.slice(0, 5)
    if (topSites.length === 0) {
      topSitesContainer.innerHTML =
        '<div style="text-align: center; color: #64748b; padding: 20px;">No activity today</div>'
    } else {
      topSites.forEach((site) => {
        const siteElement = createSiteElement(site.domain, site.time)
        topSitesContainer.appendChild(siteElement)
      })
    }

    // Hide loading, show content
    document.getElementById("loading").style.display = "none"
    document.getElementById("content").style.display = "block"
  } catch (error) {
    console.error("Error loading stats:", error)
    document.getElementById("loading").textContent = "Error loading stats"
  }
}

function createSiteElement(domain, time) {
  const siteItem = document.createElement("div")
  siteItem.className = "site-item"

  siteItem.innerHTML = `
    <img class="site-favicon" src="https://www.google.com/s2/favicons?domain=${domain}" alt="${domain}">
    <div class="site-info">
      <div class="site-domain">${domain}</div>
      <div class="site-time">${formatTime(time)}</div>
    </div>
  `

  return siteItem
}

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return `${seconds}s`
  }
}

function setupEventListeners() {
  document.getElementById("openDashboard").addEventListener("click", () => {
    window.chrome.tabs.create({ url: "http://localhost:3000/dashboard" })
    window.close()
  })

  document.getElementById("openSettings").addEventListener("click", () => {
    window.chrome.runtime.openOptionsPage()
    window.close()
  })
}
