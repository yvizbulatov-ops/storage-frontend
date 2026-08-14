// ============================================
// АВТОРИЗАЦИЯ
// ============================================



/**
 * Основная функция авторизации
 */
function login() {
    const name = document.getElementById('userName').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    
    errorDiv.textContent = '';
    
    if (!name) {
        errorDiv.textContent = '❌ Введите фамилию';
        return;
    }
    
    // Блокируем кнопку на время запроса (хороший тон в веб-разработке)
    const button = document.querySelector('button');
    if (button) button.disabled = true;
    errorDiv.textContent = '⏳ Проверка данных...';
    // ===== ПОКАЗЫВАЕМ ЭКРАН ЗАГРУЗКИ =====
    showLoading('Вход в систему...');

    sendPostRequest('login', {
        name: name,
        password: password || ''
    })
    .then(data => {
       
        hideLoading();
        if (button) button.disabled = false;
        errorDiv.textContent = '';

        if (data.status === 'success') {
            // Защита на случай, если сервер вернул успех, но забыл прикрепить объект user
            var user = data.data.user;
      
                 // Сохраняем пользователя
                  localStorage.setItem('user', JSON.stringify(user));
      
                 // Клиент сам решает, куда идти
                var pageMap = {
                     'admin': 'admin.html',
                     'user': 'user.html',
                     'guest': 'guest.html'
                     };
      
            var redirect = pageMap[user.role] || 'guest.html';
   
             window.location.href = redirect;
        } else {
            errorDiv.textContent = '❌ ' + (data.message || 'Неизвестная ошибка сервера');
        }
    })
    .catch(error => {
        if (button) button.disabled = false;
        console.error('Детали ошибки:', error);
        errorDiv.textContent = '❌ Ошибка: ' + error.message;
    });
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================
var DEV_MODE = false; // ← true = пропускать логин
// Режим отладки


document.addEventListener('DOMContentLoaded', function() {
    
    // ===== РЕЖИМ ОТЛАДКИ: пропускаем логин =====
    if (DEV_MODE) {
        console.log('🐛 Режим отладки: автоматический вход как Иванов');
        
        // Сохраняем пользователя
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: 'Иванов',
            role: 'guest'
        }));
        
        // Сразу переходим на страницу гостя
        window.location.href = 'guest.html';
        return; // ← ВАЖНО: прерываем выполнение
    }
    
    // ===== ОБЫЧНЫЙ ЛОГИН =====
    const nameInput = document.getElementById('userName');
    if (nameInput && CONFIG.DEFAULT_USER) {
        nameInput.value = CONFIG.DEFAULT_USER;
    }
    
    if (nameInput) {
        nameInput.focus();
        nameInput.select();
        
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
});