const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const changeB = document.getElementById('changeB');
const changeM = document.getElementById('changeM');
const changeA = document.getElementById('changeA');
const headersearch = document.getElementById('headerSearch');
const headerSearchInput = document.getElementById('headerSearchInput');
const headerSearchBtn = document.getElementById('headerSearchBtn');

let allLoadedPhotos = [];

function renderPhotos(photos) {
  photos.forEach(photo => {
    allLoadedPhotos.push(photo);
    const photoCard = createPhotoCard(photo);
    getShortestColumn().appendChild(photoCard);
  });
}



async function loadphotos(reset) {
  if (isLoading) return;
  if (!reset && !hasMore) return;
  isLoading = true;

  if (reset) {
    currentPage = 1;
    hasMore = true;
    allLoadedPhotos = [];
    setupColumns(); // пересоздаём пустые колонки под новый поиск
  } else {
    currentPage++;
  }

  statusMsg.innerHTML = skeletonHTML;
  statusMsg.classList.remove('hidden');
  loadMoreBtn.disabled = true;

  try {
    const url = currentQuery ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(currentQuery)}&per_page=12&page=${currentPage}`: `https://api.pexels.com/v1/curated?per_page=12&page=${currentPage}`;

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos.length === 0) {
      statusMsg.textContent = reset ? 'Ничего не найдено.' : 'Больше фото нет.';
      loadMoreBtn.classList.add('hidden');
      hasMore = false;
      return;
    }

    statusMsg.classList.add('hidden');
    loadMoreBtn.classList.remove('hidden');
    renderPhotos(data.photos);

  } catch (error) {
    console.error('Ошибка при загрузке фото:', error);
    statusMsg.textContent = 'Произошла ошибка при загрузке фото.';
  } finally {
    isLoading = false;
    loadMoreBtn.disabled = false;
  }
}

searchBtn.addEventListener('click', () => {
  currentQuery = searchInput.value.trim() || null;
  loadphotos(true);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    currentQuery = searchInput.value.trim() || null;
    loadphotos(true);
  }
});

headerSearchBtn.addEventListener('click', () => {
  searchInput.value = headerSearchInput.value;
  currentQuery = headerSearchInput.value.trim() || null;
  loadphotos(true);
});

headerSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    headerSearchBtn.click();
  }
});

changeB.addEventListener('mouseover', () => {
  changeM.classList.remove('hidden');
  changeM.classList.add('opacity-100', 'visible', 'translate-y-0');
  changeA.classList.add('rotate-180');
});

changeB.addEventListener('mouseout', () => {
  changeM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  changeA.classList.remove('rotate-180');
  changeM.classList.add('hidden');
});

changeM.addEventListener('mouseover', () => {
  changeM.classList.remove('hidden');
  changeM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

changeM.addEventListener('mouseout', () => {
  changeM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  changeM.classList.add('hidden');
});

searchInput.addEventListener('input', () => {
  headerSearchInput.value = searchInput.value;
});

function toggleHeaderSearch() {
  const mainSearch = document.getElementById('mainSearch');
  const headerHeight = document.querySelector('header').offsetHeight;
  const showHeaderSearch = mainSearch.getBoundingClientRect().bottom <= headerHeight;

  headersearch.classList.toggle('opacity-0', !showHeaderSearch);
  headersearch.classList.toggle('-translate-y-2', !showHeaderSearch);
  headersearch.classList.toggle('pointer-events-none', !showHeaderSearch);
}

loadMoreBtn.addEventListener('click', () => {
  loadphotos(false);
});


window.addEventListener('scroll', () => {
  toggleHeaderSearch();
  const scrolledTop = window.innerHeight + window.scrollX >= document.body.offsetHeight - 100;
  if (scrolledTop) {
    loadphotos(false);
  }
});

window.addEventListener('resize', toggleHeaderSearch);
toggleHeaderSearch();

loadphotos(true);