import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

# 링크 CSV 불러오기
link_df = pd.read_csv("correct_diningcode_links.csv")
urls = link_df['Full URL'].tolist()
results = []

# ✅ API로 상호명 기반 전화번호 + 대표 리뷰 가져오기
def fetch_data_by_name(address):
    try:
        url = "https://im.diningcode.com/API/isearch/"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0"
        }
        data = {
            "query": address,
            "order": "r_score",
            "search_type": "poi_search",
            "mode": "poi",
            "page": "1",
            "size": "10"
        }
        response = requests.post(url, data=data, headers=headers)
        if response.status_code == 200:
            items = response.json().get("result_data", {}).get("poi_section", {}).get("list", [])
            for item in items:
                if address in item.get("road_addr", ""):
                    return {
                        "전화번호": item.get("phone", "정보없음"),
                        "대표리뷰": item.get("display_review", {}).get("review_cont", "리뷰 없음"),
                        "카테고리": item.get("category","정보 없음")
                    }
        return {"전화번호": "정보없음", "대표리뷰": "리뷰 없음", "카테고리": "정보없음"}
    except:
        return {"전화번호": "정보없음", "대표리뷰": "리뷰 없음", "카테고리": "정보없음"}

# ✅ 크롤링 시작
for idx, url in enumerate(urls):
    print(f"🔍 ({idx+1}/{len(urls)}) 처리 중: {url}")
    
    try:
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(res.text, 'html.parser')

        # 상호명
        name = soup.select_one('#div_profile h1')
        name = name.text.strip() if name else ""

        # img url 
        img1 = soup.select_one('#div_profile > div.s-list.pic-grade > div.store-pic > div:nth-child(2) > img')
        img2 = soup.select_one('#div_profile > div.s-list.pic-grade > div.store-pic > div:nth-child(2) > img')
         
        # 메뉴 정보
        menu_items = []
        menu_list = soup.select("div.menu-info.short ul li")

        for li in menu_list:
            name_tag = li.select_one("p.l-txt.Restaurant_MenuItem span")
            price_tag = li.select_one("p.r-txt.Restaurant_MenuPrice")
            
            menu_name = name_tag.text.strip() if name_tag else ""
            price = price_tag.text.strip() if price_tag else ""
            
            if menu_name or price:
                menu_items.append(f"{menu_name} - {price}")

        #영업시간
        # 오늘 운영시간
        all_hours = []
        today_hours_tag = soup.select_one("div.busi-hours-today > ul > li > p.r-txt")
        all_hours.append(f"목: {today_hours_tag.text.strip('영업시간 ')}")    

        # 요일별 전체 운영시간
        
        rows = soup.select("div.busi-hours ul li")

        for row in rows:
            day = row.select_one("p.l-txt")
            day_text = day.text.strip()
            match = re.search(r'\((.*?)\)', day_text)
            day = match.group(1) if match else ""
            hours = row.select_one("p.r-txt")
            if day and hours:
                all_hours.append(f"{day}: {hours.text.strip()}")


        # 주소
        address_parts = soup.select('#div_profile ul > li.locat > a')
        address = " ".join([a.text.strip() for a in address_parts[:4]])

        # 평점들
        def extract_ratings(soup):
            맛, 가격, 응대 = 0.0, 0.0, 0.0
            point_section = soup.select_one('p.point-detail')
            if point_section:
                children = point_section.find_all(['span', 'i'])
                label = None
                for tag in children:
                    if tag.name == 'span':
                        label = tag.text.strip()
                    elif tag.name == 'i' and label:
                        score = float(tag.text.strip()) if tag.text.strip().replace('.', '', 1).isdigit() else 0.0
                        if '맛' in label:
                            맛 = score
                        elif '가격' in label:
                            가격 = score
                        elif '응대' in label:
                            응대 = score
                        label = None
            return 맛, 가격, 응대
        
        # 평점들
        맛평점, 가격평점, 응대평점 = extract_ratings(soup)
        평균평점 = round((맛평점 + 가격평점 + 응대평점) / 3, 2) if any([맛평점, 가격평점, 응대평점]) else 0.0



        # 분위기 태그 & 상세정보
        분위기태그 = soup.select_one('ul.app-arti li:nth-child(2)')
        분위기태그 = 분위기태그.text.strip() if 분위기태그 else ""
        
        



        

        # 🔑 API 호출 (상호명 기반)
        api_info = fetch_data_by_name(address)

        results.append({
            "상호명": name,
            "대표사진1" : img1,
            "대표사진2" : img2,
            "주소": address,
            "맛 평점": 맛평점,
            "가격 평점": 가격평점,
            "응대 평점": 응대평점,
            "평균 평점": 평균평점,
            "전화번호": api_info["전화번호"],
            "대표 리뷰": api_info["대표리뷰"],
            "카테고리": api_info["카테고리"],
            "분위기 태그": 분위기태그,
            "메뉴 정보" : menu_items,
            "링크": url,
            
            "운영시간" : all_hours
        })

        time.sleep(1)

    except Exception as e:
        print(f"⚠️ 오류 발생: {e}")
        continue

# 저장
df = pd.DataFrame(results)
df.to_csv("통합_맛집정보.csv", index=False, encoding="utf-8-sig")
print("✅ 완료 및 CSV 저장!")
