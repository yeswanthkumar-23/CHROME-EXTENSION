"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Clock, TrendingUp, ArrowLeft, Globe, Target } from "lucide-react"
import { TimeChart } from "@/components/time-chart"
import { ProductivityChart } from "@/components/productivity-chart"
import { WebsiteList } from "@/components/website-list"

// Demo data
const demoData = {
  todayStats: {
    totalTime: 28800000, // 8 hours in milliseconds
    productiveTime: 18000000, // 5 hours productive
    topSites: [
      { domain: "github.com", time: 7200000, category: "productive" },
      { domain: "stackoverflow.com", time: 5400000, category: "productive" },
      { domain: "youtube.com", time: 3600000, category: "unproductive" },
      { domain: "docs.google.com", time: 3600000, category: "productive" },
      { domain: "twitter.com", time: 2700000, category: "unproductive" },
      { domain: "medium.com", time: 2400000, category: "productive" },
      { domain: "reddit.com", time: 1800000, category: "unproductive" },
      { domain: "figma.com", time: 1800000, category: "productive" },
    ],
  },
  weeklyStats: {
    totalTime: 144000000, // 40 hours total
    productiveTime: 100800000, // 28 hours productive
    dailyBreakdown: [
      { date: "2024-01-15", totalTime: 25200000, productiveTime: 18000000 },
      { date: "2024-01-16", totalTime: 21600000, productiveTime: 14400000 },
      { date: "2024-01-17", totalTime: 19800000, productiveTime: 14400000 },
      { date: "2024-01-18", totalTime: 23400000, productiveTime: 16200000 },
      { date: "2024-01-19", totalTime: 25200000, productiveTime: 18000000 },
      { date: "2024-01-20", totalTime: 14400000, productiveTime: 10800000 },
      { date: "2024-01-21", totalTime: 14400000, productiveTime: 9000000 },
    ],
  },
  categories: {
    productive: ["github.com", "stackoverflow.com", "docs.google.com", "medium.com", "figma.com", "notion.so"],
    unproductive: ["youtube.com", "twitter.com", "reddit.com", "facebook.com", "instagram.com", "tiktok.com"],
  },
}

export default function DemoPage() {
  const router = useRouter()

  const todayProductivity = Math.round((demoData.todayStats.productiveTime / demoData.todayStats.totalTime) * 100)
  const weeklyProductivity = Math.round((demoData.weeklyStats.productiveTime / demoData.weeklyStats.totalTime) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={() => router.push("/")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Demo Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Demo Mode
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(demoData.todayStats.totalTime)}</div>
              <p className="text-xs text-muted-foreground">
                {formatTime(demoData.todayStats.productiveTime)} productive
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
              <Progress value={todayProductivity} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyProductivity}%</div>
              <p className="text-xs text-muted-foreground">{formatTime(demoData.weeklyStats.totalTime)} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoData.todayStats.topSites.length}</div>
              <p className="text-xs text-muted-foreground">websites visited today</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Productivity Trend</CardTitle>
                  <CardDescription>Your productivity score over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductivityChart data={demoData.weeklyStats.dailyBreakdown} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Top Sites</CardTitle>
                  <CardDescription>Websites where you spent the most time today</CardDescription>
                </CardHeader>
                <CardContent>
                  <WebsiteList sites={demoData.todayStats.topSites} />
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
                <TimeChart data={demoData.weeklyStats.dailyBreakdown} />
              </CardContent>
            </Card>
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
                    {demoData.categories.productive.map((site) => (
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
                    {demoData.categories.unproductive.map((site) => (
                      <Badge key={site} variant="secondary" className="bg-red-100 text-red-800">
                        {site}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
