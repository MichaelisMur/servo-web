import React, {useState} from 'react'
import './style/App.css'
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return(
        <Navbar bg="dark" variant="dark">
            <Container fluid>
                <Navbar.Brand>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <b>Servo</b>
                    </Link>
                </Navbar.Brand>
                <Navbar.Collapse>
                    <Nav className="me-auto">
                    </Nav>
                    <Nav placement="end">
                        <Link to="/account" style={{ textDecoration: 'none', color: 'white' }}>
                            Account
                        </Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavBar