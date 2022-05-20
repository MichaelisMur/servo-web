import React, { useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {
  gql,
  useQuery
} from "@apollo/client";
import { Bar } from 'react-chartjs-2';
import { Button, Card, Form, FormGroup } from 'react-bootstrap';
import NavBar from './NavBar'
import { Link } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
  responsive: true,
  plugins: {
        legend: {
            position: 'top',
        }
  }
}


const STEPS_RECORDS = gql`query StepsActivityRecords {
    stepsActivityRecords {
        stepsCount
        date
        id
        createdAt
    }
}`

const Steps = () => {

    const [stepsRecords, setStepsRecords] = useState(null)
    const [dates, setDates] = useState([])
    const [labels, setLabels] = useState([])
    const [dataSteps, setDataSteps] = useState([])

    const data = {
        labels,
        datasets: [{
            label: 'My steps data',
            backgroundColor: '#6c64ff',
            borderColor: '#6c64ff',
            data: dataSteps,
        }]
    };

    const [chosenPeriod, setChosenPeriod] = useState(Date.now())

    const { loading, error, finRecData, refetch } = useQuery(STEPS_RECORDS, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        },
        fetchPolicy: 'network-only',
        onCompleted: data => {
            setStepsRecords(data.stepsActivityRecords)
            console.log(data.stepsActivityRecords)

            let labelsDates = []
            for (let index = 0; index < 7; index++) {
                labelsDates.push(new Date(chosenPeriod - 86400000 * index))
            }
            labelsDates.reverse()

            let labelsShort = []
            labelsDates.forEach(d => {
                labelsShort.push(new Date(d).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric' }))
            })
            setDates(labelsDates)
            setLabels(labelsShort)

            let dataToShow = []
            labelsDates.forEach(ld => {
                let found = false
                data.stepsActivityRecords.forEach(d => {
                    if (!found && new Date(ld).toDateString() == new Date(d.date).toDateString()){
                        dataToShow.push(d.stepsCount)
                        found = true;
                    }
                })
                if (!found) {
                    dataToShow.push(0)
                }
            })
            setDataSteps(dataToShow)
        }
    })
    return(
        <div className='stepsBlock'>
            <div className='whiteLine'></div>
            <Card style={{ width: '700px', margin: '50px auto', minHeight: '400px', textAlign: 'center' }}>
                <div className='whiteLineInCard'></div>
                <NavBar />
                <div className='financeMenu'>
                    <Link to="/">
                        <img id='back' src="/back.svg"></img>
                    </Link>
                    {/* <img style={{display: chosenId ? 'none': 'block'}} src="/add.svg" onClick={()=>{
                        setAddNote(1)
                        setEmotion('HAPPY')
                    }}></img> */}
                </div>
                <Card.Body>
                    {/* <div className='nastyLine'>

                    </div> */}
                    <Bar options={options} data={data} />
                    
                    <img className='arrow' src="/arrow_l.png"></img>
                    <h6 style={{marginTop: '20px', display: "inline-block"}}>
                        {(new Date(chosenPeriod - 86400000 * 6)).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric' })
                        } - {new Date(chosenPeriod).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric' })}
                    </h6>
                    <img className='arrow' src="/arrow_r.png"></img>
                </Card.Body>
            </Card>
        </div>
    )
}

export default Steps