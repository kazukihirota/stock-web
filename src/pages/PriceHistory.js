import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import { useState, useEffect } from "react";

import "./PriceHistory.css";

import { useParams, useHistory } from "react-router-dom";

import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { Line } from "react-chartjs-2";

const ALPHA_API_KEY = process.env.REACT_APP_ALPHA_API_KEY;

export default function PriceHistory() {
  //passing symbol using useParams()
  const params = useParams();
  const symbol = params.symbol;

  //Components for dropdown
  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  //"history" is to be modified when using filtering function, but "historyFull"
  const [stockHistory, setStockHistory] = useState([]);
  const [stockHistoryCopy, setStockHistoryCopy] = useState([]);

  //paramaters for error handling and loading
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  //columns definition for the stock history data table
  const columns = [
    { headerName: "Date", field: "date", resizable: true, flex: 1 },
    { headerName: "Open", field: "open", resizable: true, flex: 1 },
    { headerName: "High", field: "high", resizable: true, flex: 1 },
    { headerName: "Low ", field: "low", resizable: true, flex: 1 },
    { headerName: "Close", field: "close", resizable: true, flex: 1 },
    { headerName: "Volumes", field: "volumes", resizable: true, flex: 1 },
  ];

  //for dropdown button
  const dates = stockHistory.map((item) => item.date);

  //input array of history data and specified date, return the new array that contains data after the date
  const filterByDate = (arr, date) => {
    const output = [];
    const dateFrom = new Date(date);
    if (date === null) setStockHistory(stockHistoryCopy);
    else {
      for (let i = 0; i < arr.length; i++) {
        let stringToDate = new Date(arr[i].date);
        if (stringToDate >= dateFrom) {
          output.push(arr[i]);
        }
      }
      setStockHistory(output);
    }
  };

  //function for button to go back to Stock page
  const history = useHistory();
  const goBackToStocks = () => {
    const uri = "/stocks";
    history.push(uri);
  };

  const historyDataURL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_API_KEY}`;
  //fetching the data from
  useEffect(() => {
    fetch(historyDataURL)
      .then((res) => res.json())
      .then((data) => data["Time Series (Daily)"])
      .then((dailyData) =>
        Object.entries(dailyData).map((e) => ({ [e[0]]: e[1] }))
      )
      .then((dailyDataArray) =>
        dailyDataArray.map((data) => {
          return {
            date: Object.keys(data).toString(),
            open: Object.values(data)[0]["1. open"],
            high: Object.values(data)[0]["2. high"],
            low: Object.values(data)[0]["3. low"],
            close: Object.values(data)[0]["4. close"],
            volumes: Object.values(data)[0]["5. volume"],
          };
        })
      )
      .then(
        (history) => {
          setIsLoaded(true);
          setStockHistory(history);
          setStockHistoryCopy(history);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }, []);
  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <header>
          <h1>Price History</h1>
        </header>
        <main>
          <div className="container">
            <h2>Showing history of stocks for {symbol}</h2>
            <div className="flex-container">
              <div className="date-from-button">
                <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                  <DropdownToggle
                    onClick={() => filterByDate(stockHistory, null)} //when click toggle button, refresh the table without hitting the server
                    caret
                  >
                    Select the date from
                  </DropdownToggle>
                  <DropdownMenu
                    //setting for scrollable dropdown list
                    modifiers={{
                      setMaxHeight: {
                        enabled: true,
                        order: 890,
                        fn: (data) => {
                          return {
                            ...data,
                            styles: {
                              ...data.styles,
                              overflow: "auto",
                              maxHeight: 200,
                            },
                          };
                        },
                      },
                    }}
                  >
                    {dates.map((date) => (
                      <DropdownItem
                        onClick={() => filterByDate(stockHistory, date)}
                        key={date}
                      >
                        {date}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </ButtonDropdown>
              </div>
              <Button
                className="return-to-stock-btn"
                color="danger"
                onClick={() => goBackToStocks()}
              >
                Return to Stock page
              </Button>
            </div>

            <div className="ag-theme-balham-dark historyTable">
              <AgGridReact
                columnDefs={columns}
                rowData={stockHistory}
                pagination={true}
              />
            </div>
            <DrawChart history={stockHistory} />
          </div>
        </main>
      </div>
    );
  }
}

//Component for the Chart
function DrawChart({ history }) {
  const dates = history.map((item) => item.date).reverse();
  const closingPrices = history.map((item) => item.close).reverse();

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Closing price ($)",
        data: closingPrices,
        fill: false,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
  };

  return (
    <div className="chart">
      <Line data={data} options={options} height={200} />
    </div>
  );
}
