// 랜덤 버튼 클릭 시 무작위 식당으로 이동
document.getElementById("randomBtn").addEventListener("click", () => {
  showLoading(() => {
    const randId = Math.floor(Math.random() * 5) + 1;  // ID 1~5 중 무작위
    location.href = `detail.html?id=${randId}`;
  });
});

// 그룹별 추천 버튼에 클릭 이벤트 등록
document.querySelectorAll(".group-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showLoading2(() => {
      const group = btn.dataset.group;
      showList(group);
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

  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "mbti-dropdown-container";
  dropdownContainer.style.cssText = `...`;  // 스타일 생략

  // 옵션 동적 생성
  validMbti.forEach(mbti => {
    const option = document.createElement("div");
    option.className = "mbti-option";
    option.textContent = mbti;
    option.style.cssText = `...`;  // 스타일 생략

    // 마우스 호버 시 색상 변화
    option.addEventListener("mouseenter", () => {
      option.style.backgroundColor = "#e8f0ff";
      option.style.color = "#002E6E";
    });

    option.addEventListener("mouseleave", () => {
      option.style.backgroundColor = "white";
      option.style.color = "#333";
    });

    // 클릭 시 입력값 설정 및 추천 실행
    option.addEventListener("click", () => {
      mbtiInput.value = mbti;
      dropdownContainer.style.display = "none";
      document.getElementById("mbtiBtn").click();
    });

    dropdownContainer.appendChild(option);
  });

  // 드롭다운 위치 조정 및 표시 제어
  mbtiSection.style.position = "relative";
  mbtiSection.appendChild(dropdownContainer);

  mbtiInput.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownContainer.style.display = "grid";
  });

  mbtiInput.addEventListener("focus", (e) => {
    e.stopPropagation();
    dropdownContainer.style.display = "grid";
  });

  document.addEventListener("click", (e) => {
    if (!mbtiSection.contains(e.target)) {
      dropdownContainer.style.display = "none";
    }
  });

  mbtiInput.addEventListener("input", (e) => {
    const value = e.target.value.toUpperCase();
    const options = dropdownContainer.querySelectorAll(".mbti-option");
    options.forEach(option => {
      option.style.display = option.textContent.includes(value) ? "block" : "none";
    });
    if (value) dropdownContainer.style.display = "grid";
  });
}

// MBTI 추천 버튼 클릭 시 필터링
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

// 로딩 애니메이션1
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

// 로딩 애니메이션2
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

// 필터 조건에 따라 식당 리스트 표시
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

      // 결과 카드 생성
      filtered.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `
          <img src="${item.image1 && item.image1.trim() !== '' ? item.image1 : 'images/부기1.png'}" alt="${item.name}" style="...">
          <strong>${item.name}</strong><br>
          ${item.address}<br>
          <button onclick="location.href='detail.html?id=${item.id}'">자세히 보기</button>
        `;
        div.classList.add("result-card");
        container.appendChild(div);
      });
    });
}

// 검색 기능
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
        <div class="restaurant-item" style="...">
          <h3>${r.name}</h3>
          <p>${r.address}</p>
          <button class="light-blue-btn" onclick="goToDetail(${r.id})">상세보기</button>
        </div>
      `).join("");
    });
}

// 상세페이지 이동 함수
function goToDetail(id) {
  if (!id) {
    console.error("상세 페이지로 이동할 ID가 없습니다.");
    return;
  }
  location.href = `detail.html?id=${id}`;
}

// 검색창에서 Enter 키 입력 처리
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchRestaurant();
    }
  });

  // 드롭다운 초기화
  createMbtiDropdown();
});

// MBTI 입력창에서도 Enter 처리
document.addEventListener("DOMContentLoaded", () => {
  const mbtiInput = document.getElementById("mbtiInput");
  mbtiInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("mbtiBtn").click();
    }
  });
});
