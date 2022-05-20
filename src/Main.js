import React, {useState, useEffect} from 'react'
import './style/App.css'
import {
  gql,
  useQuery
} from "@apollo/client";
import { Form, Button, FormGroup, Card } from 'react-bootstrap';
import NavBar from './NavBar'
import { Link } from 'react-router-dom';
import { PieChart } from 'react-minimal-pie-chart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
);

export const options = {
    legend: {
        display: false
    }
}

const Main = () => {

  const [loansSum, setLoansSum] = useState(0);
  const [debtsSum, setDebtsSum] = useState(0);
  const [happy, setHappy] = useState(0);
  const [normal, setNormal] = useState(0);
  const [sad, setSad] = useState(0);
  const [dataSteps, setDataSteps] = useState([])
  const [labels, setLabels] = useState([])
  const [stepsAverage, setStepsAverage] = useState([])
  const [rest, setRest] = useState(0)

    const USER_RECORDS = gql`query UserRecords {
        userRecords {
          financialRecords {
            type
            title
            description
            amount
            date
            userRecordsId
            createdAt
            id
          }
          emotionalRecords {
            state
            description
            date
            userRecordsId
            createdAt
            id
          }
        }
      }`;


    const STEPS_RECORDS = gql`query StepsActivityRecords {
        stepsActivityRecords {
            stepsCount
            date
            id
            createdAt
        }
    }`
    

    const { loading, error, finRecData, refetch } = useQuery(STEPS_RECORDS, {
      context: {
          headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
      },
      fetchPolicy: 'network-only',
      onCompleted: data => {
        let stepsCount = 0;
        data.stepsActivityRecords.forEach(a => {
            if (new Date(Date.now() - 86400000 * 7) < new Date(a.date)){
                stepsCount += a.stepsCount
            }
        })
        setStepsAverage(Math.round(stepsCount / 7))

              

        let labelsDates = []
        for (let index = 0; index < 7; index++) {
            labelsDates.push(new Date(Date.now() - 86400000 * index))
        }
        labelsDates.reverse()

        let labelsShort = []
        labelsDates.forEach(d => {
            labelsShort.push(new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric' }))
        })
        labels && setLabels(labelsShort)

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

    const dataChart = {
        labels,
        datasets: [{
            label: 'My steps data',
            backgroundColor: '#6c64ff',
            borderColor: '#6c64ff',
            data: dataSteps,
        }]
    };

    useQuery(USER_RECORDS, {
        context: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        },
        fetchPolicy: 'network-only',
        onCompleted: data => {
            let loansToSum = 0;
            let debtsToSum = 0;
            data.userRecords.financialRecords?.forEach(r => {
                if (r.type === "LOAN") {
                    loansToSum += parseFloat(r.amount)
                }
                if (r.type === "DEBT") {
                    debtsToSum += parseFloat(r.amount)
                }
            })
            setLoansSum(loansToSum)
            setDebtsSum(debtsToSum)

            let h = 0, n = 0, s = 0;
            let totalHappy = 0, totalNotHappy = 0;
            data.userRecords.emotionalRecords.forEach(r => {
              console.log(r.state)
              if (r.state === 'HAPPY'){
                h++;
                totalHappy++;
              }
              if (r.state === 'NORMAL'){
                n++;
                totalNotHappy++
              }
              if (r.state === 'SAD'){
                s++
                totalNotHappy++
              }
              setHappy(h)
              setNormal(n)
              setSad(s)
            })

            console.log(totalHappy)
            console.log(totalNotHappy)
            console.log(totalHappy < totalNotHappy)
            if(totalHappy < totalNotHappy)
              setRest(1)
        },
    })

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

    return(
        <div>
          <div className='whiteLine'></div>
          <Card style={{ width: '700px', margin: '50px auto', minHeight: '400px' }}>
              <div className='whiteLineInCard'></div>
              <NavBar />
              <Link to="/finance" style={{ textDecoration: 'none' }}>
                <Card style={{width: '70%', display:'inline-block', margin: '20px auto', padding: '10px 15px',
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", display:"flex", justifyContent: "space-between", flexDirection: "row"}}>
                    <div className='financeWidget'style={{ textDecoration: 'none', color: 'inherit' }}
                      // hidden={!chosenEmotion}
                    >
                      <h3 style={{textAlign: "center", textDecoration:"none", color: "black"}}>Finances</h3>
                      <PieChart
                        style={{
                            fontSize: '8px'
                        }}
                        viewBoxSize={[150,60]}
                        center={[75, 30]}
                        data={data}
                        radius={30}
                        lineWidth={60}
                        segmentsStyle={{ animationDuration: '1000', cursor: 'pointer', fontSize: "10px" }}
                        animate
                        label={({ dataEntry }) =>
                            dataEntry.title === 'loans' ? (loansSum ==0 ? ""  : loansSum + " ₽") : (debtsSum ==0 ? ""  : debtsSum + " ₽")
                        }
                        labelPosition={100 - 60 / 2}
                        labelStyle={{
                            ...defaultLabelStyle,
                        }}
                      />
                      <div className='colorsFinance'>
                        <div className='loansColor'></div>
                        <div className='loansTextLabel'>Loans</div>
                        <div className='debtsColor'></div>
                        <div className='loansTextLabel'>Debts</div>
                      </div>
                    </div>
                </Card>
              </Link>


              <Link to="/emotion" style={{ textDecoration: 'none' }}>
                <Card style={{width: '70%', display:'inline-block', margin: '20px auto', padding: '10px 15px',
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", display:"flex", justifyContent: "space-between", flexDirection: "row"}}>
                    <div className='financeWidget'style={{ textDecoration: 'none', color: 'inherit' }}
                      // hidden={!chosenEmotion}
                    >
                      <h3 style={{textAlign: "center", tesxtDecoration:"none", color: "black"}}>Emotions calendar</h3>
                      
                      <div className='emotionsStat'>
                        
                        <div className='emotionEntry'>
                          <img className='emotionsWidgetImg' src="/happy.png"></img>
                          <b className='emotionsCount'>{happy + (happy == 1 ? " day" : " days")}</b>
                        </div>
                        
                        <div className='emotionEntry'>
                          <img className='emotionsWidgetImg' src="/normal.png"></img>
                          <b className='emotionsCount'>{normal + (normal == 1 ? " day" : " days")}</b>
                        </div>
                        
                        <div className='emotionEntry'>
                          <img className='emotionsWidgetImg' style={{width: '38px', height: '38px'}} src="/sad.png"></img>
                          <b className='emotionsCount'>{sad + (sad == 1 ? " day" : " days")}</b>
                        </div>
                      </div>
                      
                      <h6 hidden={!rest} style={{ textDecoration: 'none', color: 'black', textAlign: 'center', marginTop: '20px' }}>
                        Advice: You should get some rest</h6>
                    </div>
                </Card>
              </Link>


              <Link to="/steps" style={{ textDecoration: 'none' }}>
                <Card style={{width: '70%', display:'inline-block', margin: '20px auto', padding: '10px 15px',
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", display:"flex", justifyContent: "space-between", flexDirection: "row"}}>
                    <div className='financeWidget'style={{ textDecoration: 'none', color: 'inherit' }}
                      // hidden={!chosenEmotion}
                    >
                      <Bar options={options} data={dataChart} />
                      <h6 style={{ textDecoration: 'none', color: 'black', textAlign: 'center', marginTop: '20px' }}>
                        Your weekly average number of steps: <b>{stepsAverage}</b></h6>
                    </div>
                </Card>
              </Link>
          </Card>
        
        </div>
    )
}

export default Main