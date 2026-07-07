import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const Statistics = () => {
    const [checkInStats, setCheckInStats] = useState([]);
    const [boothStats, setBoothStats] = useState([]);
    const [rewardStats, setRewardStats] = useState([]);

    useEffect(() => {
        // Fetch the stats data from an API or DB
        async function fetchStats() {
            const [checkInData, boothData, rewardData] = await Promise.all([
                fetch("/api/stats/check-ins").then((res) => res.json()),
                fetch("/api/stats/booths").then((res) => res.json()),
                fetch("/api/stats/rewards").then((res) => res.json()),
            ]);

            setCheckInStats(checkInData);
            setBoothStats(boothData);
            setRewardStats(rewardData);
        }

        fetchStats();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>

            <div className="mb-8">
                <h3>Check-In Statistics</h3>
                <BarChart width={600} height={300} data={checkInStats}>
                    <XAxis dataKey="event" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="checkIns" fill="#8884d8" />
                </BarChart>
            </div>

            <div className="mb-8">
                <h3>Booth Statistics</h3>
                <BarChart width={600} height={300} data={boothStats}>
                    <XAxis dataKey="booth" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#82ca9d" />
                </BarChart>
            </div>

            <div>
                <h3>Reward Statistics</h3>
                <BarChart width={600} height={300} data={rewardStats}>
                    <XAxis dataKey="reward" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
            </div>
        </div>
    );
};

export default Statistics;