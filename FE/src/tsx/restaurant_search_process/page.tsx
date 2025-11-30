//식당 검색 페이지

"use client"
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function SearchPage() {

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);  
    const [isTagSearchOpen,setIsTagSearchOpen] = useState<boolean>(false)
    const [tagsForSearch,setTagsForSearch] = useState<string[]>();

    //const router = useRouter()

    //타이핑으로 검색하는 함수
    /*const handleTypeSearch = () => {
        const params = new URLSearchParams();
        params.append("q", query.toString())
        router.push(`/restaurant_archive/search/results?${params.toString()}`)
    }*/

    useEffect(()=>{document.body.style.overflow = 'hidden';},[])

    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => setSuggestions(data))
                .catch(err => console.error(err));
        }, 300); // 디바운스 300ms

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <main className={styles.nomrg}>
            <div>
                <br />
                <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
            </div>

            <div
                className = {styles.search_container}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        (document.activeElement as HTMLElement)?.blur();
                    }
                }}
            >

            <input className = {styles.input_box}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="식당 정보를 입력해주세요."
            />
            <button type="submit" className={styles.search_btn} ><FontAwesomeIcon icon={faMagnifyingGlass} /></button>

            {suggestions.length > 0 && (
                <ul className={styles.suggestion_list}>
                    {suggestions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            )}
            </div>
            
        
        <TagSearch isTagSearchOpen={isTagSearchOpen} setIsTagSearchOpen={setIsTagSearchOpen}/>
        </main>
    );
}

interface isTagSearchOpenType{
    isTagSearchOpen: boolean;
    setIsTagSearchOpen: React.Dispatch<React.SetStateAction<string>>
}

//sellectedTags에 들어갈 아이템의 type
type SelectedItem = {
    type: 'region' | 'tag' | 'price';
    id: number | null; // 'price'는 id가 'price' 문자열
    name: string;     
    priceMin?: number; 
    priceMax?: number;
};

//태그로 검색하기 누르면 올라오는 Modal
function TagSearch({isTagSearchOpen,setIsTagSearchOpen}:isTagSearchOpenType){
    const tags:string[] = ["지역","음식 종류","가격","분위기"]
    const [activeTag,setActiveTag] = useState<string>("") //현재 클릭한 태그 저장
    const [sellectedTags,setSellectedTags] = useState<SelectedItem[]>([]) //이제 얘로 다 처리할거임
    const [PriceRange,setPriceRange] = useState({min:1000,max:500000})
    const scrollRef = useRef<HTMLDivElement>(null)

    //sellectedTags에 아이템 추가하는 함수
    const handleAddItem = (item:SelectedItem) => {
        if (item.type == "region"){
            let isduplicate:boolean = false
            for(let i=0; i<sellectedTags.length;i++){
                if(sellectedTags[i].id == item.id){
                    isduplicate = true
                    continue
                }
            }
            if(isduplicate == false){
                setSellectedTags(sellectedTags.concat(item))
            }
        }

        else if (item.type == "tag"){
            let isduplicate:boolean = false
            for(let i=0; i<sellectedTags.length;i++){
                if(sellectedTags[i].id == item.id){
                    isduplicate = true
                    continue
                }
            }
            if(isduplicate == false){
                setSellectedTags(sellectedTags.concat(item))
            }
        }

        //가격 정보가 이미 들어있으면 없애고, 새 가격 추가
        else if (item.type == "price"){

            let copy = [...sellectedTags]

            for(let i=0;i<sellectedTags.length;i++){
                if (sellectedTags[i].type == "price"){
                    copy = copy.filter((item)=>item.type != "price")
                }
            }
            copy = copy.concat(item)
            setSellectedTags(copy)
        }
        console.log(sellectedTags)
    }

    //상위 태그 누르면 해당 위치로 이동하는 함수
    const handleScroll = () => {

        const content:HTMLDivElement = scrollRef.current

        if(activeTag == "지역"){
            content.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
            })
        }
        else if(activeTag == "음식 종류"){
            content.scrollTo({
                    top: 540,
                    left: 0,
                    behavior: 'smooth'
            })
        }
        else if(activeTag == "가격"){
            content.scrollTo({
                    top: 1070,
                    left: 0,
                    behavior: 'smooth'
            })
        }
        else if(activeTag == "분위기"){
            content.scrollTo({
                    top: 1630,
                    left: 0,
                    behavior: 'smooth'
            })
        }
    }

    //sellectedTags에 아이템 삭제하는 함수
    const handleDeleteItem = (item:SelectedItem) => {
        let copy = [...sellectedTags]
        copy = copy.filter((e)=>{return(e!=item)})
        setSellectedTags(copy)
    }

    //trashcan 누르면 전부 삭제하는 함수
    const deleteAll = () => {
        let copy = [...sellectedTags]
        copy = []
        setSellectedTags(copy)

        setPriceRange({min:1000, max:500000})
    }

    //적용하기 누르면 address 설정하는 함수
    /*const router = useRouter();

    const handleSubmit = () => {
        const params = new URLSearchParams();

        sellectedTags.forEach((item)=>{
            if (item.type == "region"){
                params.append("region_id", item.id.toString())
            }
            else if(item.type == "tag"){
                params.append("tag_ids", item.id.toString())
            }
            else{
                params.append("price_min", item.priceMin.toString())
                params.append("price_max", item.priceMax.toString())
            }

            router.push(`/restaurant_archive/search/results?${params.toString()}`);
        })
    }*/

    //최종 주소
    const [address,setAddress] = useState<string>("http://152.69.228.114:8000/api/restaurants?")

    //최종 주소 만드는 함수
    const handleCreateAddress = () => {

        let copy = address;

        for(let i=0; i<sellectedTags.length;i++){
            if(sellectedTags[i].type == "region"){
                copy = copy + `region_id=${sellectedTags[i].id}&`;
                
            }
            else if(sellectedTags[i].type == "tag"){
                copy = copy + `tag_ids=${sellectedTags[i].id}&`;
            }
            else{
                copy = copy + `price_min=${sellectedTags[i].priceMin}&`
                            + `price_max=${sellectedTags[i].priceMax}&`;
            }
        }

        if(copy.endsWith("&")){
            copy = copy.slice(0, -1);
        }

        setAddress(copy);
    }


    useEffect(()=>(handleScroll()),[activeTag])
    useEffect(()=>{console.log(PriceRange)},[PriceRange])
    useEffect(()=>{console.log(address)},[address])

    return(
        <div className='tagSearch'>
            <div className={styles.tagSearch__chevron}>
                    <div><FontAwesomeIcon icon={faChevronUp}/></div>
                    <div><FontAwesomeIcon icon={faChevronUp}/></div>
                </div>
            <div className={`${styles.tagSearchContainer} ${isTagSearchOpen ? styles.show:null}`} >
                <h6 className={styles.tagSearch__title} onClick={()=>{
                    if(isTagSearchOpen == true){
                        setIsTagSearchOpen(false) 
                        console.log(isTagSearchOpen)}
                    else{setIsTagSearchOpen(true)
                        console.log(isTagSearchOpen)}}}>
                태그로 검색하기
                </h6>

            <div className={styles.tagSearch__tags}>
            {
                tags.map((a,i)=>{
                    return(
                     <div onClick={()=>{setActiveTag(a);}} className={`${styles.tagSearch__tag} ${activeTag == a ? styles.red : '' }`}>
                        <div>{a}</div>
                    </div>
            )})}
            </div>

        <div className={styles.tagSearch__bar}></div>

        <div ref={scrollRef} className={styles.scrollableContent}>
            <Region handleAddItem={handleAddItem}></Region>
            <Culture handleAddItem={handleAddItem}></Culture>
            <Price handleAddItem={handleAddItem} sellectedTags={sellectedTags} setSellectedTags={setSellectedTags}/>
            <Atmosphere handleAddItem={handleAddItem}/>
        </div>

        <div className={styles.tagSearch__bar}></div>
        <div className={styles.tagSearch__submit}>
            <div className={styles.tagSearch__iconAndTags}>
                <div className={styles.tagSearch__trashcan} onClick={deleteAll}><FontAwesomeIcon icon={faTrashCan} /></div>
                {
                    sellectedTags.map((item)=>{
                        return(<div className={styles.tagSearch__selectedTag}>{item.name}
                                    <span className={styles.tagSearch__tagDel} 
                                        onClick={()=>{handleDeleteItem(item)}}>
                                        <FontAwesomeIcon icon={faXmark} />
                                    </span>
                                </div>)})
                }
            </div>
            <div className={styles.tagSearch__submitBtns}>
                <button className={styles.tagSearch__apply}><span>적용하기</span></button>
                <button className={styles.tagSearch__close}>닫기</button>
            </div>
        </div>
        </div>
        </div>
    )
}

interface a{
    id: number;
    name: string;
    parent_id: string;
    depth: string;
}

interface handleSellectedTagsType{
    handleAddItem: (item) => {}
}

//상위 지역 Modal
function Region({handleAddItem}:handleSellectedTagsType){

    const [showSpecificRegions,setShowSpecificRegions] = useState(false) //하위 지역 모달창 보여줄지 말지 저장
    const [upperRegions,setUpperRegions] = useState<[]>([])
    const [regionName,setRegionName] = useState<string>("") //현재 선택된 상위 지역 태그 저장

    //상위 지역들 불러오는 함수
    const handleGetUpperRegions = () => {
        axios.get("http://152.69.228.114:8000/api/regions")
        .then((res)=>{setUpperRegions(res.data)})
    } 

    //상위 지역 불러오기
    useEffect(()=>{
        handleGetUpperRegions()
    },[])

    //잘 불러왔는지 확인
    useEffect(()=>{
        console.log(upperRegions)
    },[upperRegions])

    return(
    <div className={styles.tagSearch__body}>
            <div className={styles.tagSearch__regions}>

                {
                    upperRegions.length != 0 ? upperRegions.map((item)=>{
                        return(<span onClick={()=>{
                            setRegionName(item.name)
                            setShowSpecificRegions(true)
                            }} className={`${regionName ==item.name ? styles.redBorder : ''}`}>
                            {item.name}</span>)
                    }) : null
                    
                }
            </div>
        {showSpecificRegions && <SpecificRegion handleAddItem={handleAddItem} regionName={regionName} upperRegions={upperRegions}/>}
    
        
        </div>)
}

interface SpecificRegionProps{
    regionName:string;
    upperRegions:{type: 'region' | 'tag' | 'price';
    id: number | string; // 'price'는 id가 'price' 문자열
    name: string;     
    priceMin?: number; 
    priceMax?: number;}[];
    handleAddItem:(item)=>{}
}

//상세 지역 modal
function SpecificRegion({regionName,handleAddItem,upperRegions}:SpecificRegionProps){ 

    //local에서 axios 호출할 때 주소 앞에 baseURL 붙여야 함
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    //하위 지역들 저장
    const [smallRegions,setSmallRegions] = useState<a[]|null>(null) 

    //하위지역 ID
    const [smallRegionID,setSmallRegionID] = useState<number>(-1)


    //
    const handleSetRegionID = () => {
        for(let i=0;i<upperRegions.length;i++){
            if(upperRegions[i].name == regionName){
                setSmallRegionID(upperRegions[i].id)
            }}
    }

    //하위 지역 가져오는 함수
    const getRegion = () => {
        axios.get(`http://152.69.228.114:8000/api/regions?parent_id=${smallRegionID}`)
        .then((res)=>{setSmallRegions(res.data)})
    }

    useEffect(()=>{
        handleSetRegionID()
    },[regionName])

    useEffect(()=>{
        getRegion()
    },[smallRegionID])

    useEffect(()=>{
        console.log(smallRegions)
    },[smallRegions])

    if (smallRegions != null){     
        return (
            <div className={styles.specificRegions}>
                {smallRegions.map((reg) => (
                    <div key={reg.id} onClick={()=>{handleAddItem({type:"region",id:reg.id,name:reg.name})}}>{reg.name}</div>
                ))}
            </div>
        );
    }
    else{
        return (<div className={styles.specificRegions}>로딩중</div>)
    }       
}

interface modalType{
    handleAddItem:(item)=>{}
}

//문화권 modal
function Culture({handleAddItem}:modalType){
    const [bigCultureTags,setBigCultureTags] = useState<{
        type: 'region' | 'tag' | 'price';
        id: number | string; // 'price'는 id가 'price' 문자열
        name: string;     
        priceMin?: number; 
        priceMax?: number;}[]>([])
    const [sellectedBigTag,setSellectedBigTag] = useState<number>(0) //선택된 상위 태그의 ID 저장

    const [smallCultureTags,setSmallCultureTags] = useState<{
        type: 'region' | 'tag' | 'price';
        id: number | string; // 'price'는 id가 'price' 문자열
        name: string;     
        priceMin?: number; 
        priceMax?: number;}[]>([])

    //bigCultureTags 불러오는 함수
    const getBigCultureTags = () => {
        axios.get("http://152.69.228.114:8000/api/tags?category_id=1")
        .then((res)=>{setBigCultureTags(res.data)})
    }

    //bigCultureTags에서 클릭한 태그 id 저장하는 함수
    const handleSaveBigCultureTag = (item) => {
        setSellectedBigTag(item.id)
    }

    //smallCultureTags 불러오는 함수
    const getSmallCultureTags = () => {
        axios.get(`http://152.69.228.114:8000/api/tags?category_id=1&parent_id=${sellectedBigTag}`)
        .then((res)=>{setSmallCultureTags(res.data)})
    }
    
    useEffect(()=>{getBigCultureTags()},[])
    useEffect(()=>{console.log(bigCultureTags)},[bigCultureTags])
    useEffect(()=>{getSmallCultureTags()},[sellectedBigTag])
    useEffect(()=>{console.log(sellectedBigTag)},[sellectedBigTag])

    return(
        <div className={styles.Food__container}>
            <img className={styles.Food__mapImg} src="../images/지도.png"/>
            <div className={styles.Food__tagContainer}>
            {

                bigCultureTags.map((item)=>{
                    return(
                        <span className={styles.Food__tag} 
                            onClick={()=>{
                                handleAddItem({type:"tag",id:item.id,name:item.name})
                                handleSaveBigCultureTag(item)
                            }}>
                            {item.name}</span>
                    )
                })

            }
            </div>

            <div className={styles.Food__foodTags}>
                {
                    smallCultureTags.map((item)=>{
                        return(
                        <div onClick={()=>{
                            handleAddItem({type:"tag",id:item.id,name:item.name})
                        }}>{item.name}</div>
                        )
                    })
                }
            </div>
        </div>
            

        
    )
}

//Price 모듈에서 tagSearch로 min price, max price 보내기 위한 타입 선언
interface PriceLimitType{
    handleAddItem: (item) => {}

    sellectedTags: {
    type: 'region' | 'tag' | 'price';
    id: number | null; 
    name: string;     
    priceMin?: number; 
    priceMax?: number;}[]
    
    setSellectedTags: (item) => {}
}

//가격 Modal
function Price({handleAddItem,sellectedTags,setSellectedTags}:PriceLimitType){

    let min_price_ref = useRef<HTMLInputElement>(null)
    let max_price_ref = useRef<HTMLInputElement>(null)
    let [minMaxPrice,setMinMaxPrice] = useState<{type: 'price';
    id: number | null; // 'price'는 id가 'price' 문자열
    name: string;     
    priceMin?: number | undefined; 
    priceMax?: number | undefined;}>({type:'price',id:null,name:"default",priceMin:1000,priceMax:500000})
    
    let [PreviousPrice,setPreviousPrice] = useState(null)

    //MinMaxPrice에 priceMin 저장
    const handleMinMaxPrice = () => {
        setMinMaxPrice(
        {type:'price',
        id:null,
        name: min_price_ref.current?.value + "원 ~ " + max_price_ref.current?.value + "원",
        priceMin:min_price_ref.current.value,
        priceMax:max_price_ref.current.value})

        console.log(minMaxPrice)
    }

    //적용 누르면, minMaxPrice 업데이트, sellectedTags에 item 추가 (중복 검사해야 함)
    const handleSubmitPrice = () => {

        handleMinMaxPrice(); //minMaxPrice 업데이트
        handleAddItem(minMaxPrice);
        }
    
    useEffect(()=>{console.log(sellectedTags)},[sellectedTags])

    return(
            <div className={styles.Price__container}>
                <div className={styles.Price__contents}>

                <div className={styles.Price__rangeGraphic}>

                    <input type='range' step={10000} min={1000} max={500000}
                     className={styles.Price__range} 
                     ref={min_price_ref}
                     onChange={handleMinMaxPrice}></input>

                    <input type='range' step={10000} min={1000} max={500000} 
                    className={styles.Price__range2} 
                    ref={max_price_ref}
                    onChange={handleMinMaxPrice}></input>
                </div>
                
                <div className={styles.Price__rangeNums}>
                    <div>1,000</div>
                    <div>10,000</div>
                    <div>20,000</div>
                    <div>30,000</div>
                    <div>40,000</div>
                    <div>500,000</div>
                </div>

                <div>
                  <div className={styles.Price__selfInput}>직접 입력</div>
                  <input type='text' placeholder='1000' value={minMaxPrice.priceMin} className={styles.Price__input}></input>
                  <span> ~ </span>
                  <input type='text' placeholder='500,000' value={minMaxPrice.priceMax} className={styles.Price__input}></input>
                  <button className={styles.Price__submit} onClick={()=>{handleSubmitPrice()}}>적용</button>
                </div>
                </div>
            </div>
    )
}

//분위기 Modal
function Atmosphere({handleAddItem}:handleSellectedTagsType){

    //태그 저장 공간
    const [atmoList,setAtmoList] = useState<{
        type: 'region' | 'tag' | 'price';
        id: number | string; // 'price'는 id가 'price' 문자열
        name: string;     
        priceMin?: number; 
        priceMax?: number;}[]>([]) 

    //분위기 태그 불러오는 함수
    const getAtmoTags = ():void=>{
        axios.get("http://152.69.228.114:8000/api/tags?category_id=2")
        .then((res)=>{setAtmoList(res.data)})
    }

    useEffect(()=>{getAtmoTags()},[])
    useEffect(()=>{console.log(atmoList)},[atmoList])

    return(
        <div className={styles.atmo__carrier}>
            <div className={styles.atmo__container}>
                {

                    atmoList.map((item)=>{
                        return(
                            <div className={styles.atmo__item} 
                                onClick={()=>{handleAddItem({type:"tag",id:item.id,name:item.name})}}>
                                {item.name}
                            </div>
                        )
                    })

                }
            </div>
        </div>
    )
}