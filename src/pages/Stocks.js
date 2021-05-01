import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useHistory } from "react-router-dom";

import { useState, useEffect } from "react";

import "./Stocks.css";

export default function Stocks() {
  const [companyData, setCompanyData] = useState([]);
  //Permanently storing the whole fetched data for search function
  const [fullCompanyData, setFullCompanyData] = useState([]);

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  //for Dropdown component
  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  //definition of columns
  const columns = [
    { headerName: "Symbol", field: "symbol", resizable: true, flex: 1 },
    { headerName: "Name", field: "name", resizable: true, flex: 2 },
    { headerName: "Industry", field: "industry", resizable: true, flex: 1 },
  ];

  //using history for routing
  const history = useHistory();

  //function to filter companies by the industry
  const filterCompanyDataByIndustry = (e) => {
    //if the passed industry is null, display the whole data
    const filteredCompany =
      e === null
        ? fullCompanyData
        : fullCompanyData.filter((com) => com.industry === e);
    setCompanyData(filteredCompany);
  };

  //function to get unique items in the array
  const onlyUnique = function (value, index, self) {
    return self.indexOf(value) === index;
  };

  //filtering unique industry in the dataset
  const industries = fullCompanyData.map((a) => a.industry).filter(onlyUnique);

  //function to filter company by specified symbol
  const filterCompanyDataBySymbol = (searchKeyWord) => {
    if (searchKeyWord.length === 0) {
      setCompanyData(fullCompanyData);
    } else {
      const filteredCompany = fullCompanyData.filter(function (com) {
        return com.symbol.includes(searchKeyWord.toUpperCase());
      });
      setCompanyData(filteredCompany);
    }
  };

  //when a cell in the table clicked, jumping to the selected company's history page
  const onCellClicked = (value) => {
    const symbol = value.data.symbol;
    const uri = `/history/${symbol}`;
    history.push(uri);
  };

  const companyOvervieURL =
    "https://financialmodelingprep.com/api/v3/nasdaq_constituent?apikey=a061788633309dc50960045d59051a3a";

  //asynchronously fetching data from the server using useEffect
  useEffect(() => {
    fetch(companyOvervieURL)
      .then((res) => res.json())
      .then((data) =>
        data.map((company) => {
          return {
            symbol: company.symbol,
            name: company.name,
            industry: company.sector,
          };
        })
      )
      .then(
        (companies) => {
          setIsLoaded(true);
          setCompanyData(companies);
          setFullCompanyData(companies);
          console.log("fetched data");
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
          <h1>Stocks</h1>
        </header>
        <main>
          <div className="container">
            <div className="clearfix">
              <input
                aria-labelledby="search-button"
                className="float-left symbolInput"
                name="searchBySymbol"
                placeholder="type symbol..."
                id="searchBySymbol"
                type="search"
                onChange={(e) => filterCompanyDataBySymbol(e.target.value)}
              />
              <ButtonDropdown
                className="float-right industryButton"
                isOpen={dropdownOpen}
                toggle={toggle}
              >
                <DropdownToggle
                  onClick={() => filterCompanyDataByIndustry(null)} //when click toggle button, refresh the table without hitting the server
                  caret
                >
                  Select Industry
                </DropdownToggle>
                <DropdownMenu>
                  {industries.map((industry) => (
                    <DropdownItem
                      onClick={() => filterCompanyDataByIndustry(industry)}
                      key={industry}
                    >
                      {industry}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </ButtonDropdown>
            </div>
            <div className="ag-theme-balham-dark companyTable">
              <AgGridReact
                columnDefs={columns}
                onCellClicked={onCellClicked}
                rowData={companyData}
                pagination={true}
              />
            </div>
            <div className="card">
              <h4>
                <u>How to use:</u>
              </h4>

              <ol>
                <li>
                  To see the history of stock for a company, click the company's
                  row in the table.
                </li>
                <li>
                  To filter companies by symbol, type the symbol on the top left
                  corner.
                </li>
                <li>
                  To filter companies by industry, select the industry from the
                  dropdown box on the top right corner.
                </li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
