import { Listbox } from "@headlessui/react";
import { Filter } from "lucide-react";

const sportOptions = [
  { value: "", label: "Semua Cabang Olahraga" },
  { value: "Mini Soccer", label: "Mini Soccer" },
  { value: "Futsal", label: "Futsal" },
  { value: "Basket", label: "Basket" },
  { value: "Badminton", label: "Badminton" },
  { value: "Tennis", label: "Tennis" },
];

export default function SportTypeDropdown(props: { filters: { sportType: string; surface: string }, setFilters: (filters: { sportType: string; surface: string }) => void }) {
  const { filters, setFilters } = props;
  const selectedOption =
    sportOptions.find((opt) => opt.value === filters.sportType) ||
    sportOptions[0];

  return (
    <div className="w-full">
      <Listbox
        value={selectedOption}
        onChange={(option) =>
          setFilters({ ...filters, sportType: option.value })
        }
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <Listbox.Button className="block cursor-pointer w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-left text-sm md:text-base">
            {selectedOption.label}
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
            {sportOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                    active ? "bg-green-100 text-green-900" : "text-gray-900"
                  }`
                }
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
