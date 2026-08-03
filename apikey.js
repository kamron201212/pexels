const apiKey = 'cfjpBhd59Dr3k0uwcGDCMHzt9Dd4ooKWox68hySAhBxfCIrkmO7tD4hV'; // Замените на ваш реальный API-ключ Pexels

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const statusMsg = document.getElementById('statusMsg');
const resultsGrid = document.getElementById('resultsGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxAuthor = document.getElementById('lightboxAuthor');
const closeLightbox = document.getElementById('closeLightbox');

let currentQuery = null;
let currentPage = 1;
let isLoading = false;
let hasMore = true;

let allLoadedPhotos = [];
let columnEls = [];
let currentColumnCount = 0;

const skeletonHTML = `
<div role="status" class="flex gap-3 w-full animate-pulse">
    ${Array(4).fill(`
      <div class="flex-1 flex flex-col gap-3">
        <div class="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/></svg>
        </div>
        <div class="w-full h-56 bg-gray-200 rounded-lg"></div>
      </div>
    `).join('')}
    <span class="sr-only">Loading...</span>
</div>`;

// Сколько колонок показывать в зависимости от ширины окна
function getColumnCount() {
  const width = window.innerWidth;
  if (width >= 768) return 4; // md
  if (width >= 640) return 3; // sm
  return 2;                   // мобильные
}

// Создаёт нужное число пустых div-колонок внутри resultsGrid
function setupColumns() {
  currentColumnCount = getColumnCount();
  resultsGrid.innerHTML = '';
  columnEls = [];

  for (let i = 0; i < currentColumnCount; i++) {
    const col = document.createElement('div');
    col.className = 'flex flex-col gap-3 flex-1 min-w-0';
    resultsGrid.appendChild(col);
    columnEls.push(col);
  }
}

// Находит колонку с наименьшей текущей высотой — именно в неё пойдёт следующее фото
function getShortestColumn() {
  return columnEls.reduce((shortest, col) =>
    col.offsetHeight < shortest.offsetHeight ? col : shortest
  );
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

async function downloadPhoto(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Ошибка при скачивании:', error);
  }
}

// Закрывает все открытые дропдауны на странице (кроме переданного, если нужно оставить его открытым)
function closeAllDropdowns(exceptMenu = null) {
  document.querySelectorAll('.dropdown-menu').forEach((menu) => {
    if (menu !== exceptMenu) {
      menu.classList.add('hidden');
      const card = menu.closest('.photo-card');
      const arrow = card?.querySelector('.dropdown-arrow');
      arrow?.classList.remove('rotate-180');
    }
  });
}

// Один делегированный обработчик на документ — закрывает дропдаун при клике вне его
document.addEventListener('click', () => {
  closeAllDropdowns();
});

function createPhotoCard(photo) {
  const photoCard = document.createElement('div');
  photoCard.className = 'photo-card group relative cursor-pointer overflow-hidden rounded-lg';

  photoCard.innerHTML = `
    <img src="${photo.src.medium}" alt="${photo.alt || 'Фото'}" class="w-full h-auto rounded-lg z-10 block" style="aspect-ratio: ${photo.width} / ${photo.height};">
    <div class="absolute inset-0 flex flex-col justify-between items-stretch p-2 z-30 pointer-events-none">

      <!-- Верхний блок: кнопка с выпадающим меню, появляется при наведении на карточку -->
      <div class="dropdown-wrapper relative self-end opacity-0 group-hover:opacity-100 transition-opacity truncate translate-x-4 group-hover:translate-x-0 transition-transform duration-300 ease-out pointer-events-auto">
        <button type="button" class="dropdown-toggle-btn inline-flex items-center justify-center text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
          Dropdown button
          <svg class="dropdown-arrow transition-transform duration-300 ease-in-out w-4 h-4 ms-1.5 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
        </button>
        <div class="dropdown-menu hidden absolute right-0 mt-2 z-40 bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44">
          <ul class="p-2 text-sm text-body font-medium">
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Dashboard</a>
            </li>
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Settings</a>
            </li>
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Earnings</a>
            </li>
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Sign out</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Нижняя панель: автор + кнопка скачивания -->
      <div class="info-panel backdrop-blur-sm text-white text-lg p-2 rounded-b-lg flex justify-between items-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-150 ease-out">
        <span class="truncate -translate-x-4 group-hover:translate-x-0 transition-transform duration-300 delay-130 ease-in-out">
          ${photo.photographer}
        </span>
        <div class="backdrop-blur-[4px] flex justify-center items-center rounded-full h-auto shrink-0 truncate translate-x-4 group-hover:translate-x-0 transition-transform duration-300 delay-150 ease-in-out group-hover:backdrop-blur-lg">
          <button type="button" class="download-btn border flex text-center items-center justify-center rounded-full w-[90px] h-8 cursor-pointer text-white">Скачать</button>
        </div>
      </div>

    </div>
  `;

  // Открытие/закрытие карточки — лайтбокс
  photoCard.addEventListener('click', () => {
    lightboxImg.src = photo.src.large;
    lightboxAuthor.textContent = `Автор: ${photo.photographer}`;
    lightbox.classList.remove('hidden');
  });

  // Скачивание фото
  const downloadBtn = photoCard.querySelector('.download-btn');
  downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadPhoto(photo.src.original, `pexels-${photo.id}.jpg`);
  });

  // Переключение дропдауна
  const dropdownToggleBtn = photoCard.querySelector('.dropdown-toggle-btn');
  const dropdownMenu = photoCard.querySelector('.dropdown-menu');
  const dropdownArrow = photoCard.querySelector('.dropdown-arrow');

  dropdownToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // не открывать лайтбокс и не всплывать до document-обработчика
    const isHidden = dropdownMenu.classList.contains('hidden');
    closeAllDropdowns(); // закрыть все остальные открытые дропдауны
    if (isHidden) {
      dropdownMenu.classList.remove('hidden');
      dropdownArrow.classList.add('rotate-180');
    }
  });

  // Клик внутри самого меню не должен закрывать его раньше времени
  dropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  return photoCard;
}

function renderPhotos(photos) {
  photos.forEach(photo => {
    allLoadedPhotos.push(photo);
    const photoCard = createPhotoCard(photo);
    getShortestColumn().appendChild(photoCard);
  });
}

closeLightbox.addEventListener('click', () => {
  lightbox.classList.add('hidden');
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.add('hidden');
  }
});

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

loadMoreBtn.addEventListener('click', () => {
  loadphotos(false);
});

window.addEventListener('scroll', () => {
  const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
  if (scrolledToBottom) {
    loadphotos(false);
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newCount = getColumnCount();
    if (newCount !== currentColumnCount) {
      setupColumns();
      allLoadedPhotos.forEach(photo => {
        const card = createPhotoCard(photo);
        getShortestColumn().appendChild(card);
      });
    }
  }, 200);
});

loadphotos(true); // Загрузка первых фото при старте страницы