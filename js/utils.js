// ============================================
// УПРАВЛЕНИЕ ЭКРАНАМИ
// ============================================

function showScreen(screenId) {
  var screens = ['loadingScreen', 'searchScreen', 'resultsScreen', 'confirmScreen'];
  for (var i = 0; i < screens.length; i++) {
    var el = document.getElementById(screens[i]);
    if (el) {
      if (screens[i] === screenId) {
        el.classList.remove('hidden');
        el.style.display = 'flex';
      } else {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    }
  }
}

function showLoading(text) {
  var el = document.getElementById('loadingText');
  if (el) {
    el.textContent = text || 'Загрузка...';
  }
  showScreen('loadingScreen');
}

function hideLoading() {
  showScreen('searchScreen');
}