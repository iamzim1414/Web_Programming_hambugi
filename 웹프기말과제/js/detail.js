// detail.js
const params = new URLSearchParams(location.search);
const id = parseInt(params.get("id"));

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
       <img src="${restaurant.image || 'images/부기1.png'}" alt="${restaurant.name}" class="restaurant-img">
       <div class="restaurant-info">
        <h1>${restaurant.name}</h1>
        <p><strong>주소:</strong> ${restaurant.address}</p>
        <p><strong>전화번호:</strong> ${restaurant.phone}</p>
        <p><strong>영업시간:</strong> ${restaurant.hours}</p>
       </div>
     </div>

      <h2>📋 메뉴</h2>
      <div class="menu-list">
       ${restaurant.menu.map(item => `
         <div class="menu-item">
          <img src="${item.img}" alt="${item.name}">
          <div>
           <strong>${item.name}</strong><br>가격: ${item.price}원
          </div>
         </div>
       `).join("")}
      </div>
      <h2>⭐ 사용자 리뷰 (${(restaurant.reviews?.length || 0)})</h2>
      <div class="review-list">
       ${(restaurant.reviews || []).map (r => `
         <div class="review">
           <strong>${r.name}</strong> - ⭐ ${r.score}<br>
          ${r.content}
        </div>
      `).join("")}
      </div>

      <div class="review-box">
        <h3>리뷰 작성</h3>
        <input type="text" id="reviewer" placeholder="이름" /><br>
        <input type="number" id="score" min="1" max="5" placeholder="별점 (1~5)" /><br>
        <textarea id="content" placeholder="후기를 작성하세요" rows="4" cols="40"></textarea><br>
        <button class="blue-btn" onclick="submitReview()">리뷰 등록</button>
      </div>

      <button class="blue-btn" onclick="openMap()">📍 가게 더 살펴보기</button>
      <div id="map"></div>
    `;
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
