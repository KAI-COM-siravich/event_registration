"use client";

import { useEffect, useState } from "react";

type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CHECKEDIN" | "CANCELLED";

type Registration = {
    id: string;
    customerId?: string;
    eventId?: string;
    status: RegistrationStatus | string;
    createdAt?: string;
    customer?: {
        userId?: string;
        user?: {
            firstName?: string;
            lastName?: string;
            email?: string;
        };
    };
    event?: {
        name?: string;
    };
};

const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    CHECKEDIN: "bg-blue-100 text-blue-800 ring-blue-200",
    REJECTED: "bg-red-100 text-red-800 ring-red-200",
    CANCELLED: "bg-gray-100 text-gray-700 ring-gray-200",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                statusStyles[status] ?? "bg-gray-100 text-gray-700 ring-gray-200"
            }`}
        >
            {status}
        </span>
    );
}

function getCustomerName(registration: Registration) {
    const user = registration.customer?.user;
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    return name || registration.customerId || "Unknown";
}

const Registrations = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRegistrations() {
            try {
                const response = await fetch("/api/registrations");
                if (!response.ok) {
                    throw new Error("Unable to load registrations");
                }

                const data: unknown = await response.json();
                setRegistrations(Array.isArray(data) ? data as Registration[] : []);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : "Unable to load registrations");
            }
        }

        fetchRegistrations();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Registrations</h2>

            {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : (
                <div className="overflow-x-auto rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {registrations.length > 0 ? (
                                registrations.map((registration) => (
                                    <tr key={registration.id}>
                                        <td className="px-4 py-3 font-medium text-gray-950">
                                            {getCustomerName(registration)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {registration.customer?.user?.email ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {registration.event?.name ?? registration.eventId ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={registration.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                                        No registrations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Registrations;
