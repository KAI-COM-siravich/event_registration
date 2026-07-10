"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import Registrations from "../../../components/admin/Registrations";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";

const RegistrationsPage = () => {
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <AppShell title="Registrations">
      <div className="space-y-4 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-[17px] sm:text-xl font-semibold tracking-tight text-foreground hidden sm:block leading-tight">
            รายชื่อผู้ลงทะเบียน
          </h2>
          <div className="w-full sm:w-auto shrink-0">
            <label htmlFor="event-filter" className="sr-only">
              กรองตามกิจกรรม
            </label>
            <Select
              value={selectedEventId}
              onValueChange={(val: string | null) => setSelectedEventId(val as string)}
              items={[
                { value: "", label: "ทุกกิจกรรม" },
                ...events.map(e => ({ value: e.id, label: e.name }))
              ]}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="ทุกกิจกรรม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทุกกิจกรรม</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="apple-card p-4 lg:p-6 overflow-hidden">
          <Registrations eventId={selectedEventId} />
        </div>
      </div>
    </AppShell>
  );
};

export default RegistrationsPage;
