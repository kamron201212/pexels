const dropdownHoverbtn = document.getElementById('dropdownHoverButton');
const dropdownhoverMenu = document.getElementById('dropdownHover');
const dropdownhoverArrow = document.getElementById('dropdownhoverArrow'); 
const dropdownB = document.getElementById('dropdownB');
const dropdownM = document.getElementById('dropdownM');
const dropdownA = document.getElementById('dropdownA');
const colocolB = document.getElementById('colocolB');
const colocolM = document.getElementById('colocolM');
const colocolA = document.getElementById('colocolA');
const logoB = document.getElementById('logoB');
const logoM = document.getElementById('logoM');

dropdownHoverbtn.addEventListener('mouseover', () => {
  dropdownhoverMenu.classList.remove('hidden');
  dropdownhoverMenu.classList.add('opacity-100', 'visible', 'translate-y-0');
  dropdownhoverArrow.classList.add('rotate-180');
});


 dropdownHoverbtn.addEventListener('mouseout', () => {
  dropdownhoverMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
  dropdownhoverArrow.classList.remove('rotate-180');
  dropdownhoverMenu.classList.add('hidden');
});

dropdownhoverMenu.addEventListener('mouseover', () => {
  dropdownhoverMenu.classList.remove('hidden');
  dropdownhoverMenu.classList.add('opacity-100', 'visible', 'translate-y-0');
});

dropdownhoverMenu.addEventListener('mouseout', () => {
  dropdownhoverMenu.classList.remove('opacity-100', 'visible', 'translate-y-0');
  dropdownhoverMenu.classList.add('hidden');
});
dropdownB.addEventListener('mouseover', () => {
  dropdownM.classList.remove('hidden');
  dropdownM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

dropdownB.addEventListener('mouseout', () => {
  dropdownM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  dropdownM.classList.add('hidden');
});

dropdownM.addEventListener('mouseover', () => {
  dropdownM.classList.remove('hidden');
  dropdownM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

dropdownM.addEventListener('mouseout', () => {
  dropdownM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  dropdownM.classList.add('hidden');
});
colocolB.addEventListener('mouseover', () => {
  colocolM.classList.remove('hidden');
  colocolM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

colocolB.addEventListener('mouseout', () => {
  colocolM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  colocolM.classList.add('hidden');
});

colocolM.addEventListener('mouseover', () => {
  colocolM.classList.remove('hidden');
  colocolM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

colocolM.addEventListener('mouseout', () => {
  colocolM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  colocolM.classList.add('hidden');
});
logoB.addEventListener('mouseover', () => {
  logoM.classList.remove('hidden');
  logoM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

logoB.addEventListener('mouseout', () => {
  logoM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  logoM.classList.add('hidden');
});

logoM.addEventListener('mouseover', () => {
  logoM.classList.remove('hidden');
  logoM.classList.add('opacity-100', 'visible', 'translate-y-0');
});

logoM.addEventListener('mouseout', () => {
  logoM.classList.remove('opacity-100', 'visible', 'translate-y-0');
  logoM.classList.add('hidden');
});