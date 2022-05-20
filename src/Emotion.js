import React, { useState } from 'react'
import './style/App.css'
import NavBar from './NavBar'
import {
  gql,
  useQuery,
  useMutation
} from "@apollo/client";
import { Button, Card, Form, FormGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import Client from './Client'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


const EMOTIONAL_STATE_RECORDS = gql`query EmotionalStateRecords {
    emotionalStateRecords {
      date
      description
      state
      id
      createdAt
    }
}`

const CREATE_EMOTIONAL_STATE_RECORD = gql`mutation CreateEmotionalStateRecord($data: EmotionalStateRecordCreateInput!) {
    createEmotionalStateRecord(data: $data) {
      id
    }
}`

const DELETE_RECORD = gql`mutation DeleteEmotionalStateRecord($deleteEmotionalStateRecordId: String!) {
    deleteEmotionalStateRecord(id: $deleteEmotionalStateRecordId) {
      id
    }
}`

const Emotion = () => {
    const [chosenDate, setChosenDate] = useState(new Date());
    const [chosenEmotion, setChosenEmotion] = useState("");
    const [chosenDescription, setChosenDescription] = useState("");
    const [chosenId, setChosenId] = useState("");
    const [addNote, setAddNote] = useState(0);
    const [description, setDescription] = useState("");
    const [emotion, setEmotion] = useState("");
    const [hiddenError, setHiddenError] = useState(1);
    const [errorMessage, setErrorMessage] = useState(0);

    const [stateRecords, setStateRecords] = useState(null)
    
    const [createEmotionalStateRecord] = useMutation(CREATE_EMOTIONAL_STATE_RECORD, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        }
    })

    const { loading, error, finRecData, refetch } = useQuery(EMOTIONAL_STATE_RECORDS, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        },
        fetchPolicy: 'network-only',
        onCompleted: data => {
            setStateRecords(data.emotionalStateRecords)
            console.log(data)
        },
    })
    return(
        <div className='emotion'>
            <div className='addFinance' style={{display: addNote ? "block" : "none"}}>
                <Card style={{ width: '40vw', margin: '150px auto', padding: '20px 40px', boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)" }}>
                    <Form onSubmit={e => {
                        e.preventDefault();

                        console.log(chosenDate)
                        createEmotionalStateRecord({
                            variables: { data: {
                                state: emotion,
                                date: chosenDate,
                                description: description
                              },
                              fetchPolicy: 'network-only',
                        }}).then(data => {
                            setAddNote(0)
                            refetch()
                            setChosenDescription(description)
                            setChosenEmotion(emotion)
                            setChosenId(data.data.createEmotionalStateRecord.id)
                            setDescription("")
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

                    <Form.Label style={{fontWeight: 'bold', width: '100%', textAlign: 'center'}}>
                        {chosenDate.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}
                    </Form.Label>

                    <div style={{textAlign: "center", margin: 'auto', marginBottom: '10px'}}>
                        <div style={{display: "inline-block", margin: 'auto'}}>
                            <img className={'chooseEmotion' + (emotion == 'HAPPY' ? ' emoChosen' : '')} src="/happy.png"
                                onClick={()=>{
                                    setEmotion("HAPPY")
                                }}></img>

                            <img className={'chooseEmotion' + (emotion == 'NORMAL' ? ' emoChosen' : '')} src="/normal.png"
                                onClick={()=>{
                                    setEmotion("NORMAL")
                                }}></img>

                            <img style={{height: "40px", width: "40px",  margin: '7px'}} 
                                className={'chooseEmotion' + (emotion == 'SAD' ? ' emoChosen' : '')} src="/sad.png"   
                                onClick={()=>{
                                    setEmotion("SAD")
                                }}></img>
                        </div>
                    </div>

                    <FormGroup className="mb-3" controlId="formBasicUsername">
                        <Form.Control type="text" value={description} placeholder="Description" minLength={1} onChange={e => setDescription(e.target.value)} />
                    </FormGroup>

                    <Form.Label className="text-danger" visuallyHidden={hiddenError} style={{fontWeight: 'bold', width: '100%'}}>
                        {errorMessage}
                        ERROR
                    </Form.Label>

                    <div style={{marginTop: '30px'}}>
                        <Button size='sm' variant="primary" type="submit">
                            Submit
                        </Button>
                        <Button size='sm' variant="secondary" style={{margin: '0 10px'}} onClick={()=>{
                            setAddNote(0)
                        }}>
                            Back
                        </Button>
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
                    <img style={{display: chosenId ? 'none': 'block'}} src="/add.svg" onClick={()=>{
                        setAddNote(1)
                        setEmotion('HAPPY')
                    }}></img>
                </div>
                <Card.Body>
                    <Calendar onChange={(a)=>{
                        setChosenDescription("")
                        setChosenEmotion("")
                        setChosenId("")
                        setChosenDate(a)
                        stateRecords.find(el => {
                            if(new Date(el.date).toString() === new Date(a).toString()) {
                                setChosenDescription(el.description)
                                console.log(el)
                                setChosenEmotion(el.state)
                                setChosenId(el.id)
                            }
                        })
                    }}  value={chosenDate}
                        tileClassName={({ date, view }) => {
                            let res = ""
                            if(stateRecords){
                                stateRecords.find(x => {
                                    if(new Date(x.date).toString() === new Date(date).toString()) {
                                        if(x.state == "HAPPY") {
                                            res =  'highlightHappy'
                                        }
                                        if(x.state == "NORMAL") {
                                            res =  'highlightNormal'
                                        }
                                        if(x.state == "SAD") {
                                            res =  'highlightSad'
                                        }
                                    }
                                })
                            }
                            return res
                            // stateRecords.find(x => {console.log(x.date)})
                        }}
                    />
                </Card.Body>
                <Card style={{ width: '70%', margin: '20px auto', padding: '10px 15px',
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", display:"flex", justifyContent: "space-between", flexDirection: "row"}}>
                    <div hidden={chosenEmotion} style={{margin: "auto"}}>
                        <h6 style={{color: "gray", margin: '0'}}>
                            No emotion added
                        </h6>
                    </div>
                    <div className='financeDetails' hidden={!chosenEmotion}>
                        

                        <div style={{display: 'block'}}>
                            <img className='recordEmotion' src={
                                chosenEmotion === 'HAPPY' ? "/happy.png" :
                                    (chosenEmotion === 'NORMAL') ? "/normal.png" : "/sad.png"}
                                style = {chosenEmotion === 'SAD' ? {width: '46px', height: '46px', margin: '0 0 4px'} : {}}
                            ></img>
                        </div>
                        <div>
                            <b>Date: </b>
                            <span>{chosenDate.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})}</span>
                        </div>
                        <br></br>
                        <div>
                            <b>Description: </b>
                            <span>{chosenDescription}</span>
                        </div>
                    </div>
                    <img hidden={!chosenEmotion} className='deleteFinance' src="/delete.svg" onClick={()=>{
                        Client.mutate({
                            mutation: DELETE_RECORD,
                            variables: {
                                deleteEmotionalStateRecordId: chosenId
                            },
                            context: {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                                }
                            }
                        }).then(data=>{
                            setChosenDescription("")
                            setChosenEmotion("")
                            setChosenId("")
                            refetch()
                        }).catch(e=>{
                            console.log(e)
                        })
                    }}></img>
                </Card>
                <div style={{height: '100px'}}></div>
            </Card>
        </div>
    )
}

export default Emotion