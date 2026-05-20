"use client"
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import axios from 'axios';

export default function SearchPage() {

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);  
    const [isTagSearchOpen,setIsTagSearchOpen] = useState<boolean>(false)

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
            <h6 className={styles.tagSearch__title} onClick={()=>{
            if(isTagSearchOpen == true){
                setIsTagSearchOpen(false) 
                console.log(isTagSearchOpen)
            }
            else{setIsTagSearchOpen(true)
                console.log(isTagSearchOpen)
            }
        }}>태그로 검색하기</h6>
        <div className={`${styles.tagSearchContainer} ${isTagSearchOpen ? styles.show:null}`} >
        <TagSearch/>
        </div>
        </main>
    );
}

function TagSearch(){
    const tags:string[] = ["지역","음식 종류","가격","분위기"]
    const [activeTag,setActiveTag] = useState<string>("")//현재 클릭한 태그 저장
    const [sellectedTags,setSellectedTags] = useState<string[]>([])
    const [PriceRange,setPriceRange] = useState({min:0,max:0})
    const scrollRef = useRef<HTMLDivElement>(null)

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
                    top: 560,
                    left: 0,
                    behavior: 'smooth'
            })
        }
        else if(activeTag == "가격"){
            content.scrollTo({
                    top: 1150,
                    left: 0,
                    behavior: 'smooth'
            })
        }
        else if(activeTag == "분위기"){
            content.scrollTo({
                    top: 1700,
                    left: 0,
                    behavior: 'smooth'
            })
        }
    }

    const handleSellectedTags = (tag:string):void => {
        if(sellectedTags.includes(tag) == false){
        let copy = [...sellectedTags]
        copy = copy.concat(tag)
        setSellectedTags(copy)}
    }

    const deleteTags = (tag:string) => {
        let copy = [...sellectedTags];
        copy = copy.filter((e)=>{return(e!==tag)})
        setSellectedTags(copy)
    }

    useEffect(()=>(handleScroll()),[activeTag])
    return(
        <div className='tagSearch'>
        <div className={styles.tagSearch__tags}>
           {
            tags.map((a,i)=>{
                return(
                    <div onClick={()=>{setActiveTag(a);}} className={`${styles.tagSearch__tag} ${activeTag == a ? styles.red : '' }`}>
                        <div>{a}</div>
                    </div>
                )
            })
           }
        </div>
        <div className={styles.tagSearch__bar}></div>
        <div ref={scrollRef} className={styles.scrollableContent}>
        <Region handleSellectedTags={handleSellectedTags}></Region>
        <div className={styles.devider}></div>
        <Food handleSellectedTags={handleSellectedTags}></Food>
        <div className={styles.devider}></div>
        <Price handleSellectedTags={handleSellectedTags}/>
        <div className={styles.devider}></div>
        <Atmosphere handleSellectedTags={handleSellectedTags}/>
        </div>

        <div className={styles.tagSearch__submit}>
            <div className={styles.tagSearch__iconAndTags}>
                <div className={styles.tagSearch__trashcan}></div>
                {
                    sellectedTags.map((tag)=>{
                        return(<div className={styles.tagSearch__selectedTag}>{tag}
                        <span className={styles.tagSearch__tagDel} onClick={()=>{deleteTags(tag)}}> x</span>
                        </div>)})
                }
            </div>
            <div className={styles.tagSearch__submitBtns}>
            <button className={styles.tagSearch__apply}><span>적용하기</span></button>
            <button className={styles.tagSearch__close}>닫기</button>
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

interface Name{
    regionName: string;
}

interface handleSellectedTagsType{
    handleSellectedTags: (tag:string)=>void;
}

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
    regionName:Name;
    handleSellectedTags:handleSellectedTagsType;
}

function SpecificRegion({regionName,handleSellectedTags}:SpecificRegionProps){ 

    const [region,setRegion] = useState<a[]|null>(null) 
    const regions = {서울:1,경기:2,인천:3,부산:4,강원:5,대전:6,충북:7,충남:8,경남:9,대구:10,경북:11,울산:12,전남:13,광주:14,전북:15,제주:16}
    const getRegion = () => {
    axios.get(`http://138.2.124.34:8000/api/regions?parent_id=${regions[regionName]}`)
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
                {/* 이 부분이 수정되었습니다. */}
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

function Food({handleSellectedTags}:handleSellectedTagsType){
    const cultureTags:string[][] = [["한식","중식","일식","양식"],["인도","동남아시아","중동","아프리카"],["양식","북미","남미","북유럽"],["동유럽","컨템포러리(퓨전)"]]
    const foodTags:string[] = ["고기","해산물","채소","디저트","음료","밥류","국물류/스튜류","면류","빵류"]

    return(
        <div className={styles.Food__container}>
            <button className={styles.reset}>초기화</button>
            <img className={styles.Food__mapImg} src="../images/지도.png"/>
            <div className={styles.Food__tagContainer}>
            {
                cultureTags.map((tags)=>{
                    return(
                    <div>
                        {tags.map((tag)=>{
                            return(
                                <span className={styles.Food__tag} onClick={()=>{handleSellectedTags(tag)}}>{tag}</span>
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

function Price({handleSellectedTags}:handleSellectedTagsType){
    return(
            <div className={styles.Price__container}>
                <button className={styles.reset}>초기화</button>
                <div className={styles.Price__contents}>

                <div className={styles.Price__rangeGraphic}></div>
                <input type='range' min={0} max={500000} className={styles.Price__range}></input>
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
                <input type='text' placeholder='1000' className={styles.Price__input}></input>
                <span> ~ </span>
                <input type='text' placeholder='500,000' className={styles.Price__input}></input>
                <button className={styles.Price__submit}>적용</button>
                </div>

                </div>
            </div>
    )
}

function Atmosphere({handleSellectedTags}:handleSellectedTagsType){

    const atmolist = [["데이트","가족모임","단체회식"],["조용한","전통적인","트렌디한"],["룸 형식","테라스","주차 가능"],["예약 필요 없음"]]

    return(
        <>
        <div className={styles.atmo__carrier}>
        <button className={styles.reset}>초기화</button>
        
            <div className={styles.atmo__container}>
                {
                    atmolist.map((line)=>{
                        return(
                            <div className={styles.atmo__line}>
                                {
                                    line.map((atmo)=>{
                                        return(<div className={styles.atmo__item} onClick={()=>{handleSellectedTags(atmo)}}>{atmo}</div>)
                                    })}
                            </div>
                        )})
                }
            </div>
            </div>
        </>
    )
}