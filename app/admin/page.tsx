import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shadcn/ui/tabs";
import Registrations from "../../components/admin/Registrations";
import Statistics from "../../components/admin/Statistics";

const AdminDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <Tabs defaultValue="registrations">
                <TabsList>
                    <TabsTrigger value="registrations">Registrations</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="registrations">
                    <Registrations />
                </TabsContent>

                <TabsContent value="stats">
                    <Statistics />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;