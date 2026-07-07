import React, { useState, useEffect } from "react";
import { DataTable } from "@shadcn/ui/data-table";
import { Badge } from "@shadcn/ui/badge";

const Registrations = () => {
    const [registrations, setRegistrations] = useState([]);

    useEffect(() => {
        // Fetch the registrations from an API or database
        async function fetchRegistrations() {
            const response = await fetch("/api/registrations");
            const data = await response.json();
            setRegistrations(data);
        }

        fetchRegistrations();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Registrations</h2>
            <DataTable
                columns={[
                    { label: "Name", accessor: "name" },
                    { label: "Email", accessor: "email" },
                    { label: "Status", accessor: "status", 
                      render: (row) => (
                        <Badge color={row.status === "Pending" ? "yellow" : row.status === "Approved" ? "green" : "red"}>
                          {row.status}
                        </Badge>
                      )},
                ]}
                data={registrations}
            />
        </div>
    );
};

export default Registrations;