// detail.js

const params = new URLSearchParams(location.search);
const id = parseInt(params.get("id"));  // URL에서 식당 ID 추출

// 영업시간 포맷팅 함수
function formatBusinessHours(hours) {
  if (!hours) return "정보 없음";

  let hoursArray;

  // 문자열 형태의 배열 처리
  if (typeof hours === 'string' && hours.includes('[') && hours.includes(']')) {
    try {
      hoursArray = eval(hours);  // 문자열을 실제 배열로 변환
    } catch (e) {
      console.error('영업시간 파싱 에러:', e);
      return hours;
    }
  } else if (Array.isArray(hours)) {
    hoursArray = hours;
  } else {
    return hours;
  }

  const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
  const hoursByDay = {};

  // 각 요일별 시간 정리
  hoursArray.forEach(item => {
    const dayMatch = item.match(/^([월화수목금토일])[:：]/);
    if (dayMatch) {
      const day = dayMatch[1];

      if (item.includes('휴무')) {
        hoursByDay[day] = '휴무';
      } else {
        const timeMatch = item.match(/(\d{1,2}[:：]\d{2})\s*[-~]\s*(\d{1,2}[:：]\d{2})/);
        if (timeMatch) {
          const openTime = timeMatch[1].replace('：', ':');
          const closeTime = timeMatch[2].replace('：', ':');
          hoursByDay[day] = `${openTime} - ${closeTime}`;
        }
      }
    }
  });

  // 정리된 영업일, 휴무일 분리
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

  const times = operatingDays.map(d => d.time);
  const uniqueTimes = [...new Set(times)];

  // 전 요일 같은 시간대일 경우
  if (uniqueTimes.length === 1 && operatingDays.length > 0) {
    if (operatingDays.length === 7) {
      return `매일 ${uniqueTimes[0]}`;
    } else if (operatingDays.length === 6 && closedDays.length === 1) {
      return `${uniqueTimes[0]} (${closedDays[0]} 휴무)`;
    } else {
      const days = operatingDays.map(d => d.day);
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      const firstIdx = dayOrder.indexOf(firstDay);
      const lastIdx = dayOrder.indexOf(lastDay);

      if (lastIdx - firstIdx + 1 === days.length) {
        return `${firstDay}~${lastDay} ${uniqueTimes[0]}${closedDays.length > 0 ? ` (${closedDays.join(', ')} 휴무)` : ''}`;
      }
    }
  }

  // 개별 요일 표시
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

// JSON 파일에서 식당 데이터 가져오기
fetch("data/restaurants.json")
  .then(res => res.json())
  .then(data => {
    const restaurant = data.find(r => r.id === id);
    if (!restaurant) {
      document.body.innerHTML = "<h2>존재하지 않는 식당입니다.</h2>";
      return;
    }

    const container = document.getElementById("restaurantDetail");

    // 동적으로 상세 정보 렌더링
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

      <!-- 리뷰 작성 폼 -->
      <div class="review-box" style="margin-left: 3rem;">
        <h3>리뷰 작성</h3>
        <input type="text" id="reviewer" placeholder="이름" /><br>
        <input type="number" id="score" min="1" max="5" placeholder="별점 (1~5)" /><br>
        <textarea id="content" placeholder="후기를 작성하세요" rows="4" cols="40"></textarea><br>
        <button class="blue-btn" onclick="submitReview()">리뷰 등록</button>
      </div>

      <!-- 지도 버튼 및 지도 영역 -->
      <button class="blue-btn" style="margin-left: 20rem;" onclick="openMap()">📍 가게 더 살펴보기</button>
      <div id="map"></div>
    `;
  })
  .catch(error => {
    console.error('에러 발생:', error);
    document.getElementById("restaurantDetail").innerHTML = "<h2>데이터를 불러오는 중 오류가 발생했습니다.</h2>";
  });

// 리뷰 등록 처리 함수
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

  // 입력 필드 초기화
  document.getElementById("reviewer").value = "";
  document.getElementById("score").value = "";
  document.getElementById("content").value = "";
}

// 네이버 지도 새 창 열기
function openMap() {
  const name = document.querySelector("h1").textContent;
  const mapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
  window.open(mapUrl, "_blank");
}

// 홈으로 돌아가기
function goHome() {
  window.location.href = "index.html";
}
