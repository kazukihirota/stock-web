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

  const [searchKeyword, setSearchKeyword] = useState("");

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
  const filterCompanyDataByIndustry = (selectedIndustry) => {
    //if the passed industry is null, display the whole data
    let filteredCompany;
    if (selectedIndustry === "Select All") filteredCompany = fullCompanyData;
    else if (
      //when a user selects an industry from another industry and there is no input in search by symbol
      searchKeyword === "" &&
      companyData.filter((company) => company.industry === selectedIndustry)
        .length === 0
    )
      //filter companies using full company data
      filteredCompany = fullCompanyData.filter(
        (company) => company.industry === selectedIndustry
      );
    else if (
      //when a user selects an industry from another industry and the symbol is also specified
      searchKeyword !== "" &&
      companyData.filter((company) => company.industry === selectedIndustry)
        .length === 0
    ) {
      //filtering company with the specified keyword by a user
      const companiesWithTheKeyword = fullCompanyData.filter(function (com) {
        return com.symbol.includes(searchKeyword.toUpperCase());
      });
      filteredCompany = companiesWithTheKeyword.filter(
        (company) => company.industry === selectedIndustry
      );
    } else
      filteredCompany = companyData.filter(
        (company) => company.industry === selectedIndustry
      );

    setCompanyData(filteredCompany);
  };

  //function to get unique items in the array
  const onlyUnique = function (value, index, self) {
    return self.indexOf(value) === index;
  };

  //filtering unique industry in the dataset
  //adding "Select All" so that user can
  const industries = [
    ...fullCompanyData.map((a) => a.industry).filter(onlyUnique),
    "Select All",
  ];

  //function to filter company by specified symbol
  const filterCompanyDataBySymbol = (input) => {
    setSearchKeyword(input);
    if (input.length === 0) {
      setCompanyData(fullCompanyData);
    } else {
      const filteredCompany = fullCompanyData.filter(function (com) {
        return com.symbol.includes(input.toUpperCase());
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
                <DropdownToggle caret>Select Industry</DropdownToggle>
                <DropdownMenu>
                  {industries.map((industry) => (
                    <DropdownItem
                      onClick={() => filterCompanyDataByIndustry(industry)}
                      key={industry}
                      className={industry.replace(/\s+/g, "")}
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
                  To see the historical data of stock for a company, click the
                  company's row in the table.
                </li>
                <li>
                  To filter companies by symbol, type the symbol into the input
                  field on the top left corner.
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
