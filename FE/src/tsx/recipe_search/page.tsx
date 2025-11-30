"use client"

import styles from './page.module.css';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from 'axios';
import { useEffect } from 'react';

import RestaurantFormPage from '../restaurant_osm/page';

export default function RecipeSearchPage() {

    const getRestaurants = () => {
    axios.get("http://138.2.124.34:8000/api/restaurants")
    .then((res)=>{console.log(res.data)})
    }

    useEffect(()=>{
        getRestaurants()
    },[])

    

    return (
        <main className={styles.nomrg}>

            
            <div className={styles.header}>
                <br />
                <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
            </div>

            <div>
                <form className={styles.search_container} action="#" method="get"> {/* 검색어 보낼 주소 */}
                    <input type="text" className={styles.input_box} placeholder="식당 정보를 입력해주세요" />
                    <button type="submit" className={styles.search_btn}></button>
                </form>
            </div>

            <div className={styles.button_wrapper}>
                <Link to="/">
                    <button className={styles.back_btn}>&lt;<br />메인화면으로 <br /> 돌아가기</button>
                </Link>
                
                <Link to="/recipe/edit">
                    <button className={styles.red_btn}>레시피 아카이빙</button>
                </Link>
            </div>

            <div className={styles.recipe_container}>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                
            </div>

            <div className={styles.footer}></div>
        </main>
    );
}
//const data:[] = 