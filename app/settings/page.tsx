"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, X, Download, Upload } from "lucide-react"
import { useApp } from "../providers"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { categories, updateCategories } = useApp()
  const [newSite, setNewSite] = useState({ productive: "", unproductive: "" })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("categories")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const addWebsite = async (type: "productive" | "unproductive") => {
    const domain = newSite[type].trim().toLowerCase()
    if (!domain) return

    // Basic domain validation
    if (!domain.includes(".") || domain.includes(" ")) {
      setMessage("Please enter a valid domain (e.g., example.com)")
      return
    }

    const cleanDomain = domain.replace(/^www\./, "")

    // Check if already exists
    if (categories[type].includes(cleanDomain)) {
      setMessage("This website is already in the list")
      return
    }

    // Remove from other category if exists
    const otherType = type === "productive" ? "unproductive" : "productive"
    const newCategories = {
      ...categories,
      [otherType]: categories[otherType].filter((site) => site !== cleanDomain),
      [type]: [...categories[type], cleanDomain],
    }

    updateCategories(newCategories)
    setNewSite({ ...newSite, [type]: "" })
    setMessage("Website added successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const removeWebsite = async (type: "productive" | "unproductive", domain: string) => {
    const newCategories = {
      ...categories,
      [type]: categories[type].filter((site) => site !== domain),
    }
    updateCategories(newCategories)
    setMessage("Website removed successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const exportData = async () => {
    try {
      const data = {
        categories,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `productivity-data-${new Date().toISOString().split("T")[0]}.json`
      a.click()

      URL.revokeObjectURL(url)
      setMessage("Data exported successfully!")
    } catch (error) {
      console.error("Error exporting data:", error)
      setMessage("Error exporting data")
    }
  }

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.categories) {
        updateCategories(data.categories)
      }

      setMessage("Data imported successfully!")
    } catch (error) {
      console.error("Error importing data:", error)
      setMessage("Error importing data")
    }
  }

  const clearAllData = async () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      try {
        // Clear localStorage
        localStorage.removeItem("productivity-categories")

        // Reset to defaults
        const defaultCategories = {
          productive: ["github.com", "stackoverflow.com", "developer.mozilla.org"],
          unproductive: ["facebook.com", "instagram.com", "youtube.com"],
        }
        updateCategories(defaultCategories)

        setMessage("All data cleared successfully!")
      } catch (error) {
        console.error("Error clearing data:", error)
        setMessage("Error clearing data")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your productivity tracking experience</p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Productive Websites
                </CardTitle>
                <CardDescription>Websites that contribute to your productivity and work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.productive.map((site) => (
                    <Badge
                      key={site}
                      variant="secondary"
                      className="bg-green-100 text-green-800 flex items-center gap-1"
                    >
                      {site}
                      <button onClick={() => removeWebsite("productive", site)} className="ml-1 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter domain (e.g., github.com)"
                    value={newSite.productive}
                    onChange={(e) => setNewSite({ ...newSite, productive: e.target.value })}
                    onKeyPress={(e) => e.key === "Enter" && addWebsite("productive")}
                  />
                  <Button onClick={() => addWebsite("productive")} disabled={saving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Unproductive Websites
                </CardTitle>
                <CardDescription>Websites that are distracting or not work-related</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.unproductive.map((site) => (
                    <Badge key={site} variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1">
                      {site}
                      <button onClick={() => removeWebsite("unproductive", site)} className="ml-1 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter domain (e.g., facebook.com)"
                    value={newSite.unproductive}
                    onChange={(e) => setNewSite({ ...newSite, unproductive: e.target.value })}
                    onKeyPress={(e) => e.key === "Enter" && addWebsite("unproductive")}
                  />
                  <Button onClick={() => addWebsite("unproductive")} disabled={saving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export, import, or clear your productivity data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>

                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: "none" }}
                      id="import-file"
                    />
                    <Button onClick={() => document.getElementById("import-file")?.click()} variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>

                  <Button onClick={clearAllData} variant="destructive">
                    Clear All Data
                  </Button>
                </div>

                <Alert>
                  <AlertDescription>
                    Export your data to backup your productivity history. Import data to restore from a previous backup.
                    All data is stored locally in your browser.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
