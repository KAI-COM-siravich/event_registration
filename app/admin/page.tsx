"use client";

import { useState } from "react";
import Registrations from "../../components/admin/Registrations";
import Statistics from "../../components/admin/Statistics";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<"registrations" | "stats">("registrations");

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="mb-6 flex w-fit rounded-md border border-gray-200 bg-gray-50 p-1 text-sm">
                <button
                    type="button"
                    aria-pressed={activeTab === "registrations"}
                    onClick={() => setActiveTab("registrations")}
                    className={`rounded px-4 py-2 font-medium transition ${
                        activeTab === "registrations"
                            ? "bg-white text-gray-950 shadow-sm"
                            : "text-gray-600 hover:text-gray-950"
                    }`}
                >
                    Registrations
                </button>
                <button
                    type="button"
                    aria-pressed={activeTab === "stats"}
                    onClick={() => setActiveTab("stats")}
                    className={`rounded px-4 py-2 font-medium transition ${
                        activeTab === "stats"
                            ? "bg-white text-gray-950 shadow-sm"
                            : "text-gray-600 hover:text-gray-950"
                    }`}
                >
                    Statistics
                </button>
            </div>

            {activeTab === "registrations" ? (
                <section>
                    <Registrations />
                </section>
            ) : (
                <section>
                    <Statistics />
                </section>
            )}
        </div>
    );
};

export default AdminDashboard;
