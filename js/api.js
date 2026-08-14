


/**
 * Универсальная функция для отправки запросов к Google Apps Script без ошибок CORS
 */
function sendPostRequest(command, additionalParams = {}) {
    // Объединяем команду и данные в один объект для вашего switch(command) на сервере
    
 
    const requestBody = {
        command: command,
        ...additionalParams
    };

    return fetch(CONFIG.SERVER_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            // КРИТИЧЕСКИ ВАЖНО: Используем text/plain для обхода CORS Preflight (OPTIONS)
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }
       

        return response.json();
    });
}

