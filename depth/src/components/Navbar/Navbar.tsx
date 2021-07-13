import { FC } from 'react';
import './Navbar.css';
import { Navbar as BootstrapNavbar } from 'react-bootstrap';
import Switch from '../Switch/Switch'
import UserMenu from '../UserMenu/UserMenu';

interface NavbarProps {
  darkModeToggleHandler ?:Function;
  darkModeVariable ?:boolean;
}

const Navbar:FC<NavbarProps> = (props) => {
  return (
  <BootstrapNavbar bg="success" expand="md" className="Navbar navbar-dark" data-testid="Navbar">
    <div className="container-fluid">
      <BootstrapNavbar.Brand href="/">Skarbnik</BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

      <BootstrapNavbar.Collapse id="basic-navbar-nav">

        <div className="darkModeSwitch ms-auto me-4">
          <i className="fas fa-sun me-2 fs-5 icon" />
            <Switch 
              checked={props.darkModeVariable === true} 
              onToggle={props.darkModeToggleHandler ? props.darkModeToggleHandler : undefined}
              className="me-2" />
          <i className="fas fa-moon fs-5 icon" />
        </div>

        <UserMenu />
      </BootstrapNavbar.Collapse>
    </div>
    
  </BootstrapNavbar>
)};

export default Navbar;
