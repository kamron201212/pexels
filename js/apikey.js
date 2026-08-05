const apiKey = 'cfjpBhd59Dr3k0uwcGDCMHzt9Dd4ooKWox68hySAhBxfCIrkmO7tD4hV'; // Замените на ваш реальный API-ключ Pexels

const statusMsg = document.getElementById('statusMsg');
const resultsGrid = document.getElementById('resultsGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');


let currentQuery = null;
let currentPage = 1;
let isLoading = false;
let hasMore = true;

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

function createPhotoCard(photo) {


  const photoCard = document.createElement('div');
  photoCard.className = 'photo-card group relative cursor-pointer overflow-hidden rounded-lg bg-linear-to-t from-black/90 to-black/80';

  photoCard.innerHTML = `
    <img src="${photo.src.medium}" alt="${photo.alt || 'Фото'}" class="pb-0 w-full  h-auto rounded-lg z-10 block" style="aspect-ratio: ${photo.width} / ${photo.height};">
    <div class="absolute inset-0 flex flex-col justify-between items-stretch z-30 pointer-events-none">
      <div class="dropdown-wrapper group/dropdown relative self-end backdrop-blur-xl  rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-auto translate-x-4 group-hover:translate-x-0 transition-transform delay-130">
        <button type="button" class="dropdown-toggle-btn  inline-flex items-center justify-center text-white bg-brand box-border  hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
          Dropdown button
          <svg class="dropdown-arrow transition-transform duration-300 ease-in-out w-4 h-4 ms-1.5 -me-0.5 group-hover/dropdown:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
        </button>
        <div class="dropdown-menu absolute right-0 z-80 rounded-base backdrop-blur-xl shadow-lg w-[170px] opacity-0 translate-y-2 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:visible transition-all duration-300 ease-in-out">
          <ul class="p-2 text-sm text-body text-white font-medium">
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-black/30 hover:text-heading rounded">Dashboard</a>
            </li>
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-black/30  hover:text-heading rounded">Settings</a>
            </li>
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-black/30 hover:text-heading rounded">Earnings</a>
            </li>
            <li>
              <a href="#" class="inline-flex items-center w-full p-2 hover:bg-black/30 hover:text-heading rounded">Sign out</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Нижняя панель: автор + кнопка скачивания -->
      <div class="info-panel text-white text-lg px-2 h-[50px] rounded-b-lg flex justify-between items-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 delay-150 ease-out  pb-0">
        <span class="truncate -translate-x-4 group-hover:translate-x-0 transition-transform duration-300 delay-130 ease-in-out">
          ${photo.photographer}
        </span>
        <div class="flex justify-center items-center rounded-full h-auto shrink-0 truncate translate-x-4 group-hover:translate-x-0 transition-transform duration-300 delay-150 ease-in-out hover:backdrop-blur-lg">
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

  // Дропдаун открывается по наведению (см. классы group/dropdown в разметке выше).
  // Тут только гасим клик внутри блока с дропдауном, чтобы он не открывал лайтбокс.
  const dropdownWrapper = photoCard.querySelector('.dropdown-wrapper');
  dropdownWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  const dropdownBtn = photoCard.querySelector('.dropdown-toggle-btn');
  const dropdownArrow = photoCard.querySelector('.dropdown-arrow');
  const dropdownMenu = photoCard.querySelector('.dropdown-menu');
dropdownBtn.addEventListener('mouseover', (e) => {  
  e.stopPropagation();
  const dropdownMenu = photoCard.querySelector('.dropdown-menu');
  dropdownMenu.classList.add('opacity-100', 'visible', 'translate-y-0',);
  dropdownArrow.classList.add('rotate-180'); 
  dropdownMenu.classList.remove('absolute');
});
dropdownBtn.addEventListener('mouseout', (e) => {  
  e.stopPropagation();
  const dropdownMenu = photoCard.querySelector('.dropdown-menu');
  dropdownMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
  dropdownArrow.classList.remove('rotate-180');
  dropdownMenu.classList.add('absolute');  
});
dropdownMenu.addEventListener('mouseover', (e) => {  
  e.stopPropagation();
  dropdownMenu.classList.add('opacity-100', 'visible', 'translate-y-0');
  dropdownArrow.classList.add('rotate-180'); 
  dropdownMenu.classList.remove('absolute');
});
dropdownMenu.addEventListener('mouseout', (e) => {  
  e.stopPropagation();
  dropdownMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
  dropdownArrow.classList.remove('rotate-180');
  dropdownMenu.classList.add('absolute');  
});
  return photoCard;
}


loadMoreBtn.addEventListener('click', () => {
  loadphotos(false);
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
