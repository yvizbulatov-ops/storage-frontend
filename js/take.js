// ============================================
// JS: ВЗЯТЬ КОМПОНЕНТ
// ============================================

var currentUser = null;
var catalog = [];
var currentComponent = '';
var currentQty = 1;


// ============================================
// ЗАГРУЗКА КАТАЛОГА С ЭКРАНОМ ЗАГРУЗКИ
// ============================================

function loadCatalog() {
  console.log('📦 loadCatalog: начало');
  showLoading('Загрузка элементной базы...');
  
  sendPostRequest('getCatalog', {})
    .then(data => {
      console.log('📦 loadCatalog: ответ получен', data);
      if (data.status === 'success') {
        catalog = data.data.catalog || [];
        console.log('✅ Загружено компонентов:', catalog.length);
        showScreen('searchScreen');
        // ... остальной код
      } else {
        console.log('❌ Ошибка:', data.message);
        showMessage('searchMessage', '❌ Ошибка загрузки: ' + data.message, 'error');
        showScreen('searchScreen');
      }
    })
    .catch(error => {
      console.error('❌ loadCatalog: ошибка', error);
      showMessage('searchMessage', '❌ Ошибка загрузки: ' + error.message, 'error');
      showScreen('searchScreen');
    });
}




// ============================================
// АВТОПОДСТАНОВКА
// ============================================

function showSuggestions(query) {
  var list = document.getElementById('componentSuggestions');
  
  if (!query || query.length < 1) {
    list.classList.remove('active');
    list.innerHTML = '';
    return;
  }

  var lowerQuery = query.toLowerCase();
  var suggestions = [];
  
  for (var i = 0; i < catalog.length; i++) {
    var item = catalog[i];
    var name = (item.Название || '').toLowerCase();
    if (name.includes(lowerQuery)) {
      suggestions.push(item);
      if (suggestions.length >= 10) break;
    }
  }

  if (suggestions.length === 0) {
    list.classList.remove('active');
    list.innerHTML = '';
    return;
  }

  list.innerHTML = '';
  for (var i = 0; i < suggestions.length; i++) {
    var item = suggestions[i];
    var name = item.Название || 'Без названия';
    var quantity = item['Общее Кол-во'] || item.quantity || 0;

    var div = document.createElement('div');
    div.className = 'item';
    div.textContent = name + ' (' + quantity + ' шт)';
    
    div.onclick = (function(selected) {
      return function() {
        document.getElementById('componentInput').value = selected.Название || selected.name;
        list.classList.remove('active');
        list.innerHTML = '';
        doSearch();
      };
    })(item);
    
    list.appendChild(div);
  }

  list.classList.add('active');
}

// ============================================
// ПОИСК
// ============================================

function doSearch() {
  var name = document.getElementById('componentInput').value.trim();
  var resultsDiv = document.getElementById('resultsList');
  var list = document.getElementById('componentSuggestions');
  list.classList.remove('active');
  list.innerHTML = '';
  
  if (!name) {
    showMessage('searchMessage', '⚠️ Введите название компонента', 'warning');
    return;
  }

  currentComponent = name;
  
  showMessage('searchMessage', '⏳ Поиск...', 'info');
  document.getElementById('searchBtn').disabled = true;

  var filtered = filterCatalog(catalog, name);
  
  if (filtered.length === 0) {
    showMessage('searchMessage', '❌ Компонент "' + name + '" не найден', 'error');
    document.getElementById('searchBtn').disabled = false;
    return;
  }

  document.getElementById('searchBtn').disabled = false;
  hideMessage('searchMessage');
  
  showResultsScreen(filtered);
}

// ============================================
// ФИЛЬТРАЦИЯ
// ============================================

function filterCatalog(catalog, query) {
  var lowerQuery = query.toLowerCase();
  var result = [];
  for (var i = 0; i < catalog.length; i++) {
    var item = catalog[i];
    var name = (item.Название || '').toLowerCase();
    var id = String(item['№'] || item.id || item.ID || '');
    if (name.includes(lowerQuery) || id === query) {
      result.push(item);
    }
  }
  return result;
}

// ============================================
// ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ
// ============================================

function showResultsScreen(items) {
  document.getElementById('searchScreen').style.display = 'none';
  document.getElementById('resultsScreen').classList.remove('hidden');
  document.getElementById('resultsScreen').style.display = 'flex';
  
  document.getElementById('resultsUserName').textContent = '👤 ' + currentUser.name;
  document.getElementById('resultTitle').textContent = '📦 ' + currentComponent;
  
  var container = document.getElementById('resultsList');
  container.innerHTML = '';
  
  var totalQty = 0;
  for (var i = 0; i < items.length; i++) {
    totalQty += items[i]['Общее Кол-во'] || items[i].quantity || 0;
  }
  
  // Устанавливаем количество на экране результатов
  document.getElementById('resultQty').textContent = 'Доступно: ' + totalQty + ' шт';
  document.getElementById('resultQtyInput').value = 1;
  
  // Статус
  var enough = totalQty >= 1;
  var statusColor = enough ? '#1e7e34' : '#c62828';
  var statusBg = enough ? '#e6f4ea' : '#fce8e6';
  var statusText = enough ? '✅ Доступно' : '❌ Не хватает';
  
  var statusDiv = document.createElement('div');
  statusDiv.style.cssText = 'margin-bottom:12px;padding:10px 12px;border-radius:8px;background:' + statusBg + ';color:' + statusColor + ';font-weight:600;text-align:center;font-size:16px;';
  statusDiv.textContent = statusText + ': ' + totalQty + ' шт';
  container.appendChild(statusDiv);
  
  // Карточки мест
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var name = item.Название || 'Без названия';
    var quantity = item['Общее Кол-во'] || item.quantity || 0;
    var location = item.Комната || item.location || '';
    var id = item['№'] || item.id || item.ID || '';
    var place = item.Место || item.place || '';
    var row = item.Ряд || item.row || '';
    var shelf = item.Полка || item.shelf || '';
    
    var label = (place ? place + ' → ' : '') + (row ? row + shelf : location);
    
    var div = document.createElement('div');
    div.className = 'location-card';
    
    var isAvailable = quantity > 0;
    var btnHtml = isAvailable
      ? '<button class="btn-take" onclick="takeComponent(\'' + id + '\', \'' + name + '\', ' + quantity + ')">📦 Забрать</button>'
      : '<button class="btn-take" disabled>❌ Закончился</button>';
    
    div.innerHTML = 
      '<div class="info">' +
        '<div class="place">📦 ' + label + '</div>' +
        '<div>Доступно: <span class="qty" style="color:' + (isAvailable ? '#1a73e8' : '#ea4335') + '">' + quantity + '</span> шт</div>' +
      '</div>' +
      btnHtml;
    
    container.appendChild(div);
  }
}

// ============================================
// ВЗЯТЬ КОМПОНЕНТ
// ============================================

function takeComponent(componentId, componentName, quantity) {
  if (!componentId) {
    alert('❌ Ошибка: ID компонента не указан');
    return;
  }
 
  var qty = currentQty;
  if (isNaN(qty) || qty <= 0) {
    alert('❌ Введите корректное количество');
    return;
  }
  
  if (qty > quantity) {
    alert('❌ Недостаточно компонентов. Доступно: ' + quantity);
    return;
  }
  showLoading('Забираем компонент...');

  sendPostRequest('takeComponent', {
    userName: currentUser.name,
    componentId: componentId,
    componentName: componentName,
    quantity: qty
  })
  .then(data => {
    hideLoading();
    if (data.status === 'success') {
     
      showConfirmScreen(componentName, qty);
    } else {
      alert('❌ ' + data.message);
    }
  })
  .catch(error => {
    hideLoading();
    alert('❌ Ошибка: ' + error.message);
  });
}

// ============================================
// ЭКРАН ПОДТВЕРЖДЕНИЯ
// ============================================

function showConfirmScreen(componentName, quantity) {
  // Скрываем все экраны
  document.getElementById('searchScreen').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'none';
  
  // Показываем экран подтверждения
  var confirmScreen = document.getElementById('confirmScreen');
  confirmScreen.classList.remove('hidden');
  confirmScreen.style.display = 'flex';
  
  document.getElementById('confirmTitle').textContent = '✅ Компонент взят';
  document.getElementById('confirmMessage').textContent = componentName;
  document.getElementById('confirmDetail').textContent = 'Забрали: ' + quantity + ' шт';
}

// ============================================
// НАЗАД В ЗАВИСИМОСТИ ОТ РОЛИ
// ============================================

function goBackByRole() {
  var user = currentUser;
  var role = user.role || 'guest';
  
  var pageMap = {
    'admin': 'admin.html',
    'user': 'user.html',
    'guest': 'guest.html'
  };
  
  var redirect = pageMap[role] || 'guest.html';
  window.location.href = redirect;
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================================

function showMessage(id, text, type) {
  var el = document.getElementById(id);
  el.textContent = text;
  el.className = 'message message-' + type;
  el.classList.remove('hidden');
}

function hideMessage(id) {
  var el = document.getElementById(id);
  el.classList.add('hidden');
  el.textContent = '';
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // ===== РЕЖИМ ОТЛАДКИ =====
  var DEBUG_MODE = true;
  
  var userData = localStorage.getItem('user');
  if (!userData) {
    console.log('🐛 Режим отладки: вход как Иванов');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Иванов',
      role: 'guest'
    }));
    userData = localStorage.getItem('user');
  }
  currentUser = JSON.parse(userData);
  
  document.getElementById('userNameDisplay').textContent = '👤 ' + currentUser.name;
  
  // Начинаем загрузку
  loadCatalog();
  
  // Обработчики событий
  var input = document.getElementById('componentInput');
  input.addEventListener('input', function(e) {
    showSuggestions(e.target.value);
  });
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });
  input.addEventListener('blur', function() {
    setTimeout(function() {
      var list = document.getElementById('componentSuggestions');
      list.classList.remove('active');
      list.innerHTML = '';
    }, 300);
  });
  
  document.getElementById('searchBtn').addEventListener('click', doSearch);

  // document.getElementById('qtyInput').addEventListener('keypress', function(e) {
  //   if (e.key === 'Enter') doSearch();
  // });
  
  // Выход
  document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
  document.getElementById('resultsLogoutBtn').addEventListener('click', function() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
  
  document.getElementById('backToSearchBtn').addEventListener('click', function() {
    showScreen('searchScreen');
    hideMessage('searchMessage');
    document.getElementById('componentInput').focus();
  });
  
  // Версия
  var versionEl = document.getElementById('frontVersion');
  if (versionEl) versionEl.textContent = 'v1.0.0';
  var buildEl = document.getElementById('buildTime');
  if (buildEl) buildEl.textContent = new Date().toLocaleDateString();

 // ===== КНОПКА "НА СКЛАД" НА ЭКРАНЕ ПОДТВЕРЖДЕНИЯ =====
  document.getElementById('confirmOkBtn').addEventListener('click', function() {
    var user = currentUser;
    var role = user.role || 'guest';
    
    var pageMap = {
      'admin': 'admin.html',
      'user': 'user.html',
      'guest': 'guest.html'
    };
    
    var redirect = pageMap[role] || 'guest.html';
    window.location.href = redirect;
  });

});


// document.getElementById('takeBtn').addEventListener('click', function() {

//   var name = document.getElementById('componentInput').value.trim();
//   var filtered = filterCatalog(catalog, name);
  
//   if (filtered.length === 0) {
//     showMessage('resultsMessage', '❌ Компонент не найден', 'error');
//     return;
//   }
  
//   var item = filtered[0];
//   var id = item['№'] || item.id || item.ID || '';
//   var quantity = item['Общее Кол-во'] || item.quantity || 0;
  
//   if (qty <= 0) {
//     showMessage('resultsMessage', '⚠️ Введите корректное количество', 'warning');
//     return;
//   }
  
//   if (qty > quantity) {
//     showMessage('resultsMessage', '❌ Недостаточно. Доступно: ' + quantity, 'error');
//     return;
//   }
  
//   takeComponent(id, item.Название, qty);
// });