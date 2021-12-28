import React from 'react'
import styles from './graph.module.scss'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line } from 'react-chartjs-2';


function Graph({ graphData }) {

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        ChartDataLabels,
    );


    const data = {
        labels: graphData[0],
        datasets: [
            {
                label: 'Asset value $ ',
                data: graphData[1],
                borderColor: '#8150E6',
                backgroundColor: '#8150E6',
            },
        ],
    };


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                color: '#000000',
                anchor: 'center',
                align: "end",
                offset: '-25',
                backgroundColor: "#ffffff",
                borderRadius: 5,
                font: {
                    weight: "semi-bold",
                    size: "8"
                },
                formatter: function (value) {
                    return (`$${parseInt(value)}`);
                },
            },
            legend: {
                display: false,
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Line Chart',
            },
        },
        scales: {
            y: {
                steps: 5
            }
        }
    };

    return (
        <div className={styles.graph}>
            <Line options={options} data={data} ></Line>
        </div>
    )
}

export default Graph
