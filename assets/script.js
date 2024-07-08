async function fetchExchangeRates() {
    try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        document.getElementById('error').textContent = `Error fetching exchange rates: ${error.message}`;
        return null;
    }
}

async function fetchExchangeRateHistory(currency) {
    try {
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.serie.slice(0, 10).reverse(); 
    } catch (error) {
        document.getElementById('error').textContent = `Error fetching exchange rate history: ${error.message}`;
        return null;
    }
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';
    resultDiv.textContent = '';

    if (!amount || !currency) {
        errorDiv.textContent = 'Por favor ingrese un monto y seleccione una moneda.';
        return;
    }

    const rates = await fetchExchangeRates();
    if (!rates) return;

    let conversionRate;
    switch (currency) {
        case 'dolar':
            conversionRate = rates.dolar.valor;
            break;
        case 'euro':
            conversionRate = rates.euro.valor;
            break;
        case 'uf':
            conversionRate = rates.uf.valor;
            break;
        default:
            errorDiv.textContent = 'Moneda no soportada.';
            return;
    }

    const convertedAmount = (amount / conversionRate).toFixed(2);
    resultDiv.textContent = `El monto en ${currency.toUpperCase()} es ${convertedAmount}`;

    const history = await fetchExchangeRateHistory(currency);
    if (history) {
        displayHistoryChart(history, currency);
    }
}

function displayHistoryChart(history, currency) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    const labels = history.map(item => new Date(item.fecha).toLocaleDateString());
    const data = history.map(item => item.valor);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Historial de ${currency.toUpperCase()}`,
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}