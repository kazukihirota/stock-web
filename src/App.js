import "./App.css";
import { useState } from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";

import { Navbar, Nav, NavItem, Collapse, NavbarToggler } from "reactstrap";

import Home from "./pages/Home";
import Stocks from "./pages/Stocks";
import PriceHistory from "./pages/PriceHistory";

const activeStyle = {
  fontWeight: "bold",
  color: "black",
};

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Router>
      <div className="App">
        <Navbar color="light" light expand="md">
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink
                  className="Nav-link"
                  exact
                  to="/"
                  activeStyle={activeStyle}
                >
                  Home
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  className="Nav-link"
                  to="/stocks"
                  activeStyle={activeStyle}
                >
                  Stocks
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/stocks">
            <Stocks />
          </Route>
          <Route path="/history/:symbol">
            <PriceHistory />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
