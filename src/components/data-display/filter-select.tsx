import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: FilterSelectOption[];
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  className = "flex-1 w-full max-w-sm",
}: FilterSelectProps) {
  return (
    <div className={className}>
      <label className="text-caption font-mono uppercase tracking-wider text-mute mb-2 block">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
