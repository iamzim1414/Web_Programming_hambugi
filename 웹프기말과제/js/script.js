// 랜덤 메뉴 추천 버튼 클릭 시 실행
document.getElementById("randomBtn").addEventListener("click", () => {
  showLoading(() => {
    const randId = Math.floor(Math.random() * 100) + 1; // ID 1~5 중 랜덤 선택
    location.href = `detail.html?id=${randId}`;       // 상세 페이지로 이동
  });
});

// 그룹 버튼 클릭 시 그룹별 식당 필터링
document.querySelectorAll(".group-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showLoading2(() => {
      const group = btn.dataset.group;
      showList(group); // 그룹 필터 전달
    });
  });
});

// 유효한 MBTI 목록
const validMbti = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

// MBTI 드롭다운 생성 함수
function createMbtiDropdown() {
  const mbtiInput = document.getElementById("mbtiInput");
  const mbtiSection = document.querySelector(".mbti-section");

  // 드롭다운 컨테이너 요소 생성
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

  // MBTI 항목 생성 및 이벤트 연결
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

    option.addEventListener("mouseenter", () => {
      option.style.backgroundColor = "#e8f0ff";
      option.style.color = "#002E6E";
    });

    option.addEventListener("mouseleave", () => {
      option.style.backgroundColor = "white";
      option.style.color = "#333";
    });

    option.addEventListener("click", () => {
      mbtiInput.value = mbti;
      dropdownContainer.style.display = "none";
      document.getElementById("mbtiBtn").click(); // 선택 후 자동 검색
    });

    dropdownContainer.appendChild(option);
  });

  // 드롭다운 위치 설정 및 화면에 추가
  mbtiSection.style.position = "relative";
  mbtiSection.appendChild(dropdownContainer);

  // 입력창 클릭 시 드롭다운 위치 계산 및 표시
  mbtiInput.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = mbtiInput.getBoundingClientRect();
    const parentRect = mbtiSection.getBoundingClientRect();
    dropdownContainer.style.top = (rect.bottom - parentRect.top + 5) + "px";
    dropdownContainer.style.left = (rect.left - parentRect.left) + "px";
    dropdownContainer.style.display = "grid";
  });

  // 포커스 시 드롭다운 표시
  mbtiInput.addEventListener("focus", (e) => {
    e.stopPropagation();
    const rect = mbtiInput.getBoundingClientRect();
    const parentRect = mbtiSection.getBoundingClientRect();
    dropdownContainer.style.top = (rect.bottom - parentRect.top + 5) + "px";
    dropdownContainer.style.left = (rect.left - parentRect.left) + "px";
    dropdownContainer.style.display = "grid";
  });

  // 외부 클릭 시 드롭다운 숨김
  document.addEventListener("click", (e) => {
    if (!mbtiSection.contains(e.target)) {
      dropdownContainer.style.display = "none";
    }
  });

  // 입력한 텍스트로 필터링
  mbtiInput.addEventListener("input", (e) => {
    const value = e.target.value.toUpperCase();
    const options = dropdownContainer.querySelectorAll(".mbti-option");

    options.forEach(option => {
      option.style.display = option.textContent.includes(value) ? "block" : "none";
    });

    if (value) {
      dropdownContainer.style.display = "grid";
    }
  });
}

// MBTI 추천 버튼 클릭 시 유효성 검사 후 실행
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

// 로딩 효과 함수 1
function showLoading(callback) {
  const loading = document.getElementById("loading");
  loading.classList.add("hidden");
  setTimeout(() => {
    loading.classList.remove("hidden");
    setTimeout(() => {
      loading.classList.add("hidden");
      callback();
    }, 1500);
  }, 50);
}

// 로딩 효과 함수 2
function showLoading2(callback) {
  const loading2 = document.getElementById("loading2");
  loading2.classList.add("hidden");
  setTimeout(() => {
    loading2.classList.remove("hidden");
    setTimeout(() => {
      loading2.classList.add("hidden");
      callback();
    }, 1500);
  }, 50);
}

// 필터 조건에 따라 식당 목록 표시
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

// 키워드로 식당 검색
function searchRestaurant() {
  // 검색 시 MBTI 섹션 숨김
  const mbtiSection = document.querySelector(".mbti-section");
  if (mbtiSection) mbtiSection.classList.add("hidden");
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
        <div class="restaurant-item" style="padding: 1rem 1rem 1rem 2rem; margin: 0.5rem; border-radius: 16px;">
          <h3>${r.name}</h3>
          <p>${r.address}</p>
          <button class="light-blue-btn" onclick="goToDetail(${r.id})">상세보기</button>
        </div>
      `).join("");
    });
}

// 상세 페이지로 이동
function goToDetail(id) {
  if (!id) {
    console.error("상세 페이지로 이동할 ID가 없습니다.");
    return;
  }
  location.href = `detail.html?id=${id}`;
}

// DOM 로드 후 이벤트 바인딩
document.addEventListener("DOMContentLoaded", () => {
  // 검색창에서 Enter 키 입력 시 검색
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

// MBTI 입력창에서 Enter 입력 시 추천 실행
document.addEventListener("DOMContentLoaded", () => {
  const mbtiInput = document.getElementById("mbtiInput");
  mbtiInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("mbtiBtn").click();
    }
  });
});
