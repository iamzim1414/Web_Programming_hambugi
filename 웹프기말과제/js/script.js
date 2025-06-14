document.getElementById("randomBtn").addEventListener("click", () => {
  showLoading(() => {
    const randId = Math.floor(Math.random() * 5) + 1;
    location.href = `detail.html?id=${randId}`;
  });
});

document.querySelectorAll(".group-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showLoading2(() => {
      const group = btn.dataset.group;
      showList(group);
    });
  });
});

// MBTI 드롭다운 관련 코드
const validMbti = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

// MBTI 드롭다운 생성
function createMbtiDropdown() {
  const mbtiInput = document.getElementById("mbtiInput");
  const mbtiSection = document.querySelector(".mbti-section");
  
  // 드롭다운 컨테이너 생성
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "mbti-dropdown-container";
  dropdownContainer.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: none;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    width: 320px;
    z-index: 1000;
    overflow: hidden;
  `;
  
  // MBTI 옵션들 추가
  validMbti.forEach(mbti => {
    const option = document.createElement("div");
    option.className = "mbti-option";
    option.textContent = mbti;
    option.style.cssText = `
      padding: 12px;
      cursor: pointer;
      text-align: center;
      transition: background-color 0.2s;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
      color: #333;
      font-weight: 500;
    `;
    
    // 마우스 호버 효과
    option.addEventListener("mouseenter", () => {
      option.style.backgroundColor = "#e8f0ff";
      option.style.color = "#002E6E";
    });
    
    option.addEventListener("mouseleave", () => {
      option.style.backgroundColor = "white";
      option.style.color = "#333";
    });
    
    // 클릭시 선택
    option.addEventListener("click", () => {
      mbtiInput.value = mbti;
      dropdownContainer.style.display = "none";
      // 선택 후 바로 추천 받기
      document.getElementById("mbtiBtn").click();
    });
    
    dropdownContainer.appendChild(option);
  });
  
  // 드롭다운을 입력창 아래에 위치시키기
  mbtiSection.style.position = "relative";
  mbtiSection.appendChild(dropdownContainer);
  
  // 입력창 클릭시 드롭다운 표시
  mbtiInput.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = mbtiInput.getBoundingClientRect();
    const parentRect = mbtiSection.getBoundingClientRect();
    dropdownContainer.style.top = (rect.bottom - parentRect.top + 5) + "px";
    dropdownContainer.style.left = (rect.left - parentRect.left) + "px";
    dropdownContainer.style.display = "grid";
  });
  
  // 입력창 포커스시에도 드롭다운 표시
  mbtiInput.addEventListener("focus", (e) => {
    e.stopPropagation();
    const rect = mbtiInput.getBoundingClientRect();
    const parentRect = mbtiSection.getBoundingClientRect();
    dropdownContainer.style.top = (rect.bottom - parentRect.top + 5) + "px";
    dropdownContainer.style.left = (rect.left - parentRect.left) + "px";
    dropdownContainer.style.display = "grid";
  });
  
  // 다른 곳 클릭시 드롭다운 숨기기
  document.addEventListener("click", (e) => {
    if (!mbtiSection.contains(e.target)) {
      dropdownContainer.style.display = "none";
    }
  });
  
  // 입력창에 입력시 필터링
  mbtiInput.addEventListener("input", (e) => {
    const value = e.target.value.toUpperCase();
    const options = dropdownContainer.querySelectorAll(".mbti-option");
    
    options.forEach(option => {
      if (option.textContent.includes(value)) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
    
    // 입력이 있으면 드롭다운 표시
    if (value) {
      dropdownContainer.style.display = "grid";
    }
  });
}

// MBTI 확인
document.getElementById("mbtiBtn").addEventListener("click", () => {
  const mbti = document.getElementById("mbtiInput").value.trim().toUpperCase();

  if (!validMbti.includes(mbti)) {
    alert("유효한 MBTI를 입력하세요 (예: INFP, ESTJ 등)");
    return;
  }

  showLoading2(() => {
    showList(mbti);
  });
});

function showLoading(callback) {
  const loading = document.getElementById("loading");
  loading.classList.add("hidden");
  setTimeout(() => {
  loading.classList.remove("hidden");
   setTimeout(() => {
     loading.classList.add("hidden");
     callback();
   }, 1500);
  },50);
}

function showLoading2(callback) {
  const loading2 = document.getElementById("loading2");
  loading2.classList.add("hidden");
  setTimeout(() => {
  loading2.classList.remove("hidden");
   setTimeout(() => {
     loading2.classList.add("hidden");
     callback();
   }, 1500);
  },50);
}

function showList(filter) {
  const groupMap = {
    senior: "선배",
    junior: "후배",
    friend: "동기",
    alone: "혼자"
  };
  const actualFilter = groupMap[filter] || filter;

  fetch("data/restaurants.json")
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item => item.tags.includes(actualFilter));
      const container = document.getElementById("resultList");
      container.innerHTML = "";

      filtered.forEach(item => {
        const div = document.createElement("div");
       div.innerHTML = `
        <img src="${item.image1 && item.image1.trim() !== '' ? item.image1 : 'images/부기1.png'}" alt="${item.name}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 0.5rem;">
        <strong>${item.name}</strong><br>
        ${item.address}<br>
        <button onclick="location.href='detail.html?id=${item.id}'">자세히 보기</button>
      `;

        div.classList.add("result-card");
        container.appendChild(div);
      });
    });
}


function searchRestaurant() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultContainer = document.getElementById("searchResults");

  if (!keyword) {
    resultContainer.innerHTML = '<div class="no-result-message">검색어를 입력하세요.</div>';
    return;
  }

  fetch("data/restaurants.json")
    .then(res => res.json())
    .then(data => {
      const results = data.filter(r => {
        const inName = r.name.toLowerCase().includes(keyword);
        const inAddress = r.address.toLowerCase().includes(keyword);
        const inMenu = r.menu.some(item => item.name.toLowerCase().includes(keyword));
        return inName || inAddress || inMenu;
      });

      if (results.length === 0) {
        resultContainer.innerHTML = '<div class="no-result-message">검색 결과가 없습니다.</div>';
        return;
      }

      resultContainer.innerHTML = results.map(r => `
        <div class="restaurant-item" style=" padding: 1rem 1rem 1rem 2rem; margin: 0.5rem; border-radius: 16px;">
          <h3>${r.name}</h3>
          <p>${r.address}</p>
          <button class="light-blue-btn" onclick="goToDetail(${r.id})">상세보기</button>
        </div>
      `).join("");
    });
}

function goToDetail(id) {
  if (!id) {
    console.error("상세 페이지로 이동할 ID가 없습니다.");
    return;
  }


  // detail.html로 이동
  location.href = `detail.html?id=${id}`;
}

// 엔터 키로 검색 실행
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchRestaurant();
    }
  });
  
  // MBTI 드롭다운 초기화
  createMbtiDropdown();
});

// 엔터 키로 mbti입력받음
document.addEventListener("DOMContentLoaded", () => {
  const mbtiInput = document.getElementById("mbtiInput");
  mbtiInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("mbtiBtn").click();
    }
  });
});
