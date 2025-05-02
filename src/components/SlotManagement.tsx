import { TimeSlot } from "@/types/field";
import { formatCurrency } from "@/utils/formatCurrency";
import { useEffect, useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define the DayOfWeek enum
enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

// Slot interface
interface SlotManagementProps {
  timeSlots: TimeSlot[];
  setTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

export default function SlotManagement({
  timeSlots,
  setTimeSlots,
}: SlotManagementProps) {
  // State for expanding/collapsing days
  const [expandedDays, setExpandedDays] = useState<Set<DayOfWeek>>(new Set());
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    if (timeSlots.length === 0) return;

    const isSorted = timeSlots.every((slot, idx, arr) => {
      if (idx === 0) return true;
      if (arr[idx - 1].day < slot.day) return true;
      if (
        arr[idx - 1].day === slot.day &&
        arr[idx - 1].startTime <= slot.startTime
      )
        return true;
      return false;
    });

    if (!isSorted) {
      const sortedSlots = [...timeSlots].sort((a, b) => {
        if (a.day < b.day) return -1;
        if (a.day > b.day) return 1;
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return 0;
      });

      setTimeSlots(sortedSlots);
    }
  }, []);

  // Toggle the expanded state of the day
  const toggleDay = (day: DayOfWeek) => {
    const updatedDays = new Set(expandedDays);
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    setExpandedDays(updatedDays);
  };

  // Handle changes to the time slot
  const handleTimeSlotChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setTimeSlots(updatedSlots);
  };

  const handleAddSlot = (day: DayOfWeek) => {
    const newSlot = {
      id: uuidv4(), // id unik
      day,
      startTime: "",
      endTime: "",
      price: 0,
    };
    setTimeSlots((prev) => [...prev, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    const updatedSlots = [...timeSlots];
    updatedSlots.splice(index, 1);
    setTimeSlots(updatedSlots);
  };

  return (
    <div className="overflow-x-auto">
      <label className="block text-gray-700 font-semibold mb-2 w-full">
        Slot Waktu & Harga
      </label>

      {/* Render each day */}
      {Object.values(DayOfWeek).map((day) => (
        <div key={day} className="mb-4 shadow-lg p-4 border-2 rounded-lg">
          <div className="flex justify-between items-center w-full">
            {/* Day Name */}
            <button
              type="button"
              onClick={() => toggleDay(day)}
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {day}
            </button>

            {/* Tampilkan/Sembunyikan Jadwal */}
            <button
              type="button"
              onClick={() => toggleDay(day)}
              className="text-sm text-blue-600 hover:underline"
            >
              {expandedDays.has(day)
                ? "Sembunyikan Jadwal"
                : "Tampilkan Jadwal"}
            </button>
          </div>

          {/* Show time slots when day is expanded */}
          {expandedDays.has(day) && (
            <div className="overflow-x-auto mt-2">
              <div className="flex flex-col min-w-max">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={({ active, over }) => {
                    if (!over || active.id === over.id) return;

                    const slotsForDay = timeSlots
                      .map((slot, index) => ({ ...slot, index }))
                      .filter((slot) => slot.day === day);

                    const oldIndex = slotsForDay.findIndex(
                      (s) => s.id === active.id
                    );
                    const newIndex = slotsForDay.findIndex(
                      (s) => s.id === over.id
                    );

                    const reordered = arrayMove(
                      slotsForDay,
                      oldIndex,
                      newIndex
                    );

                    const updatedGlobal = [...timeSlots];
                    reordered.forEach((slot, i) => {
                      updatedGlobal[slotsForDay[i].index] = reordered[i];
                    });

                    setTimeSlots(updatedGlobal);
                  }}
                >
                  <SortableContext
                    items={timeSlots
                      .filter((slot) => slot.day === day)
                      .map((slot) => slot.id?.toString() ?? uuidv4())}
                    strategy={verticalListSortingStrategy}
                  >
                    {timeSlots
                      .map((slot, index) => ({ ...slot, globalIndex: index }))
                      .filter((slot) => slot.day === day)
                      .map((slot) => (
                        <SortableSlot
                          key={slot.id}
                          id={slot.id?.toString() ?? ""}
                        >
                          {({ listeners }) => (
                            <div className="flex items-center mb-2 bg-white p-2 rounded-md shadow w-full">
                              <div
                                className="flex items-center mr-2 cursor-move text-gray-400"
                                {...listeners}
                                title="Geser Untuk Ubah Urutan Jadwal"
                              >
                                <GripVertical />
                              </div>
                              <div className="flex gap-2 flex-grow">
                                <input
                                  type="time"
                                  className="border px-2 py-1 rounded text-gray-800 w-28"
                                  value={slot.startTime}
                                  onChange={(e) =>
                                    handleTimeSlotChange(
                                      slot.globalIndex,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                />
                                <span className="flex items-center text-black">
                                  -
                                </span>
                                <input
                                  type="time"
                                  className="border px-2 py-1 rounded text-gray-800 w-28"
                                  value={slot.endTime}
                                  onChange={(e) =>
                                    handleTimeSlotChange(
                                      slot.globalIndex,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="text"
                                  className="border px-2 py-1 rounded w-32 text-gray-800"
                                  value={formatCurrency(slot.price)}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    handleTimeSlotChange(
                                      slot.globalIndex,
                                      "price",
                                      parseInt(rawValue) || 0
                                    );
                                  }}
                                  placeholder="Harga"
                                />
                              </div>

                              <div className="flex-1"></div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveSlot(slot.globalIndex)
                                }
                                className="mx-2 text-red-500 hover:text-red-700 whitespace-nowrap"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </SortableSlot>
                      ))}
                  </SortableContext>
                </DndContext>

                {/* Tombol tambah slot */}
                <button
                  type="button"
                  onClick={() => handleAddSlot(day)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  + Tambah Slot Waktu
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableSlot({
  id,
  children,
}: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (props: { listeners: any; attributes: any }) => React.ReactNode;
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ listeners, attributes })}
    </div>
  );
}
