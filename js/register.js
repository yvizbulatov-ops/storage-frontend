// ============================================
// РЕГИСТРАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, не залогинен ли уже пользователь
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            if (confirm(`Вы уже вошли как ${userData.name}. Хотите выйти и зарегистрировать нового пользователя?`)) {
                localStorage.removeItem('user');
            } else {
                window.location.href = 'index.html';
                return;
            }
        } catch (e) {
            localStorage.removeItem('user');
        }
    }
    
    // Автофокус на поле фамилии
    document.getElementById('userName').focus();
    
    // Обработка Enter на всех полях
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = Array.from(document.querySelectorAll('input'));
                const index = inputs.indexOf(this);
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else {
                    register();
                }
            }
        });
    });
});

/**
 * Основная функция регистрации
 */
function register() {
    // Получаем данные формы
    const name = document.getElementById('userName').value.trim();
    const department = document.getElementById('department').value.trim();
    const section = document.getElementById('section').value.trim();
    const email = document.getElementById('email').value.trim();
    // Очищаем предыдущие ошибки
    clearErrors();
    
    // Валидация
    let isValid = true;
    
    if (!name) {
        showError('nameError');
        document.getElementById('userName').classList.add('error-input');
        isValid = false;
    }
    
    if (!department) {
        showError('departmentError');
        document.getElementById('department').classList.add('error-input');
        isValid = false;
    }
    
    if (!section) {
        showError('sectionError');
        document.getElementById('section').classList.add('error-input');
        isValid = false;
    }

    if (!email) {
        showError('emailError');
        document.getElementById('email').classList.add('error-input');
        isValid = false;
    }
    
    if (!isValid) {
        const firstError = document.querySelector('.error-message.show');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Блокируем кнопку и показываем загрузку
    const button = document.querySelector('.btn-register');
    button.disabled = true;
    button.textContent = '⏳ Регистрация...';
    showLoading('Регистрация пользователя...');
    
    // =============================================
    // ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩУЮ ФУНКЦИЮ sendPostRequest
    // =============================================
    sendPostRequest('register', {
        name: name,
        department: department,
        section: section,
        email: email
    })
    .then(data => {
        hideLoading();
        button.disabled = false;
        button.textContent = 'Зарегистрироваться';
        
        console.log('Ответ сервера:', data);
        
        if (data.status === 'success') {
            const successMsg = document.getElementById('successMessage');
            successMsg.classList.add('show');
            document.getElementById('registerForm').style.opacity = '0.5';
            
            setTimeout(() => {
                window.location.href = 'index.html?registered=true';
            }, 3000);
            
        } else {
            const errorMessage = data.message || 'Ошибка регистрации';
            
            if (errorMessage.includes('уже существует') || 
                errorMessage.includes('already exists') ||
                errorMessage.toLowerCase().includes('exists')) {
                showError('nameError', 'Пользователь с такой фамилией уже зарегистрирован');
                document.getElementById('userName').classList.add('error-input');
            } else {
                alert('❌ ' + errorMessage);
            }
        }
    })
    .catch(error => {
        hideLoading();
        button.disabled = false;
        button.textContent = 'Зарегистрироваться';
        
        console.error('Ошибка регистрации:', error);
        
        let errorMessage = 'Ошибка подключения к серверу';
        if (error.message) {
            errorMessage = error.message;
        }
        
        alert('❌ ' + errorMessage);
    });
}

/**
 * Показать ошибку для поля
 */
function showError(elementId, customMessage) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.classList.add('show');
        if (customMessage) {
            errorEl.textContent = customMessage;
        }
    }
}

/**
 * Очистить все ошибки
 */
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(el => {
        el.classList.remove('show');
        if (el.id === 'nameError') el.textContent = 'Пожалуйста, введите фамилию';
        if (el.id === 'departmentError') el.textContent = 'Укажите отдел';
        if (el.id === 'sectionError') el.textContent = 'Укажите секцию';
    });
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error-input');
    });
    
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.classList.remove('show');
    }
    
    const form = document.getElementById('registerForm');
    if (form) {
        form.style.opacity = '1';
    }
}