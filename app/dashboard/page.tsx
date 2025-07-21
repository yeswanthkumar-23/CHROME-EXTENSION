"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, Clock, TrendingUp, Settings, LogOut, Globe, Target, RefreshCw, AlertTriangle } from "lucide-react"
import { TimeChart } from "@/components/time-chart"
import { ProductivityChart } from "@/components/productivity-chart"
import { WebsiteList } from "@/components/website-list"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { HourlyHeatmap } from "@/components/hourly-heatmap"
import { useAuth } from "@/lib/auth-context"
import { useApp } from "../providers"

interface DashboardData {
  todayStats: {
    totalTime: number
    productiveTime: number
    unproductiveTime: number
    neutralTime: number
    topSites: Array<{ domain: string; time: number; category: string }>
  }
  weeklyStats: {
    totalTime: number
    productiveTime: number
    unproductiveTime: number
    neutralTime: number
    dailyBreakdown: Array<{
      date: string
      totalTime: number
      productiveTime: number
      unproductiveTime: number
      neutralTime: number
    }>
  }
  hourlyBreakdown: Array<{
    hour: number
    productive: number
    unproductive: number
    neutral: number
  }>
  categoryBreakdown: {
    productive: number
    unproductive: number
    neutral: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { categories } = useApp()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("7d") // 1d, 7d, 30d

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        loadDashboardData()
      }
    }
  }, [user, loading, router, timeRange])

  const loadDashboardData = async () => {
    try {
      setDataLoading(true)
      setError("")

      // Generate sample data
      const data = generateSampleData()
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setDataLoading(false)
    }
  }

  const generateSampleData = (): DashboardData => {
    const today = new Date().toISOString().split("T")[0]
    const sampleSites = [
      { domain: "github.com", time: 7200000, category: "productive" },
      { domain: "stackoverflow.com", time: 5400000, category: "productive" },
      { domain: "youtube.com", time: 3600000, category: "unproductive" },
      { domain: "docs.google.com", time: 3600000, category: "productive" },
      { domain: "twitter.com", time: 2700000, category: "unproductive" },
      { domain: "medium.com", time: 2400000, category: "productive" },
      { domain: "reddit.com", time: 1800000, category: "unproductive" },
      { domain: "figma.com", time: 1800000, category: "productive" },
    ]

    const totalTime = sampleSites.reduce((sum, site) => sum + site.time, 0)
    const productiveTime = sampleSites
      .filter((site) => site.category === "productive")
      .reduce((sum, site) => sum + site.time, 0)
    const unproductiveTime = sampleSites
      .filter((site) => site.category === "unproductive")
      .reduce((sum, site) => sum + site.time, 0)
    const neutralTime = totalTime - productiveTime - unproductiveTime

    const dailyBreakdown = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTotal = Math.floor(Math.random() * 28800000) + 7200000 // 2-10 hours
      const dayProductive = Math.floor(dayTotal * (0.4 + Math.random() * 0.4)) // 40-80% productive
      const dayUnproductive = Math.floor(dayTotal * (0.1 + Math.random() * 0.3)) // 10-40% unproductive
      const dayNeutral = dayTotal - dayProductive - dayUnproductive

      dailyBreakdown.push({
        date: dateString,
        totalTime: dayTotal,
        productiveTime: dayProductive,
        unproductiveTime: dayUnproductive,
        neutralTime: dayNeutral,
      })
    }

    return {
      todayStats: {
        totalTime,
        productiveTime,
        unproductiveTime,
        neutralTime,
        topSites: sampleSites,
      },
      weeklyStats: {
        totalTime: dailyBreakdown.reduce((sum, day) => sum + day.totalTime, 0),
        productiveTime: dailyBreakdown.reduce((sum, day) => sum + day.productiveTime, 0),
        unproductiveTime: dailyBreakdown.reduce((sum, day) => sum + day.unproductiveTime, 0),
        neutralTime: dailyBreakdown.reduce((sum, day) => sum + day.neutralTime, 0),
        dailyBreakdown,
      },
      hourlyBreakdown: generateHourlyData(),
      categoryBreakdown: {
        productive: Math.round((productiveTime / totalTime) * 100),
        unproductive: Math.round((unproductiveTime / totalTime) * 100),
        neutral: Math.round((neutralTime / totalTime) * 100),
      },
    }
  }

  const generateHourlyData = () => {
    const hourlyData = []
    for (let i = 0; i < 24; i++) {
      // Generate more activity during work hours (9-17)
      const multiplier = i >= 9 && i <= 17 ? 3 : 1
      const productive = Math.floor(Math.random() * 60 * multiplier)
      const unproductive = Math.floor(Math.random() * 30 * multiplier)
      const neutral = Math.floor(Math.random() * 15 * multiplier)

      hourlyData.push({
        hour: i,
        productive,
        unproductive,
        neutral,
      })
    }
    return hourlyData
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Productivity Dashboard</h1>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={loadDashboardData} className="ml-4 bg-transparent">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  const todayProductivity = dashboardData?.todayStats.totalTime
    ? Math.round((dashboardData.todayStats.productiveTime / dashboardData.todayStats.totalTime) * 100)
    : 0

  const weeklyProductivity = dashboardData?.weeklyStats.totalTime
    ? Math.round((dashboardData.weeklyStats.productiveTime / dashboardData.weeklyStats.totalTime) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Productivity Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <Button
              variant={timeRange === "1d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("1d")}
              className="rounded-l-md rounded-r-none"
            >
              Today
            </Button>
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7d")}
              className="rounded-none border-l-0 border-r-0"
            >
              Week
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30d")}
              className="rounded-r-md rounded-l-none"
            >
              Month
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={loadDashboardData} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(dashboardData?.todayStats.totalTime || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {formatTime(dashboardData?.todayStats.productiveTime || 0)} productive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayProductivity}%</div>
              <Progress
                value={todayProductivity}
                className="mt-2"
                style={
                  {
                    backgroundColor: "hsl(var(--muted))",
                    "--progress-color":
                      todayProductivity >= 70
                        ? "hsl(142.1 76.2% 36.3%)"
                        : todayProductivity >= 40
                          ? "hsl(48 96.5% 53.1%)"
                          : "hsl(0 84.2% 60.2%)",
                  } as React.CSSProperties
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {timeRange === "1d" ? "Today's" : "Average"} Productivity
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyProductivity}%</div>
              <p className="text-xs text-muted-foreground">
                {formatTime(dashboardData?.weeklyStats.totalTime || 0)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.todayStats.topSites.length || 0}</div>
              <p className="text-xs text-muted-foreground">websites visited</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Trend</CardTitle>
                  <CardDescription>Your productivity score over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductivityChart data={dashboardData?.weeklyStats.dailyBreakdown || []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Sites</CardTitle>
                  <CardDescription>Websites where you spent the most time</CardDescription>
                </CardHeader>
                <CardContent>
                  <WebsiteList sites={dashboardData?.todayStats.topSites || []} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>How your time is distributed across categories</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CategoryPieChart
                    data={dashboardData?.categoryBreakdown || { productive: 33, unproductive: 33, neutral: 34 }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hourly Activity</CardTitle>
                  <CardDescription>When you're most active during the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <HourlyHeatmap data={dashboardData?.hourlyBreakdown || []} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>Detailed breakdown of your time usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <TimeChart data={dashboardData?.weeklyStats.dailyBreakdown || []} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productive Time</CardTitle>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(dashboardData?.weeklyStats.productiveTime || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.categoryBreakdown.productive || 0}% of total time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unproductive Time</CardTitle>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTime(dashboardData?.weeklyStats.unproductiveTime || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.categoryBreakdown.unproductive || 0}% of total time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Neutral Time</CardTitle>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(dashboardData?.weeklyStats.neutralTime || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.categoryBreakdown.neutral || 0}% of total time
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="websites" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Productive Sites
                  </CardTitle>
                  <CardDescription>Websites classified as productive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.productive.map((site) => (
                      <Badge key={site} variant="secondary" className="bg-green-100 text-green-800">
                        {site}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Unproductive Sites
                  </CardTitle>
                  <CardDescription>Websites classified as unproductive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.unproductive.map((site) => (
                      <Badge key={site} variant="secondary" className="bg-red-100 text-red-800">
                        {site}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Tracked Websites</CardTitle>
                <CardDescription>Complete list of websites you've visited</CardDescription>
              </CardHeader>
              <CardContent>
                <WebsiteList sites={dashboardData?.todayStats.topSites || []} showAll />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Time Tracking</CardTitle>
                <CardDescription>Your time usage by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dashboardData?.weeklyStats.dailyBreakdown
                    .slice()
                    .reverse()
                    .map((day) => (
                      <div key={day.date} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </h4>
                          <span className="text-sm text-gray-500">{formatTime(day.totalTime)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${(day.productiveTime / day.totalTime) * 100}%`,
                            }}
                          ></div>
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(day.unproductiveTime / day.totalTime) * 100}%`,
                            }}
                          ></div>
                          <div
                            className="h-full bg-gray-400"
                            style={{
                              width: `${(day.neutralTime / day.totalTime) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex text-xs text-gray-500 justify-between">
                          <span>Productive: {formatTime(day.productiveTime)}</span>
                          <span>Unproductive: {formatTime(day.unproductiveTime)}</span>
                          <span>Neutral: {formatTime(day.neutralTime)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function formatTime(milliseconds: number): string {
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
