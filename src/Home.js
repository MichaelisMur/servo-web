import React, {useState} from 'react'
import './style/App.css'
import {
  gql,
  useMutation
} from "@apollo/client";
import { Form, Button, FormGroup, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SIGN_UP_USER = gql`
  mutation SignupUser($data: UserCreateInput!) {
    signupUser(data: $data) {
      email
      username
      firstName
      lastName
      session {
        accessToken
        accessTokenExpiresIn
        refreshToken
        refreshTokenExpiresIn
      }
    }
  }
`;

const SIGN_IN_USER = gql`
  mutation SigninUser($data: UserSigninInput!) {
    signinUser(data: $data) {
      email
      username
      firstName
      lastName
      session {
        accessToken
        accessTokenExpiresIn
        refreshToken
        refreshTokenExpiresIn
      }
    }
  }
`;

const Home = () => {

  const [signUp, setSignUp] = useState(0);
  const [signIn, setSignIn] = useState(0);

  if (signUp) {
    return(
      <SignUp />
    )
  } else if(signIn) {
    return(
      <SignIn />
    )
  } else {
    return(
      <div>
          <Card style={{ width: '50vw', margin: '100px auto', padding: '40px' }}>
              <h2 style={{margin: '0 auto 20px'}}>Welcome to Servo!</h2>
        
              <div className="homePage">
                  <div className="divSignUp">
                    <Button className="homeSignUp" onClick={e => {
                      setSignIn(0)
                      setSignUp(1)
                    }}>
                        Sign up
                    </Button>
                  </div>
          
                  <div className="divSignIn" onClick={e => {
                      setSignIn(1)
                      setSignUp(0)
                  }}>Alreday have an account?</div>
              </div>
          </Card>
      </div>
    )
  }
}

const SignUp = () => {

  const [signupUser] = useMutation(SIGN_UP_USER)

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [hiddenError, setHiddenError] = useState(1);
  const [errorMessage, setErrorMessage] = useState(0);

  // const useAsyncError = () => {
  //   const [_, setError] = React.useState();
  //   return React.useCallback(
  //     e => {
  //       setError(() => {
  //         throw e;
  //       });
  //     },
  //     [setError],
  //   );
  // };
  // const throwError = useAsyncError();
  
  return (
    <Card style={{ width: '50vw', margin: '50px auto', padding: '20px 40px' }}>
      <h2 style={{margin: '0 auto 20px'}}>Sign Up</h2>
      <Form onSubmit={
        e => {
        e.preventDefault();

        if (!username) {
          setHiddenError(0)
          setErrorMessage("Username cannot be empty")
          return
        }

        signupUser({
          variables: { data: {
            "email": email,
            "username": username,
            "password": password,
            "firstName": firstName,
            "lastName": lastName
          } }
        }).then(data => {

          localStorage.setItem('email', data.data.signupUser.email);
          localStorage.setItem('username', data.data.signupUser.username);
          localStorage.setItem('firstName', data.data.signupUser.firstName);
          localStorage.setItem('lastName', data.data.signupUser.lastName);
          localStorage.setItem('accessToken', data.data.signupUser.session.accessToken);
          localStorage.setItem('accessTokenExpiresIn', data.data.signupUser.session.accessTokenExpiresIn);
          localStorage.setItem('refreshToken', data.data.signupUser.session.refreshToken);
          localStorage.setItem('refreshTokenExpiresIn', data.data.signupUser.session.refreshTokenExpiresIn);

          window.location.reload();
        })
        .catch(e => {
          if (e.networkError) {
            setHiddenError(0)
            setErrorMessage(e.networkError.result.errors[0].message)
          }
          else if (e.graphQLErrors[0]) {
            console.log(e.graphQLErrors[0])
            setHiddenError(0)
            setErrorMessage(e.graphQLErrors[0].message)
          }
        });
      }}>
        <FormGroup className="mb-3" controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" placeholder="Enter username" onChange={e => setUsername(e.target.value)} />
        </FormGroup>

        <FormGroup className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" onChange={e => setEmail(e.target.value)} />
        </FormGroup>

        <FormGroup className="mb-3" controlId="formBasicFirstName">
          <Form.Label>First name</Form.Label>
          <Form.Control type="text" placeholder="Enter your first name" onChange={e => setFirstName(e.target.value)} />
        </FormGroup>

        <FormGroup className="mb-3" controlId="formBasicLastName">
          <Form.Label>Last name</Form.Label>
          <Form.Control type="text" placeholder="Enter you last name" onChange={e => setLastName(e.target.value)} />
        </FormGroup>

        <FormGroup className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" minLength={6} placeholder="Enter password" onChange={e => setPassword(e.target.value)} />
        </FormGroup>

        
        <Form.Label className="text-danger" visuallyHidden={hiddenError} style={{fontWeight: 'bold', width: '100%'}}>
          {errorMessage}
        </Form.Label>

        <Button variant="primary" type="submit">
          Submit
        </Button>

        <Button variant="secondary" style={{margin: '0 10px'}} onClick={
          window.location.reload.bind(window.location)
        }>
          Back
        </Button>
      </Form>
    </Card>
  );
}

const SignIn = () => {

  const [signinUser] = useMutation(SIGN_IN_USER)

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hiddenError, setHiddenError] = useState(1);
  const [errorMessage, setErrorMessage] = useState(0);
  
  return (
    <Card style={{ width: '50vw', margin: '100px auto', padding: '40px' }}>
      <h2 style={{margin: '0 auto 20px'}}>Sign In</h2>
      <Form onSubmit={ e => {
        e.preventDefault();

        signinUser({
          variables: { data: {
            "username": username,
            "password": password
          } }
        }).then(data => {

          localStorage.setItem('email', data.data.signinUser.email);
          localStorage.setItem('username', data.data.signinUser.username);
          localStorage.setItem('firstName', data.data.signinUser.firstName);
          localStorage.setItem('lastName', data.data.signinUser.lastName);
          localStorage.setItem('accessToken', data.data.signinUser.session.accessToken);
          localStorage.setItem('accessTokenExpiresIn', data.data.signinUser.session.accessTokenExpiresIn);
          localStorage.setItem('refreshToken', data.data.signinUser.session.refreshToken);
          localStorage.setItem('refreshTokenExpiresIn', data.data.signinUser.session.refreshTokenExpiresIn);

          window.location.reload();
        })
        .catch(e => {
          if (e.networkError) {
            setHiddenError(0)
            setErrorMessage(e.networkError.result.errors[0].message)
          }
          else if (e.graphQLErrors[0]) {
            console.log(e.graphQLErrors[0])
            setHiddenError(0)
            setErrorMessage(e.graphQLErrors[0].message)
          }
        });
      }}>

        <FormGroup className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control type="username" minLength={1} placeholder="Enter username" onChange={e => setUsername(e.target.value)} />
        </FormGroup>

        <FormGroup className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" minLength={6} placeholder="Enter password" onChange={e => setPassword(e.target.value)} />
        </FormGroup>

        
        <Form.Label className="text-danger" visuallyHidden={hiddenError} style={{fontWeight: 'bold', width: '100%'}}>
          {errorMessage}
        </Form.Label>

        <Button variant="primary" type="submit">
          Submit
        </Button>

        <Button variant="secondary" style={{margin: '0 10px'}} onClick={
          window.location.reload.bind(window.location)
        }>
          Back
        </Button>
      </Form>
    </Card>
  );
}

export default Home;