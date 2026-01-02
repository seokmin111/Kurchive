"use client";

import { useState,useEffect } from "react";
import style from "./page.module.css";
import axios from "axios";

export default function RestaurantSpecific() {
    
    return(
      <div className={style.main}>
        <div className={style.navbar}>
          <img src="../../public/backstep_white_background.png" width="15px"></img>
          <div className={style.nav_title}>식당 이름</div>
          <span>저장 버튼</span>
        </div>
        <div className={style.upper_boxes}>
          <div className={style.leftBox}></div>
          <div className={style.rightBox}></div>
        </div>
        <div className={style.recommend}>
          <div className={style.rec_point}>추천 정도 3점</div>
          <div>별이 다섯 개 </div>
        </div>

        <div className={style.map}>
          <img src=""></img>
          <div>맵링크 xxxxxxxxxxx.com</div>
        </div>

        <div className={style.tags}>
          <div className={style.tags_title}>태그</div>
          {
            ["서울","종로/중구","인도 음식"].map((tag)=>{
              return(<div className={style.tags_tag}>{tag}</div>)
            })
          }
        </div>

        <div className={style.line}></div>

        <div className={style.middle_container}>
          <div className={style.rec_menus}>
            <div className={style.rec_menus_title}>추천 메뉴</div>
            {
              ['김치찌개','된장찌개','제육볶음'].map((item)=>{
                return(
                  <div className={style.rec_menus_menu}>{item}</div>
                )
              })
            }

          </div>

          <div className={style.rec_menus_pictures}>
              {
                [1,2,3].map((item)=>{
                  return(<div className={style.rec_menus_pictures_picture}>{item}</div>)
                })
              }
            </div>
        </div>

        <div className={style.line}></div>
        <div className={style.line}></div>
        
        <div className={style.lower_box}></div>
      </div>
    )
}
