import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://152.69.228.114:8000';

    //상위 지역 저장
    const [higerRegions,setHigerRegions] = useState([])

    //상위 지역 불러오기 
    const handleGetRigions = () => {
        axios.get(`${baseURL}/api/region`)
        .then((res)=>{setHigerRegions(res.data)})
    }

    console.log(higerRegions)