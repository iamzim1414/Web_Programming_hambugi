// detail.js
const params = new URLSearchParams(location.search);
const id = parseInt(params.get("id"));

// 영업시간 포맷팅 함수
function formatBusinessHours(hours) {
  if (!hours) return "정보 없음";
  
  let hoursArray;
  
  // 문자열로 된 배열인 경우 파싱
  if (typeof hours === 'string' && hours.includes('[') && hours.includes(']')) {
    try {
      // eval을 사용하여 문자열 배열을 실제 배열로 변환
      hoursArray = eval(hours);
    } catch (e) {
      console.error('영업시간 파싱 에러:', e);
      return hours; // 파싱 실패시 원본 반환
    }
  } else if (Array.isArray(hours)) {
    hoursArray = hours;
  } else {
    return hours; // 일반 문자열인 경우 그대로 반환
  }
  
  // 배열 처리
  const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
  const hoursByDay = {};
  
  hoursArray.forEach(item => {
    // 각 항목에서 요일과 시간 추출
    const dayMatch = item.match(/^([월화수목금토일])[:：]/);
    if (dayMatch) {
      const day = dayMatch[1];
      
      // 휴무일 체크
      if (item.includes('휴무')) {
        hoursByDay[day] = '휴무';
      } else {
        // 시간 추출
        const timeMatch = item.match(/(\d{1,2}[:：]\d{2})\s*[-~]\s*(\d{1,2}[:：]\d{2})/);
        if (timeMatch) {
          const openTime = timeMatch[1].replace('：', ':');
          const closeTime = timeMatch[2].replace('：', ':');
          hoursByDay[day] = `${openTime} - ${closeTime}`;
        }
      }
    }
  });
  
  // 휴무일 제외하고 영업 시간만 추출
  const operatingDays = [];
  const closedDays = [];
  
  dayOrder.forEach(day => {
    if (hoursByDay[day]) {
      if (hoursByDay[day] === '휴무') {
        closedDays.push(day);
      } else {
        operatingDays.push({ day, time: hoursByDay[day] });
      }
    }
  });
  
  // 모든 영업일의 시간이 같은지 확인
  const times = operatingDays.map(d => d.time);
  const uniqueTimes = [...new Set(times)];
  
  if (uniqueTimes.length === 1 && operatingDays.length > 0) {
    // 모든 날 같은 시간
    if (operatingDays.length === 7) {
      return `매일 ${uniqueTimes[0]}`;
    } else if (operatingDays.length === 6 && closedDays.length === 1) {
      return `${uniqueTimes[0]} (${closedDays[0]} 휴무)`;
    } else {
      const days = operatingDays.map(d => d.day);
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      
      // 연속된 요일인지 확인
      const firstIdx = dayOrder.indexOf(firstDay);
      const lastIdx = dayOrder.indexOf(lastDay);
      
      if (lastIdx - firstIdx + 1 === days.length) {
        return `${firstDay}~${lastDay} ${uniqueTimes[0]}${closedDays.length > 0 ? ` (${closedDays.join(', ')} 휴무)` : ''}`;
      }
    }
  }
  
  // 개별 표시
  const formatted = [];
  dayOrder.forEach(day => {
    if (hoursByDay[day] && hoursByDay[day] !== '휴무') {
      formatted.push(`[${day}] ${hoursByDay[day]}`);
    }
  });
  
  if (closedDays.length > 0) {
    formatted.push(`(${closedDays.join(', ')} 휴무)`);
  }
  
  return formatted.join(' ') || hours;
}

fetch("data/restaurants.json")
  .then(res => res.json())
  .then(data => {
    const restaurant = data.find(r => r.id === id);
    if (!restaurant) {
      document.body.innerHTML = "<h2>존재하지 않는 식당입니다.</h2>";
      return;
    }

    const container = document.getElementById("restaurantDetail");
    container.innerHTML = `
      <div class="header-section">
       <img src="${restaurant.image1 && restaurant.image1.trim() !== '' ? restaurant.image1 : 'images/부기1.png'}" alt="${restaurant.name}" class="restaurant-img">
       <div class="restaurant-info">
        <h1>${restaurant.name}</h1>
        <p><strong>주소:</strong> ${restaurant.address}</p>
        <p><strong>전화번호:</strong> ${restaurant.phone}</p>
        <p><strong>영업시간:</strong> ${formatBusinessHours(restaurant.hours)}</p>
       </div>
     </div>

      <h2 style="margin-left: 1rem;">📋 메뉴</h2>
      <div class="menu-grid">
       ${restaurant.menu.map(item => `
         <div class="menu-card">
          <strong>${item.name}</strong>
          <div class="price">가격: ${item.price.toLocaleString()}원</div>
         </div>
       `).join("")}
      </div>
      
      <h2 style="margin-left: 1rem;">⭐ 사용자 리뷰 (${(restaurant.reviews?.length || 0)})</h2>
      <div class="review-list" id="reviews">
       ${(restaurant.reviews || []).map (r => `
         <div class="review">
           <strong>${r.name}</strong> - ⭐ ${r.score}<br>
          ${r.content}
        </div>
      `).join("")}
      </div>

      <div class="review-box" style="margin-left: 3rem;">
        <h3>리뷰 작성</h3>
        <input type="text" id="reviewer" placeholder="이름" /><br>
        <input type="number" id="score" min="1" max="5" placeholder="별점 (1~5)" /><br>
        <textarea id="content" placeholder="후기를 작성하세요" rows="4" cols="40"></textarea><br>
        <button class="blue-btn" onclick="submitReview()">리뷰 등록</button>
      </div>

      <button class="blue-btn" style="margin-left: 20rem;" onclick="openMap()">📍 가게 더 살펴보기</button>
      <div id="map"></div>
    `;
  })
  .catch(error => {
    console.error('에러 발생:', error);
    document.getElementById("restaurantDetail").innerHTML = "<h2>데이터를 불러오는 중 오류가 발생했습니다.</h2>";
  });

function submitReview() {
  const name = document.getElementById("reviewer").value;
  const score = document.getElementById("score").value;
  const content = document.getElementById("content").value;

  if (!name || !score || !content) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  const newReview = `<div class="review">
    <strong>${name}</strong> - ⭐ ${score}<br>${content}
  </div>`;

  document.getElementById("reviews").innerHTML += newReview;

  // 클리어
  document.getElementById("reviewer").value = "";
  document.getElementById("score").value = "";
  document.getElementById("content").value = "";
}

function openMap() {
  // 네이버 지도 검색 링크 사용
  const name = document.querySelector("h1").textContent;
  const mapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
  window.open(mapUrl, "_blank");
}

function goHome() {
  window.location.href = "index.html";
}