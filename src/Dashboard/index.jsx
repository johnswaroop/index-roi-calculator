import React, { useEffect, useState } from 'react'
import styles from './dashboard.module.scss'
import Graph from '../Graph';
import './loader.css'

function Dashboard() {

    const [tokenData, setTokenData] = useState(null);
    const [tokenPriceData, setTokenPriceData] = useState(null);
    const [selectedToken, setSelectedToken] = useState(Object.keys(staticTokenData)[0]);
    const [inputForm, setInputForm] = useState({});
    const [result, setResult] = useState({ currentValue: 0.00, PNL: 0.00, percentGain: 0.00 });
    const [graphData, setgraphData] = useState([[0], [0]]);

    useEffect(() => {

        let getData = async () => {
            let data = await getTokenData();
            let newTokenData = {};
            data.forEach((obj) => {
                newTokenData[Object.keys(obj)[0]] = Object.values(obj)[0];
            })
            setTokenData({ ...newTokenData });
        }

        let getPriceData = async () => {
            let data = await getTokenPriceData();
            let newTokenData = {};
            data.forEach((obj) => {
                newTokenData[Object.keys(obj)[0]] = Object.values(obj)[0];
            })

            // setTokenPriceData({ ...newTokenData });
            formDatePrice({ ...newTokenData }, setTokenPriceData)
        }

        getData();
        getPriceData();

    }, []);

    const calculate = () => {
        let date = inputForm.date

        let p1 = tokenPriceData[selectedToken][date];
        let p2 = tokenPriceData[selectedToken][todaysDateinYMD()];
        let corpus = parseFloat(inputForm.corpus);

        let units = (corpus / p1);
        let currentValue = units * p2;
        setResult({ currentValue: round2(currentValue), PNL: round2(currentValue - corpus), percentGain: round2(((currentValue - corpus) / corpus) * 100) });
        setgraphData(generateGraphData(tokenPriceData[selectedToken], inputForm, units));
    }

    const reset = () => {
        setInputForm({ corpus: "", date: "" });
        setResult({ currentValue: 0.00, PNL: 0.00, percentGain: 0.00 })
        setgraphData([[0], [0]]);
    }


    if (!tokenData || !tokenPriceData) return <div className={styles.dashboard}><span class="dots-loader">Loading…</span></div>

    return (
        <div className={styles.dashboard}>
            {/* <nav className={styles.header}>
                <h1>Index ROI Calculator</h1>
            </nav> */}
            <div className={styles.con}>
                <div className={styles.list}>
                    {
                        Object.values(staticTokenData).map((token, id) => {
                            let selectStyle = (selectedToken == Object.keys(staticTokenData)[id]) ? styles.selected : null;
                            return (
                                <span key={"elm" + id} className={styles.listElm + " " + selectStyle}
                                    onClick={() => { setSelectedToken(Object.keys(staticTokenData)[id]); reset(); }} >
                                    <img src={token.icon} alt="" />
                                    <p className={styles.hoverTitle}>{Object.values(staticTokenData)[id]['title']}</p>
                                </span>)
                        })
                    }
                </div>
                <div className={styles.info}>
                    <div className={styles.title} key={selectedToken + 't'}>
                        <img src={staticTokenData[selectedToken].icon} alt="" />
                        <span className={styles.heading}>
                            <h1>{staticTokenData[selectedToken].title}</h1>
                            <p className={styles.price}>{'$' + tokenData[selectedToken]?.market_data?.current_price?.usd}</p>
                        </span>
                    </div>
                    <p className={styles.desc} key={selectedToken + 'd'}>
                        {staticTokenData[selectedToken].desc}
                    </p>
                    <div className={styles.data} key={selectedToken + 'dd'}>
                        <span className={styles.ticker}>
                            <p className={styles.key}>MARKET CAP</p>
                            <p className={styles.value}>{'$' + (getRounderMil(tokenData[selectedToken]?.market_data?.market_cap?.usd)) + "M"}</p>
                        </span>

                        <span className={styles.ticker}>
                            <p className={styles.key}>VOLUME</p>
                            <p className={styles.value}>{'$' + (getRounderMil(tokenData[selectedToken]?.market_data?.total_volume?.usd)) + 'M'}</p>
                        </span>

                        <span className={styles.ticker}>
                            <p className={styles.key}>CURRENT SUPPLY</p>
                            <p className={styles.value}>{round2(tokenData[selectedToken]?.market_data?.total_supply)}</p>
                        </span>
                    </div>
                </div>
                <div className={styles.calculator}>
                    <div className={styles.calcTop}>
                        <div className={styles.dial}>
                            <span className={styles.value}>
                                <label className={styles.label}>Current value</label>
                                <h1>{'$' + get00(result.currentValue)}</h1>
                            </span>
                            <span className={styles.pnl}>
                                <label className={styles.label}>PNL</label>
                                <h2>{'$' + get00(result.PNL)}</h2>
                            </span>
                            <span className={styles.gain}>
                                <label className={styles.label}>% Gain</label>
                                <h2>{get00(result.percentGain) + '%'}</h2>
                            </span>
                        </div>
                        <form className={styles.input} onSubmit={(e) => { e.preventDefault(); calculate(); }} >
                            <span className={styles.inputBox + ' ' + styles.corpus}>
                                <input required type="text" value={inputForm.corpus} name={"corpus"}
                                    onChange={(e) => { setInputForm((form) => { form[e.target.name] = e.target.value; return { ...form } }) }} />
                            </span>
                            <span className={styles.inputBox + ' ' + styles.date}>
                                <input required type="date" value={inputForm.date} name={"date"} className={styles.dateInput}
                                    min={`${Object.keys(tokenPriceData[selectedToken])[0]}`} max={todaysDateinYMD()}
                                    placeholder='On Date'
                                    onChange={(e) => { setInputForm((form) => { form[e.target.name] = e.target.value; return { ...form } }) }} />
                            </span>

                            <div className={styles.quickTime}>
                                <ul>
                                    <li onClick={() => { setInputForm((f) => { f.date = dateBeforeDays(30); return { ...f }; }) }}>1M</li>
                                    <li onClick={() => { setInputForm((f) => { f.date = dateBeforeDays(90); return { ...f }; }) }}>3M</li>
                                    {((selectedToken == 'defipulse-index') || (selectedToken == 'eth-2x-flexible-leverage-index')) && <li onClick={() => { setInputForm((f) => { f.date = dateBeforeDays(180); return { ...f }; }) }}>6M</li>}
                                    {(selectedToken == 'defipulse-index') && <li onClick={() => { setInputForm((f) => { f.date = dateBeforeDays(365); return { ...f }; }) }}>1Y</li>}
                                </ul>
                            </div>
                            <div className={styles.nav}>
                                <button onClick={reset}>Reset</button>
                                <button type='submit' className={styles.calc} >Calculate ROI</button>
                            </div>
                        </form>
                    </div>
                    <Graph graphData={graphData} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard

const getTokenData = async () => {
    let tokendata = {
        "defipulse-index": "",
        "metaverse-miner": "",
        "bankless-bed-index": "",
        "eth-2x-flexible-leverage-index": "",
        "index-coop-eth-2x-flexible-leverage-index": "",
        "btc-2x-flexible-leverage-index": "",
        "data-economy-index": ""
    }
    let networkRequest = [];
    Object.keys(tokendata).forEach((token) => {
        networkRequest.push(new Promise((resolve, reject) => {
            fetch(`https://api.coingecko.com/api/v3/coins/${token}`)
                .then(response => response.json())
                .then(data => { resolve({ [token]: data }) })
                .catch((er) => {
                    console.log(er)
                    reject();
                });
        }))
    })

    return Promise.all(networkRequest);
}

const getTokenPriceData = async () => {
    let tokendata = {
        "defipulse-index": "",
        "metaverse-miner": "",
        "bankless-bed-index": "",
        "eth-2x-flexible-leverage-index": "",
        "index-coop-eth-2x-flexible-leverage-index": "",
        "btc-2x-flexible-leverage-index": "",
        "data-economy-index": ""
    }
    let networkRequest = [];
    Object.keys(tokendata).forEach((token) => {
        networkRequest.push(new Promise((resolve, reject) => {
            fetch(`https://api.coingecko.com/api/v3/coins/${token}/market_chart?vs_currency=usd&days=11430`)
                .then(response => response.json())
                .then(data => { resolve({ [token]: data }) })
                .catch((er) => {
                    console.log(er)
                    reject();
                });
        }))
    })
    return Promise.all(networkRequest);
}

let staticTokenData = {
    "defipulse-index": { title: "Defi Pulse Index", icon: "/svgs/dpi.svg", desc: "  The DeFi Pulse Index is a capitalization-weighted index that tracks the performance of decentralized financial assets across the market." },
    "metaverse-miner": { title: "Metaverse Index", icon: "/svgs/mvi.svg", desc: "The Metaverse Index (MVI) is designed to capture the trend of entertainment, sports and business shifting to take place in virtual environments." },
    "bankless-bed-index": { title: "Bankless BED Index", icon: "/svgs/bed.svg", desc: "Bankless proposed that the Index Coop manage a Set based on an index of Crypto’s most investable assets, BTC, ETH, and DPI, in equal weight." },
    "eth-2x-flexible-leverage-index": { title: "ETH2x-FLI", icon: "/svgs/eth2x-fli.svg", desc: "The Ethereum Flexible Leverage Index lets you leverage a collateralized debt position in a safe and efficient way, by abstracting its management into a simple index." },
    "index-coop-eth-2x-flexible-leverage-index": { title: "ETH2x-FLI Polygon", icon: "/svgs/eth2x-fli.svg", desc: "The Polygon-native version of the Ethereum Flexible Leverage Index lets you leverage a collateralized debt position in a safe and efficient way, by abstracting its management into a simple index." },
    "btc-2x-flexible-leverage-index": { title: "BTC2x-FLI", icon: "/svgs/btc.svg", desc: "The Bitcoin Flexible Leverage Index lets you leverage a collateralized debt position in a safe and efficient way, by abstracting its management into a simple index. " },
    "data-economy-index": { title: "Data Economy Index", icon: "/svgs/data.svg", desc: "The Data Economy is an ecosystem of data-based products and services. Whereas Decentralized Finance (aka DeFi) is disrupting traditional banking and financial services." }
}

function getRounderMil(num) {
    num = num / 1000000;
    return round2(num)
}

function round2(num) {
    return (Math.round(num * 100) / 100).toFixed(2)
}

const unixToDate = (timestamp) => {
    let date = new Date(timestamp).toLocaleDateString("en-US")
    return date;
}

//mdy -> ymd 012 -> 201
const timestampToYMD = (timestamp) => {
    let date = unixToDate(timestamp);
    let splitDate = date.split("/");
    let y = splitDate[2];
    let m = splitDate[0];
    let d = splitDate[1];

    d = `${d}`;
    m = `${m}`;

    if (d.length <= 1) {
        d = '0' + d;
    }


    if (m.length <= 1) {
        m = '0' + m;
    }

    return `${y}-${m}-${d}`
}



const todaysDateinYMD = () => {
    let date = new Date().toLocaleDateString("en-US");
    let splitDate = date.split("/");
    return `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}`
}

const dateBeforeDays = (days) => {
    var dateOffset = (24 * 60 * 60 * 1000) * days;
    var myDate = new Date();
    myDate.setTime(myDate.getTime() - dateOffset);
    let date = myDate.toLocaleDateString("en-US");
    let splitDate = date.split("/");
    let y = splitDate[2];
    let m = splitDate[0];
    let d = splitDate[1];

    d = `${d}`;
    m = `${m}`;

    if (d.length <= 1) {
        d = '0' + d;
    }


    if (m.length <= 1) {
        m = '0' + m;
    }

    return `${y}-${m}-${d}`
}

const formDatePrice = (tokenPriceData, setState) => {
    if (tokenPriceData) {
        let datePriceData = {};
        Object.keys(tokenPriceData).forEach((token) => {
            datePriceData = { ...datePriceData, [token]: "" };
            tokenPriceData[token].prices.forEach((elm) => {
                // datePriceData[token][timestampToYMD(elm[0])] = elm[1];
                datePriceData[token] = { ...datePriceData[token], [timestampToYMD(elm[0])]: elm[1] }
            })
        })
        setState({ ...datePriceData });
    }
}

function get00(value) {
    if (value == 0) {
        return '0.00'
    }
    return value;
}

console.log(dateBeforeDays(5));

function generateGraphData(pricedata, input, units) {

    let newData = [0];
    let newLabels = [0];
    let inputDate = input.date

    for (let i = 6; i >= 0; i--) {
        if (dateBeforeDays(i) == input.date) {
            inputDate = dateBeforeDays(7);
        }
    }

    function delta(arr) {
        let DELTA = Math.floor(Object.keys(arr).length / 7);
        let newArrr = [];
        for (let i = 0; i < arr.length; i = i + DELTA) {
            newArrr.push(arr[i])
        }
        newArrr[newArrr.length - 1] = arr[arr.length - 1];
        return newArrr;
    }

    let startIndex = Object.keys(pricedata).indexOf(inputDate);

    newData = Object.values(pricedata).slice(startIndex);
    newLabels = Object.keys(pricedata).slice(startIndex);
    newData = delta(newData).map(d => d * units);
    newLabels = delta(newLabels);

    return [newLabels, newData]
}
