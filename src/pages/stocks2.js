import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useState, useEffect } from "react";

import "./pages.css";
import { GridApi, GridOptionsWrapper } from "ag-grid-community";
import { AgGridColumn } from "ag-grid-react/lib/agGridColumn";

const ALPHA_API_KEY = process.env.REACT_APP_ALPHA_API_KEY;
const FMP_API_KEY = process.env.REACT_APP_FMP_API_KEY;

export default function Stocks() {
  const columns = [
    {
      headerName: "Symbol",
      field: "symbol",
      sortable: true,
      filter: true,
    },
    { headerName: "Name", field: "name" },
    { headerName: "Industry", field: "industry" },
  ];
  const [rowData, setRowData] = useState([]);

  // fetching data from API and make the table of the companies
  let { loading, company, error } = useCompanyInfo();

  if (loading) {
    return <p>Loading....</p>;
  }
  if (error) {
    return <p>Something went wrong</p>;
  }
  const filterCompanyData = () => {
    const searchWord = document
      .getElementById("searchBySymbol")
      .value.toString()
      .toUpperCase();
    console.log(searchWord);
    company = company.filter(function (com) {
      return com.symbol.includes(searchWord);
    });
    console.log(company);
  };

  return (
    <div className="container">
      <div>
        <p>Select the stock to display</p>
        <input
          aria-labelledby="search-button"
          name="searchBySymbol"
          id="searchBySymbol"
          type="search"
        ></input>
        <button
          id="searchBySymbol-button"
          type="button"
          onClick={filterCompanyData}
        >
          Search
        </button>
      </div>
      <div
        className="ag-theme-balham"
        style={{ height: "300px", width: "80%" }}
      >
        <AgGridReact columnDefs={columns} rowData={rowData} pagination={true}>
          <AgGridColumn field="company" />
        </AgGridReact>
      </div>
    </div>
  );
}

function useCompanyInfo() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setCompany(await getCompanyInfo());
        setLoading(false);
      } catch (err) {
        setError(error);
        setLoading(false);
      }
    })();
  }, []);

  return {
    loading,
    company,
    error,
  };
}
//get list of the companies to display

//getting the stock info of company specified by the sybol
async function getCompanyInfo() {
  //using this API because Alpha vantage does not have any endpoints that can obtain symbol, name, and industry at once
  const url =
    "https://financialmodelingprep.com/api/v3/nasdaq_constituent?apikey=a061788633309dc50960045d59051a3a";

  let res = await fetch(url);
  let data = await res.json();
  const output = data.map((company) => ({
    symbol: company.symbol,
    name: company.name,
    industry: company.sector,
  }));

  return output;
}

function SearchByIndustry(props) {
  const [dropdownOpen, setOpen] = useState(false);

  const toggle = () => setOpen(!dropdownOpen);
  return (
    <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle caret>Industry</DropdownToggle>
      <DropdownMenu>
        <DropdownItem>Header</DropdownItem>
        <DropdownItem>Action</DropdownItem>
        <DropdownItem>Another Action</DropdownItem>
        <DropdownItem>Another Action</DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>
  );
}
