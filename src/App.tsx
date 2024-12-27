import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChartData } from "chart.js/auto";

// Register required Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

// Define the structure of a company data object
interface CompanyData {
    index_name: string;
    index_date: string;
    open_index_value: number;
    high_index_value: number;
    low_index_value: number;
    closing_index_value: number;
    points_change: number;
    change_percent: number;
    volume: number;
    turnover_rs_cr: number;
    pe_ratio: number;
    pb_ratio: number;
    div_yield: number;
}

const App: React.FC = () => {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [companyData, setCompanyData] = useState<ChartData<"line"> | null>(
        null
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/dump.csv");
                const csvData = await response.text();

                Papa.parse(csvData, {
                    complete: (result) => {
                        const parsedData = result.data.map((row) => ({
                            index_name: row["index_name"],
                            index_date: row["index_date"],
                            open_index_value: parseFloat(
                                row["open_index_value"]
                            ),
                            high_index_value: parseFloat(
                                row["high_index_value"]
                            ),
                            low_index_value: parseFloat(row["low_index_value"]),
                            closing_index_value: parseFloat(
                                row["closing_index_value"]
                            ),
                            points_change: parseFloat(row["points_change"]),
                            change_percent: parseFloat(row["change_percent"]),
                            volume: parseFloat(row["volume"]),
                            turnover_rs_cr: parseFloat(row["turnover_rs_cr"]),
                            pe_ratio: parseFloat(row["pe_ratio"]),
                            pb_ratio: parseFloat(row["pb_ratio"]),
                            div_yield: parseFloat(row["div_yield"]),
                        }));
                        setCompanies(parsedData);
                    },
                    header: true,
                });
            } catch (error) {
                console.error("Error fetching or parsing CSV:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedCompany) return;

        const company = companies.find(
            (company) => company.index_name === selectedCompany
        );

        if (company) {
            const chartData: ChartData<"line"> = {
                labels: [company.index_date],
                datasets: [
                    {
                        label: "Closing Index Value",
                        data: [company.closing_index_value],
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.1)",
                        fill: true,
                    },
                    {
                        label: "Volume",
                        data: [company.volume],
                        borderColor: "green",
                        backgroundColor: "rgba(0, 255, 0, 0.1)",
                        fill: true,
                    },
                    {
                        label: "PE Ratio",
                        data: [company.pe_ratio],
                        borderColor: "red",
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        fill: true,
                    },
                ],
            };
            setCompanyData(chartData);
        }
    }, [selectedCompany, companies]);

    return (
        <div style={{ display: "flex" }}>
            <div
                style={{
                    width: "250px",
                    borderRight: "1px solid #ddd",
                    height: "100vh",
                    overflowY: "scroll",
                }}
                className="company-container"
            >
                <div>
                    {companies.map((company) => (
                        <div key={company.index_name}>
                            <button
                                onClick={() =>
                                    setSelectedCompany(company.index_name)
                                }
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "16px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                                className="company-btn"
                            >
                                {company.index_name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <h3>
                    <span>Company Data:</span>{" "}
                    {companyData ? <span>{selectedCompany}</span> : null}
                </h3>
                {companyData ? (
                    <div style={{ flex: 1 }}>
                        <Line
                            data={companyData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    tooltip: {
                                        enabled: true, // Show tooltip on hover
                                    },
                                },
                                elements: {
                                    point: {
                                        radius: 5, // Make data points visible with a specific size
                                    },
                                },
                            }}
                        />
                    </div>
                ) : (
                    <p>Select a company to view its chart.</p>
                )}
            </div>
        </div>
    );
};

export default App;
