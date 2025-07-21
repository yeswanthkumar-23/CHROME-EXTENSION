// Options page script
let categories = { productive: [], unproductive: [] }
let isAuthenticated = false
const chrome = window.chrome // Declare the chrome variable

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings()
  await checkAuthStatus()
})

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(["categories"])
    categories = result.categories || { productive: [], unproductive: [] }

    renderWebsiteLists()
  } catch (error) {
    console.error("Error loading settings:", error)
  }
}

function renderWebsiteLists() {
  renderWebsiteList("productive", categories.productive)
  renderWebsiteList("unproductive", categories.unproductive)
}

function renderWebsiteList(type, websites) {
  const container = document.getElementById(`${type}List`)
  container.innerHTML = ""

  websites.forEach((website) => {
    const tag = document.createElement("div")
    tag.className = `website-tag ${type}`
    tag.innerHTML = `
      <span>${website}</span>
      <button class="remove-btn" onclick="removeWebsite('${type}', '${website}')">×</button>
    `
    container.appendChild(tag)
  })
}

async function addWebsite(type) {
  const input = document.getElementById(`${type}Input`)
  const domain = input.value.trim().toLowerCase()

  if (!domain) return

  // Basic domain validation
  if (!domain.includes(".") || domain.includes(" ")) {
    alert("Please enter a valid domain (e.g., example.com)")
    return
  }

  // Remove www. prefix if present
  const cleanDomain = domain.replace(/^www\./, "")

  // Check if already exists
  if (categories[type].includes(cleanDomain)) {
    alert("This website is already in the list")
    return
  }

  // Remove from other category if exists
  const otherType = type === "productive" ? "unproductive" : "productive"
  categories[otherType] = categories[otherType].filter((site) => site !== cleanDomain)

  // Add to current category
  categories[type].push(cleanDomain)

  // Save and update UI
  await saveCategories()
  renderWebsiteLists()
  input.value = ""
}

async function removeWebsite(type, website) {
  categories[type] = categories[type].filter((site) => site !== website)
  await saveCategories()
  renderWebsiteLists()
}

async function saveCategories() {
  try {
    await chrome.storage.local.set({ categories })
    showSaveStatus()
  } catch (error) {
    console.error("Error saving categories:", error)
  }
}

function showSaveStatus() {
  const status = document.getElementById("saveStatus")
  status.classList.add("show")
  setTimeout(() => {
    status.classList.remove("show")
  }, 2000)
}

async function checkAuthStatus() {
  try {
    const result = await chrome.storage.local.get(["userToken", "userEmail"])
    isAuthenticated = !!result.userToken

    const authStatus = document.getElementById("authStatus")
    const authButton = document.getElementById("authButton")

    if (isAuthenticated) {
      authStatus.textContent = `Connected as ${result.userEmail || "User"}`
      authStatus.className = "auth-status connected"
      authButton.textContent = "Disconnect"
    } else {
      authStatus.textContent = "Not connected - data stored locally only"
      authStatus.className = "auth-status disconnected"
      authButton.textContent = "Connect Account"
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
  }
}

async function handleAuth() {
  if (isAuthenticated) {
    // Disconnect
    await chrome.storage.local.remove(["userToken", "userEmail"])
    await checkAuthStatus()
    showSaveStatus()
  } else {
    // Connect - open dashboard login
    chrome.tabs.create({ url: "http://localhost:3000/login?source=extension" })
  }
}

async function exportData() {
  try {
    const result = await chrome.storage.local.get(["timeEntries", "dailyStats", "categories"])
    const data = {
      timeEntries: result.timeEntries || [],
      dailyStats: result.dailyStats || {},
      categories: result.categories || {},
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `productivity-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting data:", error)
    alert("Error exporting data")
  }
}

// Handle Enter key in input fields
document.getElementById("productiveInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addWebsite("productive")
})

document.getElementById("unproductiveInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addWebsite("unproductive")
})
