import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onApply: () => void
  onReset: () => void
}

export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onReset,
}: DateRangePickerProps) => {
  const handleQuickSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    onStartDateChange(start)
    onEndDateChange(end)
  }

  const handleThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date()
    onStartDateChange(start)
    onEndDateChange(end)
  }

  const handleLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    onStartDateChange(start)
    onEndDateChange(end)
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
      {/* Quick Select Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleQuickSelect(7)}
          className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          Last 7 days
        </button>
        <button
          onClick={() => handleQuickSelect(30)}
          className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          Last 30 days
        </button>
        <button
          onClick={handleThisMonth}
          className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          This month
        </button>
        <button
          onClick={handleLastMonth}
          className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          Last month
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            <Calendar className="mb-1 inline h-4 w-4" /> Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            maxDate={endDate || new Date()}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            wrapperClassName="w-full"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            <Calendar className="mb-1 inline h-4 w-4" /> End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || undefined}
            maxDate={new Date()}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            wrapperClassName="w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onApply}
            disabled={!startDate && !endDate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Filter
          </button>
          <button
            onClick={onReset}
            className="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </div>

      {(startDate || endDate) && (
        <div className="mt-3 text-sm text-gray-400">
          {startDate && endDate ? (
            <>
              Showing data from <strong>{startDate.toLocaleDateString()}</strong> to{' '}
              <strong>{endDate.toLocaleDateString()}</strong>
            </>
          ) : startDate ? (
            <>
              Showing data from <strong>{startDate.toLocaleDateString()}</strong>
            </>
          ) : (
            <>
              Showing data until <strong>{endDate?.toLocaleDateString()}</strong>
            </>
          )}
        </div>
      )}
    </div>
  )
}
