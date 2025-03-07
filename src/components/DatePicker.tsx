import "react-day-picker/dist/style.css";
import { useState } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
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
];

export default function DatePicker({ selectedDate, onSelect }: any) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [month, setMonth] = useState(selectedDate || new Date());

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm ${
            !selectedDate ? "text-muted-foreground" : ""
          }`}
        >
          <CalendarIcon className="h-5 w-5 text-primary" />
          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4 max-h-[380px] rounded-lg shadow-lg bg-white border">
        {/* Month & Year Selection */}
        <div className="flex items-center justify-between gap-2">
          <Select
            onValueChange={(value) =>
              setMonth(new Date(month.getFullYear(), Number(value)))
            }
          >
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder={months[month.getMonth()]} />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, index) => (
                <SelectItem key={m} value={String(index)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) =>
              setMonth(new Date(Number(value), month.getMonth()))
            }
          >
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder={String(month.getFullYear())} />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendar Component */}
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onSelect(date);
              setPopoverOpen(false);
            }
          }}
          month={month}
          onMonthChange={setMonth}
          className="rounded-lg"
          classNames={{
            caption: "flex justify-center relative items-center",
            months: "flex flex-col",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell:
              "text-muted-foreground text-sm font-medium flex-1 text-center",
            row: "flex w-full ",
            cell: "relative text-center text-sm cursor-pointer rounded-md hover:bg-gray-100 focus:bg-gray-200 flex-1",
            day_selected: "bg-primary text-white",
            day_today: "font-bold",
            day_disabled: "text-gray-300 cursor-not-allowed",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
