import { PieChart } from 'react-minimal-pie-chart';
import React, { useState } from 'react'
import './style/App.css'
import NavBar from './NavBar'
import {
  gql,
  useQuery,
  useMutation,
//   ApolloProvider,
  ApolloClient,
  ApolloProvider
} from "@apollo/client";
import { ButtonGroup, Button, ButtonToolbar, Card, Form, FormGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Client from './Client'


const FINANCIAL_RECORDS = gql`query FinancialRecords {
    financialRecords {
        id
        title
        type
        description
        amount
        date
        userRecordsId
        createdAt
    }
}`

const CREATE_RECORD = gql`mutation CreateFinancialRecord($data: FinancialRecordCreateInput!) {
    createFinancialRecord(data: $data) {
        id
    }
}`

const DELETE_RECORD = gql`mutation DeleteFinancialRecord($deleteFinancialRecordId: String!) {
    deleteFinancialRecord(id: $deleteFinancialRecordId) {
        id
    }
}`

const FinanceRecord = (props, ind) => {
    return (
        <Card key={ind} style={{ width: '70%', margin: '20px auto', padding: '10px 15px',
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", display:"flex", justifyContent: "space-between", flexDirection: "row"}}>
            <div className='financeDetails'>
                <div>
                    <b>Type: </b>
                    <span>{props.type}</span>
                </div>
                <br></br>
                <div>
                    <b>Amount: </b>
                    <span>{parseFloat(props.amount).toFixed(2)} ₽</span>
                </div>
                <br></br>
                <div>
                    <b>Date: </b>
                    <span>{new Date(props.date).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}</span>
                </div>
            </div>
            <img className='deleteFinance' src="/delete.svg" onClick={()=>{
                Client.mutate({
                    mutation: DELETE_RECORD,
                    variables: {
                        deleteFinancialRecordId: props.id
                    },
                    fetchPolicy: 'network-only',
                }).then(data=>{
                    // window.location.reload()
                }).then(e=>{
                    console.log(e)
                })
            }}></img>
        </Card>
    )
}

const Finance = () => {
    const [loans, setLoans] = useState(1);
    const [debts, setDebts] = useState(1);

    const [loansSum, setLoansSum] = useState(0);
    const [debtsSum, setDebtsSum] = useState(0);

    const [title, setTitle] = useState("");
    const [date, setDate] = useState(null);
    const [description, setDescription] = useState("");
    const [sum, setSum] = useState("");
    const [hiddenError, setHiddenError] = useState(1);
    const [errorMessage, setErrorMessage] = useState(0);
    const [addFinance, setAddFinance] = useState(0);

    const [financialRecords, setFinancialRecords] = useState(null)

    const [addLoan, setAddLoan] = useState(1);
    
    const data = [
        { title: 'loans', value: loansSum, color: '#5651ab' },
        { title: 'debts', value: debtsSum, color: '#6c64ff' }
    ];

    const defaultLabelStyle = {
        fontSize: '5px',
        fontFamily: 'sans-serif',
        fill: 'white',
        textShadow: "#000 1px 5px 3px"
    };
    
    const [createRecord] = useMutation(CREATE_RECORD, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        },
        fetchPolicy: 'network-only',
    })

    const { loading, error, finRecData, refetch } = useQuery(FINANCIAL_RECORDS, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        },
        fetchPolicy: 'network-only',
        onCompleted: data => {
            let recordsCopy = [...data.financialRecords]
            recordsCopy.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0))
            let loansToSum = 0;
            let debtsToSum = 0;
            recordsCopy.map(r => {
                if (r.type === "LOAN") {
                    loansToSum += parseFloat(r.amount)
                }
                if (r.type === "DEBT") {
                    debtsToSum += parseFloat(r.amount)
                }
            })
            setFinancialRecords(recordsCopy)
            setLoansSum(loansToSum)
            setDebtsSum(debtsToSum)
        },
    })
    
    return(
        <div>
            <div className='addFinance' style={{display: addFinance ? "block" : "none"}}>
            <Card style={{ width: '40vw', margin: '150px auto', padding: '20px 40px', boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)" }}>
                <h4 style={{margin: '0 auto 20px'}}>{addLoan ? "Add loan" : "Add debt"}</h4>
                <Form onSubmit={e => {
                    e.preventDefault();

                    createRecord({
                        variables: { data: {
                            "amount": parseFloat(sum),
                            "title": title,
                            "description": description,
                            "type": addLoan ? "LOAN" : "DEBT",
                            "date": new Date(date)
                        }
                    }}).then(data => {
                        setTitle("")
                        setDescription("")
                        setSum("")
                        setDate(null)
                        setAddFinance(0)
                        refetch()
                    }).catch(e => {
                        console.log(e)
                        if (e.networkError) {
                            setHiddenError(0)
                            setErrorMessage(e.networkError.result.errors[0].message)
                        }
                        else if (e.graphQLErrors[0]) {
                            console.log(e.graphQLErrors[0])
                            setHiddenError(0)
                            setErrorMessage(e.graphQLErrors[0].message)
                        }
                    })
                }}>
                    
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                    <div>
                        <b style={{paddingRight: '10px'}}>Date:</b>
                        <DatePicker selected={date} onChange={(date) => setDate(date)} />
                    </div>
                    <DropdownButton size='sm' id="dropdown-basic-button" title={addLoan ? "Loan" : "Debt"}>
                        <Dropdown.Item onClick={()=>{
                            setAddLoan(1)
                        }}>Loan</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{
                            setAddLoan(0)
                        }}>Debt</Dropdown.Item>
                    </DropdownButton>
                </div>
                    <FormGroup className="mb-3" controlId="formBasicUsername">
                        <Form.Control type="text" value={title} placeholder={addLoan ? "Loan title" : "Debt title"} minLength={1} onChange={e => setTitle(e.target.value)} />
                    </FormGroup>

                    <FormGroup className="mb-3" controlId="formBasicUsername">
                        <Form.Control type="text" value={sum} placeholder="Amount" minLength={1} onChange={e => setSum(e.target.value)} />
                    </FormGroup>

                    <FormGroup className="mb-3" controlId="formBasicUsername">
                        <Form.Control type="text" value={description} placeholder="Description" minLength={1} onChange={e => setDescription(e.target.value)} />
                    </FormGroup>

                    <Form.Label className="text-danger" visuallyHidden={hiddenError} style={{fontWeight: 'bold', width: '100%'}}>
                        {errorMessage}
                        ERROR
                    </Form.Label>

                    <div style={{marginTop: '30px'}}>
                        {/* <div style={{display: "inline-block"}}> */}
                            <Button size='sm' variant="primary" type="submit">
                                Submit
                            </Button>
                            <Button size='sm' variant="secondary" style={{margin: '0 10px'}} onClick={()=>{
                                setAddFinance(0)
                            }}>
                                Back
                            </Button>
                        {/* </div> */}
                    </div>
                </Form>
                </Card>
            </div>
            <div className='whiteLine'></div>
            <Card style={{ width: '700px', margin: '50px auto', minHeight: '400px', textAlign: 'center' }}>
                <div className='whiteLineInCard'></div>
                <NavBar />
                <div className='financeMenu'>
                    <Link to="/">
                        <img id='back' src="/back.svg"></img>
                    </Link>
                    <img src="/add.svg" onClick={()=>{
                        setAddFinance(1)
                    }}></img>
                </div>
                <Card.Body>
                <PieChart
                    style={{
                        fontSize: '8px'
                    }}
                    viewBoxSize={[150,60]}
                    center={[75, 30]}
                    data={data.filter(w => (loans && w.title == 'loans') || (debts && w.title == 'debts') ? true : false)}
                    radius={25}
                    lineWidth={60}
                    segmentsStyle={{ animationDuration: '1000', cursor: 'pointer', fontSize: "10px" }}
                    // segmentsShift={(index) => (index === selected ? 3 : 1)}
                    animate
                    label={({ dataEntry }) =>
                        dataEntry.title === 'loans' ? (loansSum ==0 ? ""  : loansSum + " ₽") : (debtsSum ==0 ? ""  : debtsSum + " ₽")
                    }
                    labelPosition={100 - 60 / 2}
                    labelStyle={{
                        ...defaultLabelStyle,
                    }}
                />
                <ButtonToolbar aria-label="Toolbar with button groups " style={{display: 'inline-block'}}>
                    <ButtonGroup className="me-2 hover-overlay shadow-1-strong rounded" aria-label="First group">

                        <Button style={{backgroundColor: loans ? "#5651ab" : "gray"}}
                            onClick={()=>{
                                loans ? (debts ? setLoans(0) : setLoans(1)) : setLoans(1)
                            }}>
                            Loan
                        </Button>

                    </ButtonGroup>
                    <ButtonGroup className="me-2 hover-overlay shadow-1-strong rounded" aria-label="Second group">

                        <Button style={{backgroundColor: debts ? "#6c64ff" : "gray"}}
                            onClick={()=>{
                                debts ? (loans ? setDebts(0) : setDebts(1)) : setDebts(1)
                            }}>
                            Debts
                        </Button>

                    </ButtonGroup>
                </ButtonToolbar>
                {financialRecords ? (
                    financialRecords.map((r, ind) => {
                        if((r.type === "LOAN" && loans) || (r.type === "DEBT" && debts)) {
                            return FinanceRecord(r, ind)
                        }
                    }
                  )
                ) : (
                    <></>
                )}
                </Card.Body>
            </Card>
        </div>
    )
}

export default Finance