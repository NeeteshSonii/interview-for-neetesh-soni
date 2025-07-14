import { useState, useMemo, useCallback } from "react"
import { CalendarIcon, ChevronDown, Filter, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useSpaceXLaunches } from "@/hooks/useSpaceXLaunches"
import type { SpaceXLaunch } from "@/types/spacex"
import { EnhancedSpaceXCalendar } from "@/components/ui/calendar"
import logos from "@/assets/logo"

interface LaunchData {
  id: string
  no: string
  launchedUTC: string
  location: string
  mission: string
  orbit: string
  launchStatus: "Success" | "Failed" | "Upcoming"
  rocket: string
  flightNumber?: number
  missionName?: string
  rocketType?: string
  rocketName?: string
  manufacturer?: string
  nationality?: string
  launchDate?: string
  payloadType?: string
  launchSite?: string
  description?: string | null
  links?: {
    wikipedia?: string
    webcast?: string
    article?: string
  }
}

export default function SpaceXDashboard() {
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchData | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All Time")
  const [selectedLaunchFilter, setSelectedLaunchFilter] = useState("All Launches")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date; to: Date } | null>(null)
  
  const ITEMS_PER_PAGE = 12

  const { data: launches = [], isLoading, error } = useSpaceXLaunches()

  // Helper function to safely parse dates
  const parseDate = (dateString: string) => {
    try {
      return parseISO(dateString)
    } catch {
      return new Date(dateString)
    }
  }

  // Helper function to format launch dates
  const formatLaunchDate = useCallback((dateString: string) => {
    try {
      const date = parseDate(dateString)
      return format(date, "dd MMM yyyy 'at' HH:mm")
    } catch {
      return "Invalid Date"
    }
  }, [])

  // Convert SpaceX API data to our LaunchData interface
  const transformedLaunches: LaunchData[] = useMemo(() => {
    return launches.map((launch: SpaceXLaunch) => {
      const status: LaunchData["launchStatus"] = launch.upcoming 
        ? "Upcoming" 
        : launch.success === true 
          ? "Success" 
          : launch.success === false 
            ? "Failed" 
            : "Upcoming"
      
      return {
        id: launch.id,
        no: '', // Will be set during pagination for sequential numbering
        launchedUTC: formatLaunchDate(launch.date_utc),
        location: launch.launchpad?.name || 'Unknown',
        mission: launch.name,
        orbit: launch.payloads?.[0]?.orbit || 'Unknown',
        launchStatus: status,
        rocket: launch.rocket?.name || 'Unknown',
        flightNumber: launch.flight_number,
        missionName: launch.name,
        rocketType: 'Falcon Series',
        rocketName: launch.rocket?.name || 'Unknown',
        manufacturer: 'SpaceX',
        nationality: 'United States',
        launchDate: formatLaunchDate(launch.date_utc),
        payloadType: 'Satellite',
        launchSite: launch.launchpad?.name || 'Unknown',
        description: launch.details || null,
        links: {
          wikipedia: launch.links?.wikipedia || undefined,
          webcast: launch.links?.webcast || undefined,
          article: launch.links?.article || undefined
        }
      }
    }).sort((a, b) => {
      // Sort by date in descending order (most recent first)
      const dateA = parseDate(launches.find(l => l.id === a.id)?.date_utc || '')
      const dateB = parseDate(launches.find(l => l.id === b.id)?.date_utc || '')
      return dateB.getTime() - dateA.getTime()
    })
  }, [launches, formatLaunchDate])

  // Filter launches based on selected filters and date
  const filteredLaunches = useMemo(() => {
    let filtered = transformedLaunches

    // Filter by launch status
    if (selectedLaunchFilter !== "All Launches") {
      filtered = filtered.filter(launch => launch.launchStatus === selectedLaunchFilter)
    }

    // Filter by selected date if calendar date is selected
    if (selectedDate) {
      filtered = filtered.filter(launch => {
        try {
          const launchDate = parseDate(launches.find(l => l.id === launch.id)?.date_utc || '')
          return (
            launchDate.getDate() === selectedDate.getDate() &&
            launchDate.getMonth() === selectedDate.getMonth() &&
            launchDate.getFullYear() === selectedDate.getFullYear()
          )
        } catch {
          return false
        }
      })
    }

    // Filter by selected date range if a range is selected
    if (selectedDateRange) {
      filtered = filtered.filter(launch => {
        try {
          const launchDate = parseDate(launches.find(l => l.id === launch.id)?.date_utc || '')
          return launchDate >= selectedDateRange.from && launchDate <= selectedDateRange.to
        } catch {
          return false
        }
      })
    }

    return filtered
  }, [transformedLaunches, selectedLaunchFilter, selectedDate, selectedDateRange, launches])

  // Pagination
  const totalPages = Math.ceil(filteredLaunches.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedLaunches = filteredLaunches.slice(startIndex, startIndex + ITEMS_PER_PAGE).map((launch, index) => ({
    ...launch,
    no: (startIndex + index + 1).toString() // Sequential numbering based on display order
  }))

  const getStatusBadge = (status: LaunchData["launchStatus"]) => {
    const variants = {
      Success: "bg-green-100 text-green-800 hover:bg-green-100",
      Failed: "bg-red-100 text-red-800 hover:bg-red-100",
      Upcoming: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    }
    return variants[status]
  }

  const handleCellClick = (launch: LaunchData, field: string) => {
    if (field === "launchedUTC") {
      setIsCalendarOpen(true)
    } else {
      setSelectedLaunch(launch)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedDateRange(null) // Clear range when individual date is selected
    setCurrentPage(1) // Reset to first page when date changes
    setIsCalendarOpen(false)
    setSelectedTimeFilter(`Selected: ${format(date, "dd MMM yyyy")}`)
  }

  const handleDateRangeSelect = (range: { from: Date; to: Date }) => {
    setSelectedDateRange(range)
    setSelectedDate(null) // Clear individual date when range is selected
    setCurrentPage(1) // Reset to first page when range changes
    setIsCalendarOpen(false)
    setSelectedTimeFilter(`${format(range.from, "dd MMM yyyy")} - ${format(range.to, "dd MMM yyyy")}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const clearDateFilter = () => {
    setSelectedDate(null)
    setSelectedDateRange(null)
    setSelectedTimeFilter("All Time")
    setCurrentPage(1)
  }

  if (isLoading || error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logos.spacex} alt="SpaceX Logo" className="h-12 w-auto" />
          </div>
          <p className="text-gray-600 mt-2">
            {isLoading ? "Loading launches..." : "SpaceX Launch Dashboard"}
          </p>
        </div>

        {/* Filters - Disabled during loading/error */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent" disabled={isLoading || !!error}>
              <CalendarIcon className="h-4 w-4" />
              All Time
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Select value="All Launches" disabled={isLoading || !!error}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Launches">All Launches</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">No.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Launched (UTC)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mission</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Orbit</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Launch Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rocket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600">Loading launches...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-red-600 font-medium">Error loading launches</p>
                        <p className="text-gray-500 text-sm">{typeof error === 'string' ? error : 'Unknown error occurred'}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src={logos.spacex} alt="SpaceX Logo" className="h-12 w-auto" />
        </div>
        <p className="text-gray-600 mt-2">
          Showing {filteredLaunches.length} of {transformedLaunches.length} launches
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <CalendarIcon className="h-4 w-4" />
                {selectedTimeFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <EnhancedSpaceXCalendar 
                launches={launches}
                onDateSelect={handleDateSelect}
                onRangeSelect={handleDateRangeSelect}
              />
            </PopoverContent>
          </Popover>

          {(selectedDate || selectedDateRange) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearDateFilter}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear Date
            </Button>
          )}
        </div>

        <Select value={selectedLaunchFilter} onValueChange={setSelectedLaunchFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Launches">All Launches</SelectItem>
            <SelectItem value="Success">Successful</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">No.</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Launched (UTC)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mission</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Orbit</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Launch Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rocket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading launches...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-red-600 font-medium">Error loading launches</p>
                      <p className="text-gray-500 text-sm">{typeof error === 'string' ? error : 'Unknown error occurred'}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : paginatedLaunches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">No launches found</p>
                      <p className="text-gray-500 text-sm">
                        {selectedDate || selectedDateRange || selectedLaunchFilter !== "All Launches" 
                          ? "Try adjusting your filters to see more results" 
                          : "No SpaceX launch data available"}
                      </p>
                    </div>
                    {(selectedDate || selectedDateRange || selectedLaunchFilter !== "All Launches") && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedDate(null)
                          setSelectedDateRange(null)
                          setSelectedLaunchFilter("All Launches")
                          setSelectedTimeFilter("All Time")
                          setCurrentPage(1)
                        }}
                        className="mt-2"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLaunches.map((launch) => (
                <tr key={launch.id} className="hover:bg-gray-50">
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
                    onClick={() => handleCellClick(launch, "no")}
                  >
                    {launch.no}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleCellClick(launch, "launchedUTC")}
                  >
                    {launch.launchedUTC}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
                    onClick={() => handleCellClick(launch, "location")}
                  >
                    {launch.location}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
                    onClick={() => handleCellClick(launch, "mission")}
                  >
                    {launch.mission}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
                    onClick={() => handleCellClick(launch, "orbit")}
                  >
                    {launch.orbit}
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => handleCellClick(launch, "launchStatus")}>
                    <Badge className={cn("text-xs", getStatusBadge(launch.launchStatus))}>{launch.launchStatus}</Badge>
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
                    onClick={() => handleCellClick(launch, "rocket")}
                  >
                    {launch.rocket}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {"<"}
        </Button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1
          const isActive = pageNum === currentPage
          
          return (
            <Button
              key={pageNum}
              variant="outline"
              size="sm"
              className={isActive ? "bg-blue-600 text-white" : ""}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        })}
        
        {totalPages > 5 && (
          <>
            <span className="text-sm text-gray-500">...</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {">"}
        </Button>
      </div>

      {/* Launch Details Dialog */}
      <Dialog open={!!selectedLaunch} onOpenChange={() => setSelectedLaunch(null)}>
        <DialogContent className="max-w-lg p-0">
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4">
            {/* Mission Patch */}
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-blue-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                <path d="M12 16L10.5 20.5L12 22L13.5 20.5L12 16Z"/>
              </svg>
            </div>

            {/* Mission Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">{selectedLaunch?.mission}</h2>
                <Badge
                  className={cn("text-xs font-medium", selectedLaunch && getStatusBadge(selectedLaunch.launchStatus))}
                >
                  {selectedLaunch?.launchStatus}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{selectedLaunch?.rocket}</p>
            </div>
          </div>

          {/* Description */}
          {selectedLaunch?.description && selectedLaunch.description.trim() !== '' && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedLaunch.description.replace(" Wikipedia", "")}
                {selectedLaunch.links?.wikipedia && (
                  <a 
                    href={selectedLaunch.links.wikipedia} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    {" "}Wikipedia
                  </a>
                )}
              </p>
            </div>
          )}

          {/* No description fallback */}
          {(!selectedLaunch?.description || selectedLaunch.description.trim() === '') && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500 italic">
                No mission description available for this launch.
              </p>
            </div>
          )}

          {/* Details */}
          <div className="px-6 pb-6 space-y-4">
            {selectedLaunch?.flightNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Flight Number</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.flightNumber}</span>
              </div>
            )}
            {selectedLaunch?.missionName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mission Name</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.missionName}</span>
              </div>
            )}
            {selectedLaunch?.rocketType && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rocket Type</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.rocketType}</span>
              </div>
            )}
            {selectedLaunch?.rocketName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rocket Name</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.rocketName}</span>
              </div>
            )}
            {selectedLaunch?.manufacturer && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Manufacturer</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.manufacturer}</span>
              </div>
            )}
            {selectedLaunch?.nationality && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nationality</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.nationality}</span>
              </div>
            )}
            {selectedLaunch?.launchDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Launch Date</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.launchDate}</span>
              </div>
            )}
            {selectedLaunch?.payloadType && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payload Type</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.payloadType}</span>
              </div>
            )}
            {selectedLaunch?.orbit && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Orbit</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.orbit}</span>
              </div>
            )}
            {selectedLaunch?.launchSite && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Launch Site</span>
                <span className="text-sm font-medium text-gray-900">{selectedLaunch.launchSite}</span>
              </div>
            )}
          </div>

          {/* External Links */}
          {selectedLaunch?.links && (selectedLaunch.links.webcast || selectedLaunch.links.article) && (
            <div className="px-6 pb-6 pt-0">
              <div className="flex gap-2">
                {selectedLaunch.links.webcast && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(selectedLaunch.links?.webcast, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Watch
                  </Button>
                )}
                {selectedLaunch.links.article && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(selectedLaunch.links?.article, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                    Article
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
