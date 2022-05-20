import React, {useState} from 'react'
import './style/App.css'
import NavBar from './NavBar'
import {
  gql,
  useQuery
} from "@apollo/client";
import { Form, Button, FormGroup, Card } from 'react-bootstrap';

const User = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    const USER_RECORDS = gql`query UserRecords {
        user {
            email
            username
            firstName
            lastName
            createdAt
        }
    }`;

    useQuery(USER_RECORDS, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        },
        fetchPolicy: 'network-only',
        onCompleted: data => {
            setUsername(data.user.username)
            setEmail(data.user.email)
            setFirstName(data.user.firstName)
            setLastName(data.user.lastName)
            setCreatedAt(new Date(data.user.createdAt).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}))
        },
    })
    
    return(
        <Card style={{ width: '700px', margin: '50px auto', minHeight: '400px' }}>
            <div className='whiteLineInCard'></div>
            <NavBar />
            <Card.Body>
                <Card.Title>Username</Card.Title>
                <Card.Text>{username}</Card.Text>
                <Card.Title>Email</Card.Title>
                <Card.Text>{email}</Card.Text>
                <Card.Title>First name</Card.Title>
                <Card.Text>{firstName}</Card.Text>
                <Card.Title>Second name</Card.Title>
                <Card.Text>{lastName}</Card.Text>
                <Card.Title>Account created at</Card.Title>
                <Card.Text>{createdAt}</Card.Text>

                <Button variant="secondary" onClick={() => {
                    localStorage.clear();
                    window.location.replace("/")
                }}>
                    Log out
                </Button>
            </Card.Body>
        </Card>
    )
}

export default User