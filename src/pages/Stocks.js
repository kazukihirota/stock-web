import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import PriceHistory from "./PriceHistory";

import { useState, useEffect } from "react";

import "./pages.css";

const ALPHA_API_KEY = process.env.REACT_APP_ALPHA_API_KEY;

export default function Stocks() {
  const [rowData, setRowData] = useState([]);
  //Permanently storing the whole fetched data for search function
  const [fullCompanyData, setFullCompanyData] = useState([]);

  //for Dropdown component
  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  //url to fetch the data to put in the table
  const url =
    "https://financialmodelingprep.com/api/v3/nasdaq_constituent?apikey=a061788633309dc50960045d59051a3a";

  //definition of columns
  const columns = [
    {
      headerName: "Symbol",
      field: "symbol",
      // cellRenderer: function (params) {
      //   let link_dummy = `<a href={'/history?symbol=${params.data.symbol}'} target="_blank">
      //   ${params.data.symbol}
      // </a>`;

      //   return link_dummy;
      // },
    },
    { headerName: "Name", field: "name" },
    { headerName: "Industry", field: "industry" },
  ];

  const filterCompanyDataByIndustry = (e) => {
    //if the passed industry is null, display the whole data
    const filteredCompany =
      e === null
        ? fullCompanyData
        : fullCompanyData.filter((com) => com.industry === e);
    setRowData(filteredCompany);
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
      setRowData(fullCompanyData);
    } else {
      const filteredCompany = fullCompanyData.filter(function (com) {
        return com.symbol.includes(searchKeyWord.toUpperCase());
      });
      setRowData(filteredCompany);
    }
  };

  const onCellClicked = (value) => {
    const symbol = value.data.symbol;
    const uri = `/history?symbol=${symbol}`;
    console.log(uri);
    return (
      <Router>
        <Link to={uri}></Link>
      </Router>
    );
  };

  useEffect(() => {
    fetch(url)
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
      .then((companies) => {
        setRowData(companies);
        setFullCompanyData(companies);
        console.log("hit the server");
      });
  }, []);

  return (
    <div className="container">
      <div>
        <p>Select the stock to display</p>
        <input
          aria-labelledby="search-button"
          name="searchBySymbol"
          placeholder="type symbol..."
          id="searchBySymbol"
          type="search"
          onChange={(e) => filterCompanyDataBySymbol(e.target.value)}
        />
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
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
      <div
        className="ag-theme-balham"
        style={{ height: "300px", width: "80%" }}
      >
        <AgGridReact
          columnDefs={columns}
          onCellClicked={onCellClicked}
          rowData={rowData}
          pagination={true}
        />
      </div>
    </div>
  );
}
