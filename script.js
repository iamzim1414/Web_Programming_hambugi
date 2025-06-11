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

//mbti확인
document.getElementById("mbtiBtn").addEventListener("click", () => {
  const mbti = document.getElementById("mbtiInput").value.trim().toUpperCase();

  const validMbti = [
    "ISTJ", "ISFJ", "INFJ", "INTJ",
    "ISTP", "ISFP", "INFP", "INTP",
    "ESTP", "ESFP", "ENFP", "ENTP",
    "ESTJ", "ESFJ", "ENFJ", "ENTJ"
  ];

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
        <div class="restaurant-item">
          <h3>${r.name}</h3>
          <p>${r.address}</p>
          <button class="light-blue-btn" onclick="goToDetail(${r.id})">상세보기</button>
        </div>
      `).join("");
    });
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
});

//엔터 키로 mbti입력받음
document.addEventListener("DOMContentLoaded", () => {
  const mbtiInput = document.getElementById("mbtiInput");
  mbtiInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("mbtiBtn").click();
    }
  });
});
