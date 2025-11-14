//식당 검색 페이지

"use client"
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import axios from 'axios';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function SearchPage() {

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);  
    const [isTagSearchOpen,setIsTagSearchOpen] = useState<boolean>(false)
    const [tagsForSearch,setTagsForSearch] = useState<string[]>();

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
            <button type="submit" className={styles.search_btn}></button>

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

type SelectedItem = {
    type: 'region' | 'tag' | 'price';
    id: number | string; // 'price'는 id가 'price' 문자열
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

    const handleAddItem = (item) => {
        if (item.type == "region"){
            let isduplicate:boolean = false
            for(let i=0; i<sellectedTags.length;i++){
                if(sellectedTags[i].id == item.id){
                    isduplicate = true
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
                }
            }
            if(isduplicate == false){
                setSellectedTags(sellectedTags.concat(item))
            }
        }

        else if (item.type == "price"){
            
        }
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

    //유저가 태그 누르면 sellectedTags에 항목 추가
    const handleSellectedTags = (tag:string):void => {
        if(sellectedTags.includes(tag) == false){
        let copy = [...sellectedTags]
        copy = copy.concat(tag)
        setSellectedTags(copy)}
    }

    const deleteFromSellectedTags = (tag:string) => {
        let copy = [...sellectedTags]
        copy = copy.filter((e)=>{return(e!=tag)})
        setSellectedTags(copy)
    }

    //유저가 x 누르면 태그 삭제
    const deleteTags = (tag:string) => {
        let copy = [...sellectedTags];
        copy = copy.filter((e)=>{return(e !== tag)})
        setSellectedTags(copy)
    }

    //trashcan 누르면 전부 삭제
    const deleteAll = () => {
        let copy = [...sellectedTags]
        copy = []
        setSellectedTags(copy)

        setPriceRange({min:1000, max:500000})
    }

    useEffect(()=>(handleScroll()),[activeTag])
    useEffect(()=>{console.log(PriceRange)},[PriceRange])

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
            <Region handleSellectedTags={handleSellectedTags}></Region>
            <Food handleSellectedTags={handleSellectedTags}></Food>
            <Price sellectedTags={sellectedTags} setSellectedTags={setSellectedTags} PriceRange={PriceRange} setPriceRange={setPriceRange}/>
            <Atmosphere handleSellectedTags={handleSellectedTags}/>
        </div>

        <div className={styles.tagSearch__bar}></div>
        <div className={styles.tagSearch__submit}>
            <div className={styles.tagSearch__iconAndTags}>
                <div className={styles.tagSearch__trashcan} onClick={deleteAll}><FontAwesomeIcon icon={faTrashCan} /></div>
                {
                    sellectedTags.map((tag)=>{
                        return(<div className={styles.tagSearch__selectedTag}>{tag}
                                    <span className={styles.tagSearch__tagDel} 
                                        onClick={()=>{deleteTags(tag)}}>
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
    handleSellectedTags: (tag:string)=>{};
}

//상위 지역 Modal
function Region({handleSellectedTags}:handleSellectedTagsType){

    const [showSpecificRegions,setShowSpecificRegions] = useState(false)
    const [regionName,setRegionName] = useState<string>("")
    return(
    <div className={styles.tagSearch__body}>
            <div className={styles.tagSearch__regions}>
                <span onClick={()=>{
                    setRegionName("서울")
                    setShowSpecificRegions(true)
                }} className={`${regionName == "서울" ? styles.redBorder : ''}`}>서울</span>
                <span onClick={()=>{
                    setRegionName("경기")
                    setShowSpecificRegions(true)
                }}>경기</span>
                <span onClick={()=>{
                    setRegionName("인천")
                    setShowSpecificRegions(true)
                }}>인천</span> 
                <span onClick={()=>{
                    setRegionName("부산")
                    setShowSpecificRegions(true)
                }}>부산</span>
            </div>
            <div className={styles.tagSearch__regions}>
                <span onClick={()=>{
                    setRegionName("강원")
                    setShowSpecificRegions(true)
                }}>강원</span>
                <span onClick={()=>{
                    setRegionName("대전")
                    setShowSpecificRegions(true)
                }}>대전</span>
                <span onClick={()=>{
                    setRegionName("충북")
                    setShowSpecificRegions(true)
                }}>충북</span>
                <span onClick={()=>{
                    setRegionName("충남")
                    setShowSpecificRegions(true)
                }}>충남</span>
            </div>
            <div className={styles.tagSearch__regions}>
                <span onClick={()=>{
                    setRegionName("경남")
                    setShowSpecificRegions(true)
                }}>경남</span>
                <span onClick={()=>{
                    setRegionName("대구")
                    setShowSpecificRegions(true)
                }}>대구</span>
                <span onClick={()=>{
                    setRegionName("경북")
                    setShowSpecificRegions(true)
                }}>경북</span>
                <span onClick={()=>{
                    setRegionName("울산")
                    setShowSpecificRegions(true)
                }}>울산</span>
            </div>
            <div className={styles.tagSearch__regions}>
                <span onClick={()=>{
                    setRegionName("전남")
                    setShowSpecificRegions(true)
                }}>전남</span>
                <span onClick={()=>{
                    setRegionName("광주")
                    setShowSpecificRegions(true)
                }}>광주</span>
                <span onClick={()=>{
                    setRegionName("전북")
                    setShowSpecificRegions(true)
                }}>전북</span>
                <span className={styles.tagSearch__jeju}>제주</span>
            </div>
        {showSpecificRegions && <SpecificRegion handleSellectedTags={handleSellectedTags} regionName={regionName}/>}
    
        
        </div>)
}

interface SpecificRegionProps{
    regionName:string;
    handleSellectedTags:handleSellectedTagsType;
}

//상세 지역 modal
function SpecificRegion({regionName,handleSellectedTags}:SpecificRegionProps){ 

    //axios 호출할 때 주소 앞에 baseURL 붙여야 함
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const [region,setRegion] = useState<a[]|null>(null) 
    const regions = {서울:1,경기:2,인천:3,부산:4,강원:5,대전:6,충북:7,충남:8,경남:9,대구:10,경북:11,울산:12,전남:13,광주:14,전북:15,제주:16}
    const getRegion = () => {
    axios.get(`${baseURL}/api/regions?parent_id=${regions[regionName]}`)
                .then((res)=>{setRegion(res.data)
                console.log(res.data)
                })
    }

    useEffect(()=>{
        getRegion()
    },[regionName])

    if (region != null){     
        return (
            <div className={styles.specificRegions}>
                {region.map((reg) => (
                    <div key={reg.id} onClick={()=>{handleSellectedTags(reg.name)}}>{reg.name}</div>
                ))}
            </div>
        );
    }
    else{
        return (<div className={styles.specificRegions}>로딩중</div>)
    }       
}

//음식 종류 modal
function Food({handleSellectedTags}:handleSellectedTagsType){
    const cultureTags:string[][] = [["한식","중식","일식","양식"],["인도","동남아시아","중동","아프리카"],["양식","북미","남미","북유럽"],["동유럽","컨템포러리(퓨전)"]]
    const foodTags:string[] = ["고기","해산물","채소","디저트","음료","밥류","국물류/스튜류","면류","빵류"]

    return(
        <div className={styles.Food__container}>
            <img className={styles.Food__mapImg} src="../images/지도.png"/>
            <div className={styles.Food__tagContainer}>
            {
                cultureTags.map((tags)=>{
                    return(
                    <div>
                        {tags.map((tag)=>{
                            return(
                                <span className={styles.Food__tag} 
                                onClick={()=>{handleSellectedTags(tag)}}>
                                {tag}</span>
                            )})}
                    </div>)})
            }
            </div>
            <div className={styles.Food__foodTags}>
                {
                    foodTags.map((tag)=>{
                        return(
                        <div onClick={()=>{handleSellectedTags(tag)}}>{tag}</div>
                        )
                    })
                }
            </div>
        </div>
            

        
    )
}

//Price 모듈에서 tagSearch로 min price, max price 보내기 위한 타입 선언
interface PriceLimitType{
    sellectedTags: []
    setSellectedTags: React.Dispatch<React.SetStateAction<string>>
    PriceRange: {}
    setPriceRange: React.Dispatch<React.SetStateAction<string>>
}

//가격 Modal
function Price({PriceRange,setPriceRange,sellectedTags,setSellectedTags}:PriceLimitType){

    let min_price_ref = useRef<HTMLInputElement>(null)
    let max_price_ref = useRef<HTMLInputElement>(null)
    let [minMaxPrice,setMinMaxPrice] = useState([0,0])
    let [PreviousPrice,setPreviousPrice] = useState(null)

    //MinMaxPrcie에 min_price 저장
    const handleMinPrice = () => {
        let copy = [...minMaxPrice]
        copy[0] = min_price_ref.current.value
        setMinMaxPrice(copy)
        console.log(minMaxPrice)
    }

    //MinMaxPrcie에 max_price 저장
    const handleMaxPrice = () => {
        let copy = [...minMaxPrice]
        copy[1] = max_price_ref.current.value
        setMinMaxPrice(copy)
        console.log(minMaxPrice)
    }

    //적용 눌렀을 때 PriceRange에 값 업데이트 및 sellectedTags에 100~100 꼴로 값 추가
    const handleSubmitPrice = (minimum: number, maximum: number) => {

    // 1. PriceRange 업데이트 (새로운 객체로)
    setPriceRange({ min: minimum, max: maximum });
    
    // 2. sellectedTags 업데이트
    const price_string: string = `${minimum}원~${maximum}원`;

    // 3. setSellectedTags를 *한 번만* 호출
    //    (함수형 업데이트를 사용해 항상 최신 state를 기준으로 작업)
    setSellectedTags(prevTags => {
        let newTags = [...prevTags];

        // 3-1. 만약 이전에 추가한 가격 태그(PreviousPrice)가 있다면,
        if (PreviousPrice !== null) {
            //    이전 가격 태그를 배열에서 제거
            newTags = newTags.filter(tag => tag !== PreviousPrice);
        }

        // 3-2. 새로운 가격 태그를 추가 (중복 방지)
        if (!newTags.includes(price_string)) {
            newTags.push(price_string);
        }

        // 3-3. 최종 배열을 반환
        return newTags;
    });

    // 4. "이전에 추가한 태그"를 현재 태그로 업데이트
    setPreviousPrice(price_string);
}

    return(
            <div className={styles.Price__container}>
                <div className={styles.Price__contents}>

                <div className={styles.Price__rangeGraphic}>

                    <input type='range' step={10000} min={1000} max={500000}
                     className={styles.Price__range} 
                     ref={min_price_ref}
                     onChange={handleMinPrice}></input>

                    <input type='range' step={10000} min={1000} max={500000} 
                    className={styles.Price__range2} 
                    ref={max_price_ref}
                    onChange={handleMaxPrice}></input>
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
                  <input type='text' placeholder='1000' value={minMaxPrice[0]} className={styles.Price__input}></input>
                  <span> ~ </span>
                  <input type='text' placeholder='500,000' value={minMaxPrice[1]} className={styles.Price__input}></input>
                  <button className={styles.Price__submit} onClick={()=>{handleSubmitPrice(minMaxPrice[0],minMaxPrice[1])}}>적용</button>
                </div>
                </div>
            </div>
    )
}

//분위기 Modal
function Atmosphere({handleSellectedTags}:handleSellectedTagsType){

    const atmolist = [["데이트","가족모임","단체회식"],["조용한","전통적인","트렌디한"],["룸 형식","테라스","주차 가능"],["예약 필요 없음"]]

    return(
        <div className={styles.atmo__carrier}>
            <div className={styles.atmo__container}>
                {
                    atmolist.map((line)=>{
                        return(
                            <div className={styles.atmo__line}>
                                {
                                    line.map((atmo)=>{
                                        return(<div className={styles.atmo__item} onClick={()=>{handleSellectedTags(atmo)}}>{atmo}</div>)
                                    })}
                            </div>)})
                }
            </div>
        </div>
    )
}