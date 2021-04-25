import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

const ALPHA_API_KEY = process.env.REACT_APP_ALPHA_API_KEY;

export default function PriceHistory() {
  const params = useParams();
  const symbol = params.symbol;

  const columns = [
    { headerName: "Date", field: "date" },
    { headerName: "Open", field: "open" },
    { headerName: "High", field: "high" },
    { headerName: "Low ", field: "low" },
    { headerName: "Close", field: "close" },
    { headerName: "Volumes", field: "volumes" },
  ];

  const { loading, history, error } = useHistoryData(symbol);

  if (loading) {
    return <p>Loading....</p>;
  }
  if (error) {
    return <p>Something went wrong: {error.message}</p>;
  }
  return (
    <div>
      <h1>Price History</h1>
      <p>Showing stocks for the {symbol}</p>
      <div
        className="ag-theme-balham"
        style={{ height: "300px", width: "80%" }}
      >
        <AgGridReact columnDefs={columns} rowData={history} pagination={true} />
      </div>
    </div>
  );
}

function useHistoryData(symbol) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setHistory(await getHistoryData(symbol));
        setLoading(false);
      } catch (err) {
        setError(error);
        setLoading(false);
      }
    })();
  }, []);
  return {
    loading,
    history,
    error,
  };
}

async function getHistoryData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_API_KEY}`;

  let res = await fetch(url);
  let data = await res.json();
  let dailyData = data["Time Series (Daily)"]; //the result is object
  let dailyDataArray = Object.entries(dailyData).map((e) => ({ [e[0]]: e[1] }));
  // console.log(dailyDataArray); //Array of data
  // console.log(dailyDataArray[0]); //single data
  // console.log(Object.values(dailyDataArray[0])[0]["1. open"]);

  // console.log(Object.keys(dailyDataArray[0]).toString());
  return dailyDataArray.map((data) => ({
    date: Object.keys(data).toString(),
    open: Object.values(data)[0]["1. open"],
    high: Object.values(data)[0]["2. high"],
    low: Object.values(data)[0]["3. low"],
    close: Object.values(data)[0]["4. close"],
    volumes: Object.values(data)[0]["5. volume"],
  }));
}

function drawChart() {
  const ctx = document.getElementById();

  return (
    <div>
      <canvas id="stockChart" width="400" height="300"></canvas>{" "}
    </div>
  );
}
