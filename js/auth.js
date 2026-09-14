// ============================================
// АВТОРИЗАЦИЯ
// ============================================
var DEV_MODE = false; // ← true = пропускать логин

/**
 * Основная функция авторизации
 */


function login() {
    const name = document.getElementById('userName').value.trim();
   // const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    const button = document.querySelector('button');
    
    // Очищаем предыдущие ошибки
    errorDiv.textContent = '';
    
    // Валидация
    if (!name) {
        errorDiv.textContent = '❌ Введите фамилию';
        return;
    }
    
    // Блокируем кнопку и показываем загрузку
    if (button) button.disabled = true;
    errorDiv.textContent = '⏳ Проверка данных...';
    showLoading('Вход в систему...');
    
    // Таймаут на случай зависания запроса
    const timeoutId = setTimeout(() => {
        hideLoading();
        if (button) button.disabled = false;
        errorDiv.textContent = '❌ Превышено время ожидания сервера';
    }, 15000); // 15 секунд

    // Отправляем запрос
    sendPostRequest('login', {
        name: name,
        password: ''
    })
    .then(data => {
        // Отменяем таймаут
        clearTimeout(timeoutId);
        
        // ВСЕГДА скрываем загрузку и разблокируем кнопку
        hideLoading();
        if (button) button.disabled = false;
        errorDiv.textContent = '';
        
        // Логируем ответ для отладки
        console.log('Ответ сервера:', data);
        
        // Проверяем статус ответа
        if (data.status === 'success') {
            // Проверяем наличие пользователя
            if (!data.data || !data.data.user) {
                errorDiv.textContent = '❌ Ошибка: данные пользователя не получены';
                console.error('Нет данных пользователя в ответе:', data);
                return;
            }
            
            const user = data.data.user;
            
            // Сохраняем пользователя
            localStorage.setItem('user', JSON.stringify(user));
            
            // Определяем страницу для редиректа
            const pageMap = {
                'admin': 'admin.html',
                'user': 'user.html',
                'guest': 'guest.html'
            };
            
            const redirect = pageMap[user.role] || 'guest.html';
            
            console.log(`🔄 Редирект на ${redirect} для роли ${user.role}`);
            
            // Выполняем редирект
            window.location.href = redirect;
            
        } else {
            // Обработка ошибки от сервера
            const errorMessage = data.message || 'Неизвестная ошибка сервера';
            errorDiv.textContent = '❌ ' + errorMessage;
            
            // Дополнительная диагностика
            console.warn('Ошибка авторизации:', {
                status: data.status,
                message: errorMessage,
                data: data.data
            });
        }
    })
    .catch(error => {
        // Отменяем таймаут
        clearTimeout(timeoutId);
        
        // ВСЕГДА скрываем загрузку при ошибке
        hideLoading();
        if (button) button.disabled = false;
        
        // Обработка сетевых ошибок
        console.error('Ошибка запроса:', error);
        
        let errorMessage = 'Ошибка подключения к серверу';
        if (error.message) {
            errorMessage = error.message;
        }
        
        errorDiv.textContent = '❌ ' + errorMessage;
    });
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ
// ============================================
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
        return;
    }
    
    // ===== ОБЫЧНЫЙ ЛОГИН =====
    const nameInput = document.getElementById('userName');
    if (nameInput) {
        // Если есть DEFAULT_USER из конфига
        if (typeof CONFIG !== 'undefined' && CONFIG.DEFAULT_USER) {
            nameInput.value = CONFIG.DEFAULT_USER;
        }
        
        nameInput.focus();
        nameInput.select();
        
        // Обработка нажатия Enter
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
    
    // Проверяем, не залогинен ли уже пользователь
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('👤 Уже есть пользователь:', userData.name);
            // Можно добавить автоматический редирект, если нужно
            // Но лучше оставить на странице логина
        } catch (e) {
            console.warn('Ошибка парсинга пользователя из localStorage');
            localStorage.removeItem('user');
        }
    }
});