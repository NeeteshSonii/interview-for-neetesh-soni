import { useState } from "react"
import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Original Calendar component for compatibility with date-range-picker
export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      captionLayout="dropdown"
      fromYear={2006}
      toYear={new Date().getFullYear() + 2}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center gap-1",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex gap-2",
        dropdown_month: "relative",
        dropdown_year: "relative", 
        dropdown: cn(
          "px-3 py-1 text-sm bg-background border border-input rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "appearance-none cursor-pointer min-w-[80px]"
        ),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent transition-opacity"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex justify-center items-center",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "transition-all duration-200 ease-in-out",
          "hover:bg-accent/50 rounded-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-all duration-200 ease-in-out",
          "rounded-md",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground rounded-md",
        day_today: "bg-accent text-accent-foreground font-semibold border border-primary/20 rounded-md",
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        day_range_start: "bg-primary text-primary-foreground rounded-l-md rounded-r-none hover:bg-primary/90 font-medium",
        day_range_end: "bg-primary text-primary-foreground rounded-r-md rounded-l-none hover:bg-primary/90 font-medium", 
        day_range_middle:
          "aria-selected:bg-primary/15 aria-selected:text-foreground hover:bg-primary/25 transition-colors rounded-none bg-primary/10 font-medium",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}

// New Custom Calendar Component
const timePresets = ["Past week", "Past month", "Past 3 months", "Past 6 months", "Past year", "Past 2 years"]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay()
}

function generateCalendarDays(month: number, year: number) {
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return days
}

export default function CalendarComponent() {
  const [selectedPreset, setSelectedPreset] = useState("Past month")
  const [currentDate, setCurrentDate] = useState(new Date(2021, 0)) // January 2021

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  const currentMonthDays = generateCalendarDays(currentMonth, currentYear)
  const nextMonthDays = generateCalendarDays(nextMonth, nextYear)

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleMonthChange = (monthIndex: number, isSecondCalendar = false) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (isSecondCalendar) {
        // Adjust the base month to show the selected month as the second calendar
        newDate.setMonth(monthIndex - 1)
      } else {
        newDate.setMonth(monthIndex)
      }
      return newDate
    })
  }

  const handleYearChange = (year: number, isSecondCalendar = false) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setFullYear(year)
      if (isSecondCalendar && currentMonth === 11) {
        // If we're showing December as first month, adjust for year change
        newDate.setMonth(11)
      }
      return newDate
    })
  }

  const CalendarGrid = ({ days }: { days: (number | null)[]; month: number; year: number }) => (
    <div className="grid grid-cols-7 gap-1">
      {daysOfWeek.map((day) => (
        <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
          {day}
        </div>
      ))}
      {days.map((day, index) => (
        <div
          key={index}
          className={cn(
            "h-8 flex items-center justify-center text-sm cursor-pointer hover:bg-gray-100 rounded",
            day ? "text-gray-900" : "",
          )}
        >
          {day}
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex bg-white border rounded-lg overflow-hidden max-w-4xl">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50 border-r">
        <div className="p-4 space-y-1">
          {timePresets.map((preset) => (
            <button
              key={preset}
              onClick={() => setSelectedPreset(preset)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-200 transition-colors",
                selectedPreset === preset ? "bg-gray-200 font-medium" : "text-gray-700",
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-8">
            {/* First Month */}
            <div className="flex items-center space-x-2">
              <Select value={months[currentMonth]} onValueChange={(value) => handleMonthChange(months.indexOf(value))}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentYear.toString()}
                onValueChange={(value) => handleYearChange(Number.parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second Month */}
            <div className="flex items-center space-x-2">
              <Select
                value={months[nextMonth]}
                onValueChange={(value) => handleMonthChange(months.indexOf(value), true)}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={nextYear.toString()}
                onValueChange={(value) => handleYearChange(Number.parseInt(value), true)}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => nextYear - 5 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grids */}
        <div className="grid grid-cols-2 gap-8">
          <CalendarGrid days={currentMonthDays} month={currentMonth} year={currentYear} />
          <CalendarGrid days={nextMonthDays} month={nextMonth} year={nextYear} />
        </div>
      </div>
    </div>
  )
}

// Enhanced Calendar with SpaceX Integration capability
export function EnhancedSpaceXCalendar({
  launches = [],
  onDateSelect,
  onRangeSelect,
  className,
}: {
  launches?: { date_local?: string; date_utc: string; success?: boolean | null }[]
  onDateSelect?: (date: Date) => void
  onRangeSelect?: (range: { from: Date; to: Date }) => void
  className?: string
}) {
  const [selectedPreset, setSelectedPreset] = useState("Past month")
  const [currentDate, setCurrentDate] = useState(new Date(2021, 0)) // January 2021
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  const currentMonthDays = generateCalendarDays(currentMonth, currentYear)
  const nextMonthDays = generateCalendarDays(nextMonth, nextYear)

  // Helper function to calculate date range based on preset
  const getDateRangeFromPreset = (preset: string) => {
    const now = new Date()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    let from: Date

    switch (preset) {
      case "Past week":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "Past month":
        from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "Past 3 months":
        from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "Past 6 months":
        from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case "Past year":
        from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      case "Past 2 years":
        from = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
        break
      default:
        from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    return { from, to }
  }

  // Handle preset selection
  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset)
    const range = getDateRangeFromPreset(preset)
    onRangeSelect?.(range)
  }

  // Helper function to check if a date has launches
  const hasLaunches = (day: number, month: number, year: number) => {
    if (!launches.length) return false
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return launches.some(launch => {
      try {
        const launchDate = new Date(launch.date_local || launch.date_utc)
        const launchDateStr = `${launchDate.getFullYear()}-${String(launchDate.getMonth() + 1).padStart(2, '0')}-${String(launchDate.getDate()).padStart(2, '0')}`
        return launchDateStr === dateStr
      } catch {
        return false
      }
    })
  }

  // Helper function to get launch success status for a date
  const getLaunchStatus = (day: number, month: number, year: number) => {
    if (!launches.length) return null
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayLaunches = launches.filter(launch => {
      try {
        const launchDate = new Date(launch.date_local || launch.date_utc)
        const launchDateStr = `${launchDate.getFullYear()}-${String(launchDate.getMonth() + 1).padStart(2, '0')}-${String(launchDate.getDate()).padStart(2, '0')}`
        return launchDateStr === dateStr
      } catch {
        return false
      }
    })
    
    if (dayLaunches.length === 0) return null
    if (dayLaunches.every(l => l.success === true)) return 'success'
    if (dayLaunches.some(l => l.success === false)) return 'failure'
    return 'mixed'
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleMonthChange = (monthIndex: number, isSecondCalendar = false) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (isSecondCalendar) {
        newDate.setMonth(monthIndex - 1)
      } else {
        newDate.setMonth(monthIndex)
      }
      return newDate
    })
  }

  const handleYearChange = (year: number, isSecondCalendar = false) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setFullYear(year)
      if (isSecondCalendar && currentMonth === 11) {
        newDate.setMonth(11)
      }
      return newDate
    })
  }

  const handleDateClick = (day: number, month: number, year: number) => {
    if (!day) return
    
    const clickedDate = new Date(year, month, day)
    setSelectedDate(clickedDate)
    onDateSelect?.(clickedDate)
  }

  const EnhancedCalendarGrid = ({ days, month, year }: { days: (number | null)[]; month: number; year: number }) => (
    <div className="grid grid-cols-7 gap-1">
      {daysOfWeek.map((day) => (
        <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
          {day}
        </div>
      ))}
      {days.map((day, index) => {
        const isToday = day && 
          new Date().getDate() === day && 
          new Date().getMonth() === month && 
          new Date().getFullYear() === year

        const isSelected = selectedDate && day &&
          selectedDate.getDate() === day &&
          selectedDate.getMonth() === month &&
          selectedDate.getFullYear() === year

        const dayHasLaunches = day ? hasLaunches(day, month, year) : false
        const launchStatus = day ? getLaunchStatus(day, month, year) : null

        return (
          <div
            key={index}
            onClick={() => day && handleDateClick(day, month, year)}
            className={cn(
              "h-8 flex items-center justify-center text-sm cursor-pointer hover:bg-gray-100 rounded relative",
              day ? "text-gray-900" : "",
              isToday && "bg-blue-500 text-white font-semibold",
              isSelected && !isToday && "bg-blue-100 text-blue-900 font-medium",
              dayHasLaunches && !isToday && !isSelected && "bg-green-100 text-green-800 font-medium border border-green-200",
              launchStatus === 'success' && !isToday && !isSelected && "bg-green-500 text-white font-semibold",
              launchStatus === 'failure' && !isToday && !isSelected && "bg-red-500 text-white font-semibold",
              launchStatus === 'mixed' && !isToday && !isSelected && "bg-yellow-500 text-white font-semibold"
            )}
          >
            {day}
            {dayHasLaunches && (
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className={cn("flex bg-white border rounded-lg overflow-hidden max-w-4xl shadow-lg", className)}>
      {/* Sidebar */}
      <div className="w-48 bg-gradient-to-b from-gray-50 to-gray-100 border-r">
        <div className="p-4 space-y-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Time Range</h3>
          {timePresets.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded hover:bg-white hover:shadow-sm transition-all duration-200",
                selectedPreset === preset ? "bg-white font-medium text-primary shadow-sm border border-primary/20" : "text-gray-700",
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateMonth("prev")} 
            className="h-8 w-8 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-8">
            {/* First Month */}
            <div className="flex items-center space-x-2">
              <Select value={months[currentMonth]} onValueChange={(value) => handleMonthChange(months.indexOf(value))}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentYear.toString()}
                onValueChange={(value) => handleYearChange(Number.parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second Month */}
            <div className="flex items-center space-x-2">
              <Select
                value={months[nextMonth]}
                onValueChange={(value) => handleMonthChange(months.indexOf(value), true)}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={nextYear.toString()}
                onValueChange={(value) => handleYearChange(Number.parseInt(value), true)}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => nextYear - 10 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigateMonth("next")} 
            className="h-8 w-8 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        {launches.length > 0 && (
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Successful Launch</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Failed Launch</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Has Launches</span>
            </div>
          </div>
        )}

        {/* Calendar Grids */}
        <div className="grid grid-cols-2 gap-8">
          <EnhancedCalendarGrid days={currentMonthDays} month={currentMonth} year={currentYear} />
          <EnhancedCalendarGrid days={nextMonthDays} month={nextMonth} year={nextYear} />
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Selected: {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {launches.length > 0 && hasLaunches(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear()) && (
              <p className="text-xs text-blue-600 mt-1">This date has SpaceX launches!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
