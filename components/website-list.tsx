"use client"

import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface WebsiteListProps {
  sites: Array<{
    domain: string
    time: number
    category: string
  }>
  showAll?: boolean
}

export function WebsiteList({ sites, showAll = false }: WebsiteListProps) {
  const [showAllSites, setShowAllSites] = useState(false)

  const formatTime = (milliseconds: number): string => {
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

  if (sites.length === 0) {
    return <div className="text-center py-8 text-gray-500">No activity recorded</div>
  }

  const displaySites = showAllSites || showAll ? sites : sites.slice(0, 5)

  return (
    <div className="space-y-3">
      {displaySites.map((site, index) => (
        <div key={`${site.domain}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${site.domain}`}
              alt={site.domain}
              className="w-4 h-4"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=16&width=16"
              }}
            />
            <span className="font-medium text-sm">{site.domain}</span>
            <Badge
              variant={
                site.category === "productive"
                  ? "default"
                  : site.category === "unproductive"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs"
            >
              {site.category}
            </Badge>
          </div>
          <span className="text-sm font-semibold">{formatTime(site.time)}</span>
        </div>
      ))}

      {!showAll && sites.length > 5 && !showAllSites && (
        <Button
          variant="ghost"
          className="w-full text-sm text-gray-500 hover:text-gray-700"
          onClick={() => setShowAllSites(true)}
        >
          Show {sites.length - 5} more sites
        </Button>
      )}

      {!showAll && showAllSites && (
        <Button
          variant="ghost"
          className="w-full text-sm text-gray-500 hover:text-gray-700"
          onClick={() => setShowAllSites(false)}
        >
          Show less
        </Button>
      )}
    </div>
  )
}
